#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/update.h>

#include <esp_http_client.h>
#include <esp_https_ota.h>
#include <esp_log.h>
#include <esp_ota_ops.h>
#include <esp_tls.h>

#include <ArduinoJson.h>

#include <chessbot/log.h>
#include <chessbot/util.h>
#include <chessbot/wireless.h>

#define TAG "update"

namespace chessbot {
EventGroupHandle_t otaEvents;
#define FIRST_OTA_CHECK_DONE BIT0

// Max size of the document describing available updates
constexpr int32_t OTA_HTTP_RESP_SIZE = 2048;

void hexStrToBuf(const char* str, uint8_t* buf, int len)
{
    for (int i = 0; i < len; i += 2) {
        *(buf++) = hexCharToInt(str[i]) * 16 + hexCharToInt(str[i + 1]);
    }
}

// Checks if hash string is what is in the currently loaded partition
bool hashMatchesCurrentPartition(const char* hash)
{
    uint8_t currentHash[32];
    CHECK(esp_partition_get_sha256(esp_ota_get_running_partition(), currentHash));

    uint8_t checkHash[32];
    hexStrToBuf(hash, checkHash, 32 * 2);

    printf("Comp with ");
    for (int i = 0; i < 32; i++) {
        printf("%02x", currentHash[i]);
    }

    printf("\nComp with ");
    for (int i = 0; i < 32; i++) {
        printf("%02x", checkHash[i]);
    }

    for (int i = 0; i < 32; i++) {
        if (currentHash[i] != checkHash[i]) {
            return false;
        }
    }

    return true;
}

// The JSON parsing space for the OTA task
JsonDocument otaJson;
char otaHttpResp[OTA_HTTP_RESP_SIZE + 1];

// How often to poll the server for updates in seconds
// Modified whenever a server returns an info.json with a different checkFreq
// Defaults to 1 minute
int32_t checkFreq = 1 * 60;

const char* updateServers[] = { "chess-ota.internal" };

esp_err_t httpEventHandler(esp_http_client_event_t* evt)
{
    switch (evt->event_id) {
    case HTTP_EVENT_ERROR:
        ESP_LOGD(TAG, "HTTP_EVENT_ERROR");
        break;
    case HTTP_EVENT_ON_CONNECTED:
        ESP_LOGD(TAG, "HTTP_EVENT_ON_CONNECTED");
        break;
    case HTTP_EVENT_HEADER_SENT:
        ESP_LOGD(TAG, "HTTP_EVENT_HEADER_SENT");
        break;
    case HTTP_EVENT_ON_HEADER:
        ESP_LOGD(TAG, "HTTP_EVENT_ON_HEADER, key=%s, value=%s", evt->header_key, evt->header_value);
        break;
    case HTTP_EVENT_ON_DATA: {
        ESP_LOGD(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);

        // Will not support chunked data
        if (esp_http_client_is_chunked_response(evt->client)) {
            ESP_LOGD(TAG, "Chunked data :(");
            return ESP_FAIL;
        }

        // Copy response into buffer
        const int64_t respLen = esp_http_client_get_content_length(evt->client);
        memcpy(otaHttpResp, evt->data, MIN(respLen, OTA_HTTP_RESP_SIZE));

        break;
    }
    case HTTP_EVENT_ON_FINISH:
        ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
        break;
    case HTTP_EVENT_DISCONNECTED: {
        ESP_LOGI(TAG, "HTTP_EVENT_DISCONNECTED");
        int mbedtls_err = 0;
        esp_err_t err = esp_tls_get_and_clear_last_error((esp_tls_error_handle_t)evt->data, &mbedtls_err, NULL);
        if (err != 0) {
            ESP_LOGI(TAG, "Last esp error code: 0x%x", err);
            ESP_LOGI(TAG, "Last mbedtls failure: 0x%x", mbedtls_err);
        }

        break;
    }
    case HTTP_EVENT_REDIRECT:
        ESP_LOGD(TAG, "HTTP_EVENT_REDIRECT");
        esp_http_client_set_redirection(evt->client);
        break;
    }
    return ESP_OK;
}

esp_err_t getJsonFromHost(const char* host)
{
    esp_http_client_config_t httpConfig = {};
    httpConfig.host = host;
    httpConfig.path = "/update/chessbot/info.json";
    httpConfig.transport_type = HTTP_TRANSPORT_OVER_TCP;
    httpConfig.event_handler = httpEventHandler;

    esp_http_client_handle_t client = esp_http_client_init(&httpConfig);

    memset(otaHttpResp, 0, sizeof(otaHttpResp));
    esp_err_t err = esp_http_client_perform(client);

    if (err == ESP_OK) {
        printf("Successful HTTP request to %s, status %d, length %d\n", host, esp_http_client_get_status_code(client), (int)esp_http_client_get_content_length(client));
    } else {
        printf("Failed HTTP request to %s\n", host);
        esp_http_client_cleanup(client);
        return err;
    }

    printf("Parsing JSON %s\n", otaHttpResp);
    DeserializationError jerr = deserializeJson(otaJson, otaHttpResp);

    if (jerr) {
        printf("Failed deserializing json from %s because %s\n", host, "");
        esp_http_client_cleanup(client);
        return ESP_FAIL;
    }

    esp_http_client_cleanup(client);
    return ESP_OK;
}

void findUpdate()
{
    for (const char* i : updateServers) {
        printf("Seeking json from host %s\n", i);
        auto err = getJsonFromHost(i);

        if (err != ESP_OK) {
            continue;
        }

        const char* hash = otaJson["hash"];
        const char* url = otaJson["url"];

        bool matches = hashMatchesCurrentPartition(hash);

        esp_ota_img_states_t state;
        CHECK(esp_ota_get_state_partition(esp_ota_get_running_partition(), &state));

        if (matches && state == ESP_OTA_IMG_PENDING_VERIFY) {
            printf("OTA update process finished.\n");
            esp_ota_mark_app_valid_cancel_rollback();

            xEventGroupSetBits(otaEvents, FIRST_OTA_CHECK_DONE);

            return;
        } else if (matches) {
            // No new update, ignore

            xEventGroupSetBits(otaEvents, FIRST_OTA_CHECK_DONE);

            return;
        }

        // There is a new update, but the last one was not successful. Mark it as good anyway to avoid a bad state
        if (state != ESP_OTA_IMG_VALID) {
            esp_ota_mark_app_valid_cancel_rollback();
        }

        printf("Updating to hash %s from hash ", hash);
        uint8_t currentHash[32];
        CHECK(esp_partition_get_sha256(esp_ota_get_running_partition(), currentHash));
        for (int i = 0; i < 32; i++) {
            printf("%02x", currentHash[i]);
        }
        printf("\n");
        

        esp_http_client_config_t config = {};
        config.url = url;
        config.event_handler = httpEventHandler;
        config.keep_alive_enable = true;

        esp_https_ota_config_t otaConfig = {};
        otaConfig.http_config = &config;

        memset(otaHttpResp, 0, sizeof(otaHttpResp));
        err = esp_https_ota(&otaConfig);
        if (err == ESP_OK) {
            // todo: wait for end of operation
            ESP_LOGI(TAG, "OTA Succeed, Rebooting...");
            esp_restart();
        } else {
            ESP_LOGE(TAG, "Firmware upgrade failed");
            esp_restart();
        }
    }
}

void updater(void* params)
{
    waitForWifiConnection();

    while (true) {
        findUpdate();
        vTaskDelay(pdMS_TO_TICKS(checkFreq * 1000));
    }
}

void launchUpdater()
{
    otaEvents = xEventGroupCreate();

    xTaskCreate(updater, "updater", CONFIG_TINYUSB_TASK_STACK_SIZE, nullptr, tskIDLE_PRIORITY, nullptr);

    xEventGroupWaitBits(otaEvents, FIRST_OTA_CHECK_DONE, pdFALSE, pdTRUE, portMAX_DELAY);
}
}; // namespace chessbot
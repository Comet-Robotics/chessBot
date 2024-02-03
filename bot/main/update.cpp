#include <freertos/FreeRTOS.h> // Mandatory first include

#include <memory>

#include <esp_http_client.h>
#include <esp_tls.h>
#include <esp_ota_ops.h>
#include <esp_https_ota.h>
#include <esp_log.h>

#include <ArduinoJson.h>

#include <chessbot/update.h>
#include <chessbot/wireless.h>

#define TAG "update"

#ifndef MIN
#define MIN(a, b) ((a) > (b) ? (b) : (a))
#endif

namespace chessbot
{

    // Max size of the document describing available updates
    constexpr int OTA_HTTP_RESP_SIZE = 2048;

    // Will be filled with the build timestamp at link time
    extern uint64_t currentFirmwareVersion;

    // The JSON parsing space for the OTA task
    JsonDocument otaJson;
    char otaHttpResp[OTA_HTTP_RESP_SIZE + 1];

    // How often to poll the server for updates in seconds
    // Modified whenever a server returns an info.json with a different checkFreq
    // Defaults to 10 minutes
    int checkFreq = 10 * 60;

    const char *updateServers[] = {"192.168.1.1"};

    esp_err_t httpEventHandler(esp_http_client_event_t *evt)
    {
        switch (evt->event_id)
        {
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
        case HTTP_EVENT_ON_DATA:
        {
            ESP_LOGD(TAG, "HTTP_EVENT_ON_DATA, len=%d", evt->data_len);

            // Will not support chunked data
            if (esp_http_client_is_chunked_response(evt->client))
            {
                ESP_LOGD(TAG, "Chunked data :(");
                return ESP_FAIL;
            }

            // Copy response into buffer
            const int respLen = esp_http_client_get_content_length(evt->client);
            memcpy(otaHttpResp, evt->data, MIN(respLen, OTA_HTTP_RESP_SIZE));

            break;
        }
        case HTTP_EVENT_ON_FINISH:
            ESP_LOGD(TAG, "HTTP_EVENT_ON_FINISH");
            break;
        case HTTP_EVENT_DISCONNECTED:
        {
            ESP_LOGI(TAG, "HTTP_EVENT_DISCONNECTED");
            int mbedtls_err = 0;
            esp_err_t err = esp_tls_get_and_clear_last_error((esp_tls_error_handle_t)evt->data, &mbedtls_err, NULL);
            if (err != 0)
            {
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

    struct cleanupHttpClient
    {
        void operator()(esp_http_client *client)
        {
            esp_http_client_cleanup(client);
        }
    };

    esp_err_t getJsonFromHost(const char *host)
    {
        esp_http_client_config_t httpConfig = {};
        httpConfig.host = host;
        httpConfig.path = "/update/chessbot/info.json";
        httpConfig.transport_type = HTTP_TRANSPORT_OVER_TCP;
        httpConfig.event_handler = httpEventHandler;

        esp_http_client_handle_t client = esp_http_client_init(&httpConfig);
        std::unique_ptr<esp_http_client, cleanupHttpClient> cleanup(client);

        memset(otaHttpResp, 0, sizeof(otaHttpResp));
        esp_err_t err = esp_http_client_perform(client);

        if (err == ESP_OK)
        {
            printf("Successful HTTP request to %s, status %d, length %d\n", host, (int)esp_http_client_get_status_code(client), (int)esp_http_client_get_content_length(client));
        }
        else
        {
            printf("Failed HTTP request to %s\n", host);
            return err;
        }

        printf("Parsing JSON %s\n", otaHttpResp);
        DeserializationError jerr = deserializeJson(otaJson, otaHttpResp);

        if (jerr)
        {
            printf("Failed deserializing json from %s because %s\n", host, "");
            return ESP_FAIL;
        }

        return ESP_OK;
    }

    void findUpdate()
    {
        for (const char *i : updateServers)
        {
            printf("Seeking json from host %s\n", i);
            auto err = getJsonFromHost(i);

            if (err != ESP_OK)
            {
                continue;
            }

            int version = otaJson["version"];
            const char *url = otaJson["url"];
            int newCheckFreq = otaJson["checkFreq"];

            printf("Ver %d, url %s, check %d", version, url, newCheckFreq);

            if (checkFreq != newCheckFreq)
            {
                printf("Updating checkFreq from %d to %d\n", checkFreq, newCheckFreq);
                checkFreq = newCheckFreq;
            }

            if (version <= currentFirmwareVersion)
            {
                continue;
            }

            ESP_LOGI("", "Updating to version %d", version);

            esp_http_client_config_t config = {};
            config.url = url;
            config.event_handler = httpEventHandler;
            config.keep_alive_enable = true;

            esp_https_ota_config_t otaConfig = {};
            otaConfig.http_config = &config;

            memset(otaHttpResp, 0, sizeof(otaHttpResp));
            err = esp_https_ota(&otaConfig);
            if (err == ESP_OK)
            {
                // todo: wait for end of operation
                ESP_LOGI(TAG, "OTA Succeed, Rebooting...");
                esp_restart();
            }
            else
            {
                ESP_LOGE(TAG, "Firmware upgrade failed");
            }
        }
    }

    void updater(void *params)
    {
        waitForWifiConnection();

        while (true)
        {
            findUpdate();
            vTaskDelay(pdMS_TO_TICKS(checkFreq * 1000));
        }
    }

    void launchUpdater()
    {
        xTaskCreate(updater, "updater", configMINIMAL_STACK_SIZE, nullptr, tskIDLE_PRIORITY, nullptr);
    }

};
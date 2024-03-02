#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/wireless.h>

#include <string.h>

#include <esp_log.h>
#include <esp_wifi.h>
#include <freertos/event_groups.h>
#include <nvs_flash.h>

#include <chessbot/util.h>

#define TAG "wireless"

namespace chessbot {
EventGroupHandle_t wifiEvents;
#define WIFI_CONNECTED_BIT BIT0

#if __has_include("../../env.h")
#include "../../env.h"
#else

#warning "Wifi will not work without an SSID and password"
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";
#endif

bool isWifiConnected()
{
    return !!(xEventGroupGetBits(wifiEvents) & WIFI_CONNECTED_BIT);
}

void waitForWifiConnection()
{
    xEventGroupWaitBits(wifiEvents, WIFI_CONNECTED_BIT, pdFALSE, pdTRUE, portMAX_DELAY);
}

void wifiEventHandler(void* arg, esp_event_base_t event_base,
    int32_t event_id, void* event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        // When the station is ready for the first time, connect
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGI(TAG, "connect to the AP fail");

        xEventGroupClearBits(wifiEvents, WIFI_CONNECTED_BIT);

        vTaskDelay(randIn(1, 10) * configTICK_RATE_HZ);

        // Never give up, maybe the network will come up at some point
        // todo: make sure this isn't spamming the network
        esp_wifi_connect();
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*)event_data;
        ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));

        xEventGroupSetBits(wifiEvents, WIFI_CONNECTED_BIT);
    }

    // todo: there are a lot of other esoteric event types that probably break it permanently
}

void startWifi()
{
    wifiEvents = xEventGroupCreate();

    // Initialize NVS
    // Variables such as the used SSID will be stored automatically, but they will be overwritten since
    // the SSID is currently fixed in the source code at boot
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(esp_netif_init());

    ESP_ERROR_CHECK(esp_event_loop_create_default());

    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    // Register to handle events involving WiFi connections and IP assignment
    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
        ESP_EVENT_ANY_ID,
        &wifiEventHandler,
        NULL,
        &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
        IP_EVENT_STA_GOT_IP,
        &wifiEventHandler,
        NULL,
        &instance_got_ip));

    wifi_config_t wifiConfig = {};
    strcpy((char*)wifiConfig.sta.ssid, WIFI_SSID);
    strcpy((char*)wifiConfig.sta.password, WIFI_PASSWORD);

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifiConfig));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "wifi_init_sta finished.");
}
}; // namespace chessbot
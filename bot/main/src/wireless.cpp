#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/wireless.h>

#include <string.h>

#include <esp_log.h>
#include <esp_wifi.h>
#include <freertos/event_groups.h>
#include <nvs_flash.h>

#include <chessbot/log.h>
#include <chessbot/util.h>

#define TAG "wireless"

namespace chessbot {
EventGroupHandle_t wifiEvents;
#define WIFI_CONNECTED_BIT BIT0

#if __has_include("../../env.h")
#include "../../env.h"
#else

#ifndef WIFI_NOT_NEEDED
#warning "env.h not populated"
#else
const char* WIFI_SSID = "";
const char* WIFI_PASSWORD = "";
#endif
#endif

bool isWifiConnected()
{
    return !!(xEventGroupGetBits(wifiEvents) & WIFI_CONNECTED_BIT);
}

void waitForWifiConnection()
{
    xEventGroupWaitBits(wifiEvents, WIFI_CONNECTED_BIT, pdFALSE, pdTRUE, portMAX_DELAY);
}

void wifiEventHandler(void* arg, esp_event_base_t eBase,
    int32_t eId, void* eData)
{
    assert(eBase == WIFI_EVENT);

    if (eId == WIFI_EVENT_WIFI_READY) {
        ESP_LOGI(TAG, "Wifi ready\n");
    } else if (eId == WIFI_EVENT_SCAN_DONE) {

    } else if (eId == WIFI_EVENT_STA_START) {
        ESP_LOGI(TAG, "Wifi start\n");

        // When the station is ready for the first time, connect
        CHECK(esp_wifi_connect());
    } else if (eId == WIFI_EVENT_STA_STOP) {
        ESP_LOGI(TAG, "Wifi stop\n");
    } else if (eId == WIFI_EVENT_STA_CONNECTED) {
        ESP_LOGI(TAG, "Wifi connected\n");
    } else if (eId == WIFI_EVENT_STA_DISCONNECTED) {
        ESP_LOGI(TAG, "Wifi disconnected");

        xEventGroupClearBits(wifiEvents, WIFI_CONNECTED_BIT);

        // Wait for a random duration to avoid hammering the access point
        // todo: should this be shorter?
        vTaskDelay(randIn(1, 3) * configTICK_RATE_HZ);

        // Never give up, maybe the network will come up at some point
        CHECK(esp_wifi_connect());
    }

    // todo: there are a lot of other esoteric event types that probably break it permanently
}

void ipEventHandler(void* arg, esp_event_base_t eBase,
    int32_t eId, void* eData)
{
    assert(eBase == IP_EVENT);

    if (eId == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*)eData;
        ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));

        xEventGroupSetBits(wifiEvents, WIFI_CONNECTED_BIT);
    } else {
        // Every event besides getting an IP is terrible (check ip_event_t)
        // so just log it, maybe need to restart
        ESP_LOGW(TAG, "Unexpected IP event %d", (int)eId);
    }
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

    // Register handler for IP and Wifi events
    esp_event_handler_instance_t wifiEventHandlerInstance;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
        ESP_EVENT_ANY_ID,
        &wifiEventHandler,
        NULL,
        &wifiEventHandlerInstance));

    esp_event_handler_instance_t ipEventHandlerInstance;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
        ESP_EVENT_ANY_ID,
        &ipEventHandler,
        NULL,
        &ipEventHandlerInstance));

    wifi_config_t wifiConfig = {};
    // wifiConfig.sta.listen_interval =
    strcpy((char*)wifiConfig.sta.ssid, WIFI_SSID);
    strcpy((char*)wifiConfig.sta.password, WIFI_PASSWORD);
    wifiConfig.sta.scan_method = WIFI_ALL_CHANNEL_SCAN; // Scan all channels, must be enabled to retry a single station multiple times
    wifiConfig.sta.rm_enabled = 1; // Collect stats, maybe?
    wifiConfig.sta.failure_retry_cnt = 10;

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifiConfig));
    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "wifi_init_sta finished");
}

void setWifiSleepPolicy(SLEEP_MODE mode)
{
    if (mode == SLEEP_MODE::MAX_MODEM_SLEEP) {
        esp_wifi_set_ps(WIFI_PS_MAX_MODEM);
    } else if (mode == SLEEP_MODE::ACTIVE) {
        // upclock?
        esp_wifi_set_ps(WIFI_PS_NONE);
    }
}
}; // namespace chessbot
#include <freertos/FreeRTOS.h> // Mandatory first include

#include <driver/gpio.h>
#include <esp_log.h>
#include <esp_ota_ops.h>
#include <esp_pm.h>
#include <freertos/task.h>
#include <hal/cpu_hal.h>
#include <sdkconfig.h>
#include <soc/periph_defs.h>
#include <stdio.h>
#include <stdlib.h>
#include <tusb.h>

#include <chessbot/activityLed.h>
#include <chessbot/adc.h>
#include <chessbot/dac.h>
#include <chessbot/net.h>
#include <chessbot/robot.h>
#include <chessbot/unit.h>
#include <chessbot/update.h>
#include <chessbot/wireless.h>
#include <chessbot/desc.h>
#include <chessbot/mdns.h>

#define MAX_FREQ    (CONFIG_ESP_DEFAULT_CPU_FREQ_MHZ)

#if CONFIG_XTAL_FREQ_40
#define MIN_FREQ    10
#elif CONFIG_XTAL_FREQ_32
#define MIN_FREQ    8
#elif CONFIG_XTAL_FREQ_26
#define MIN_FREQ    13
#endif

using namespace chessbot;

void consoleHello()
{
    // Get and print hash of current firmware
    uint8_t currentHash[32];
    CHECK(esp_partition_get_sha256(esp_ota_get_running_partition(), currentHash));

    printf("Start ChessBot https://chessbots.cometrobotics.org\nApp Hash: ");

    for (int i = 0; i < 32; i++) {
        printf("%02x", currentHash[i]);
    }
    printf("\n");

    // Check for USB serial
    // As USB serial takes some time to attach, let it attach before any crashes
    if (true) { //tud_cdc_connected()) {
        for (int i = 0; i < 3; i++) {
            printf("Starting...\n");
            vTaskDelay(1_s);
        }
    }
}

#ifdef WOKWI_COMPAT
//extern "C" void esp_clk_init() {}
#endif

extern "C" void app_main()
{
    // Turn off motors in case they were left on
    setGpioOff();

    // Set at 1Hz for startup
    startActivityLed();

    consoleHello();

    startWifi();
    waitForWifiConnection();
    
    launchUpdater();

    /*setWifiSleepPolicy(SLEEP_MODE::LIGHT_SLEEP);

    esp_pm_config_t pm_config = {
        .max_freq_mhz = 160,
        .min_freq_mhz = MIN_FREQ,
#if CONFIG_FREERTOS_USE_TICKLESS_IDLE
        .light_sleep_enable = true
#endif
    };
    CHECK(esp_pm_configure(&pm_config));*/

    startNetThread();

    Robot robot;

    while (true) {
        printf("still running\n");

        vTaskDelay(1_s);
    }
}
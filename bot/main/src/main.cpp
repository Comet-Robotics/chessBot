#include <freertos/FreeRTOS.h> // Mandatory first include

#include <driver/gpio.h>
#include <esp_log.h>
#include <esp_ota_ops.h>
#include <freertos/task.h>
#include <hal/cpu_hal.h>
#include <sdkconfig.h>
#include <soc/periph_defs.h>
#include <stdio.h>
#include <stdlib.h>

#include <chessbot/activityLed.h>
#include <chessbot/adc.h>
#include <chessbot/dac.h>
#include <chessbot/net.h>
#include <chessbot/robot.h>
#include <chessbot/unit.h>
#include <chessbot/update.h>
#include <chessbot/wireless.h>

// #define TEST

#ifdef TEST
#include <chessbot/test.h>
#endif

using namespace chessbot;

void consoleHello()
{
    uint8_t currentHash[32];
    CHECK(esp_partition_get_sha256(esp_ota_get_running_partition(), currentHash));

    printf("Start ChessBot https://chessbots.cometrobotics.org\nApp Hash: ");

    for (int i = 0; i < 32; i++) {
        printf("%02x", currentHash[i]);
    }
}

#ifndef TEST
extern "C" void app_main()
#else
extern "C" void app_main_alt()
#endif
{
    consoleHello();

    startActivityLed();

    // If on USB and debugging
    /*for (int i = 0; i < 3; i++) {
        //printf("Starting...");
        vTaskDelay(1_s);
    }*/

    startWifi();
    waitForWifiConnection();
    launchUpdater();

    while (true)
    {
        printf("Thing 4\n");
        vTaskDelay(1000_ms);
    }

    startNetThread();

    Robot robot;

    gpio_reset_pin(PINCONFIG(RELAY_IR_LED));
    gpio_set_direction(PINCONFIG(RELAY_IR_LED), GPIO_MODE_OUTPUT);
    gpio_set_level(PINCONFIG(RELAY_IR_LED), false);

    // gpio_set_level(PINCONFIG(RELAY_IR_LED), false);

    // adcInitPin(ADC_CHANNEL_0);
    // adcInitPin(ADC_CHANNEL_1);
    // adcInitPin(ADC_CHANNEL_3);
    // adcInitPin(ADC_CHANNEL_5);

    // Robot robot; //(GPIO_NUM_38, GPIO_NUM_33);

    while (true) {
        // printf("Hello world! %d %d %d %d\n", adcRead(ADC_CHANNEL_0), adcRead(ADC_CHANNEL_1),
        // adcRead(ADC_CHANNEL_3), adcRead(ADC_CHANNEL_5));
        bool button = !gpio_get_level(GPIO_NUM_0);
        gpio_set_level(PINCONFIG(RELAY_IR_LED), button);

        // robot.right.set(button ? 0 : frand());
        // robot.left.set(button ? 0 : frand());

        // std::cout << "setting high" << std::endl;

        // robot.left.channelA.set(1.0);
        // robot.left.channelB.set(1.0);
        // robot.right.channelA.set(1.0);
        // robot.right.channelB.set(1.0);

        vTaskDelay(1_s);
    }
}
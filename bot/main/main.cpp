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
#include <tusb_cdc_acm.h>
#include <tusb_console.h>

#include <chessbot/activityLed.h>
#include <chessbot/adc.h>
#include <chessbot/dac.h>
#include <chessbot/robot.h>
#include <chessbot/unit.h>

using namespace chessbot;

extern "C" void app_main()
{
    printf("Start\n");
    startActivityLed();

    Robot robot;

    gpio_set_level(PINCONFIG(RELAY_IR_LED), true);

    // adcInitPin(ADC_CHANNEL_0);
    // adcInitPin(ADC_CHANNEL_1);
    // adcInitPin(ADC_CHANNEL_3);
    // adcInitPin(ADC_CHANNEL_5);

    // Robot robot; //(GPIO_NUM_38, GPIO_NUM_33);

    while (true) {
        // printf("Hello world! %d %d %d %d\n", adcRead(ADC_CHANNEL_0), adcRead(ADC_CHANNEL_1),
        // adcRead(ADC_CHANNEL_3), adcRead(ADC_CHANNEL_5));
        bool button = gpio_get_level(GPIO_NUM_0);

        robot.right.set(button ? 0 : frand());
        robot.left.set(button ? 0 : frand());

        vTaskDelay(500_ms);
    }
}
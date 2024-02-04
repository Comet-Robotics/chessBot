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

#ifdef TEST
extern "C" void app_main()
#else
extern "C" void app_main_alt();
#endif
{
    // Goals of a self-test:
    // Move the motors in both directions and observe that on the encoders
    // Toggle the LED relay and notice it on the line sensors

    printf("Start Test\n");

    startActivityLed();

    Robot robot;

    

    // adcInitPin(ADC_CHANNEL_0);
    // adcInitPin(ADC_CHANNEL_1);
    // adcInitPin(ADC_CHANNEL_3);
    // adcInitPin(ADC_CHANNEL_5);

    // Robot robot; //(GPIO_NUM_38, GPIO_NUM_33);

    while (true) {
        // Forward and back test
        robot.left.reset();
        robot.right.reset();

        robot.left.set(0.5);
        robot.right.set(0.5);
        vTaskDelay(500_ms);

        CHECK(robot.left.pos() > 100);
        CHECK(robot.right.pos() > 100);

        robot.left.set(-0.5);
        robot.right.set(-0.5);
        vTaskDelay(500_ms);

        CHECK(within(robot.left.pos(), 100, 0));
        CHECK(within(robot.right.pos(), 100, 0));

        // Light test
        gpio_set_level(PINCONFIG(RELAY_IR_LED), false);

        int darkLevels;

        gpio_set_level(PINCONFIG(RELAY_IR_LED), true);

        int lightLevels;
    }
}
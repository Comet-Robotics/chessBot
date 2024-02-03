#include <freertos/FreeRTOS.h> // Mandatory first include

#include <stdio.h>
#include <stdlib.h>
#include <esp_log.h>
#include <freertos/task.h>
#include <tusb_console.h>
#include <tusb_cdc_acm.h>
#include <sdkconfig.h>
#include <driver/gpio.h>
#include <soc/periph_defs.h>
#include <hal/cpu_hal.h>
#include <esp_ota_ops.h>

#include <chessbot/unit.h>
#include <chessbot/adc.h>
#include <chessbot/dac.h>
#include <chessbot/activityLed.h>

using namespace chessbot;

extern "C" void app_main()
{
    printf("Start\n");
    startActivityLed();

    //adcInitPin(ADC_CHANNEL_0);
    //adcInitPin(ADC_CHANNEL_1);
    //adcInitPin(ADC_CHANNEL_3);
    //adcInitPin(ADC_CHANNEL_5);

    //PwmPin motorA(0);
    //motorA.set(0.5);
    
    while (true)
    {
        //printf("Hello world! %d %d %d %d\n", adcRead(ADC_CHANNEL_0), adcRead(ADC_CHANNEL_1),
        //adcRead(ADC_CHANNEL_3), adcRead(ADC_CHANNEL_5));

        printf("Run\n");

        vTaskDelay(1_s);
    }
}
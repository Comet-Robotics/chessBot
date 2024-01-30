#include <stdio.h>
#include <stdlib.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
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

extern "C" void app_main()
{
    adcInitPin(ADC_CHANNEL_0, ADC_ATTEN_DB_11);
    adcInitPin(ADC_CHANNEL_1, ADC_ATTEN_DB_11);
    adcInitPin(ADC_CHANNEL_3, ADC_ATTEN_DB_11);
    adcInitPin(ADC_CHANNEL_5, ADC_ATTEN_DB_11);
    
    while (true)
    {
        printf("Hello world! %d %d %d %d\n", adcRead(ADC_CHANNEL_0), adcRead(ADC_CHANNEL_1),
        adcRead(ADC_CHANNEL_3), adcRead(ADC_CHANNEL_5));
        vTaskDelay(1_s);
    }
}
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

#include "chessbot/unit.h"

extern "C" void app_main()
{
    while (true)
    {
        printf("Hello world!\n");
        vTaskDelay(1_s);
    }
}
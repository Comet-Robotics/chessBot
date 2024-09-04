#include <chessbot/activityLed.h>
#include <freertos/FreeRTOS.h> // Mandatory first include

#include <freertos/task.h>

#include <esp_log.h>

#include <driver/gpio.h>

#include <chessbot/unit.h>

#define ONBOARD_LED GPIO_NUM_15

namespace chessbot {

// Activity LED meanings:
// 1000ms:  Disconnected
// 50ms:    OTA Update
// 5000ms:  Connected

TickType_t activityLedDelay = 1000_ms;
TaskHandle_t activityLedTask = nullptr;

void run(void*)
{
    static bool status = false;

    while (true) {
        gpio_set_level(ONBOARD_LED, status = !status);
        vTaskDelay(activityLedDelay);
    }
}

void startActivityLed()
{
    gpio_reset_pin(ONBOARD_LED);
    gpio_set_direction(ONBOARD_LED, GPIO_MODE_OUTPUT);
    gpio_set_level(ONBOARD_LED, false);

    xTaskCreate(run, "activityLed", configMINIMAL_STACK_SIZE, nullptr, tskIDLE_PRIORITY, &activityLedTask);
}

void stopActivityLed()
{
    if (activityLedTask != NULL) {
        vTaskDelete(activityLedTask);
        activityLedTask = NULL;
    }

    gpio_set_level(ONBOARD_LED, false);
}
}; // namespace chessbot
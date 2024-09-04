#include <chessbot/activityLed.h>
#include <freertos/FreeRTOS.h> // Mandatory first include

#include <freertos/task.h>

#include <esp_log.h>

#include <driver/gpio.h>

#include <chessbot/unit.h>
#include <chessbot/allocation.h>

#define ONBOARD_LED GPIO_NUM_15

namespace chessbot {
bool activityLedIsOta = false;
bool activityLedIsConnected = false;

TaskHandle_t activityLedTask = nullptr;

void run(void*)
{
    static bool status = false;

    while (true) {
        gpio_set_level(ONBOARD_LED, status = !status);

        if (activityLedIsOta) {
            vTaskDelay(ACTIVITY_LED_DELAY_OTA);
        }
        else if (activityLedIsConnected) {
            vTaskDelay(ACTIVITY_LED_DELAY_CONNECTED);
        }
        else {
            vTaskDelay(ACTIVITY_LED_DELAY_DISCONNECTED);
        }
    }
}

void startActivityLed()
{
    gpio_reset_pin(ONBOARD_LED);
    gpio_set_direction(ONBOARD_LED, GPIO_MODE_OUTPUT);
    gpio_set_level(ONBOARD_LED, false);

    xTaskCreate(run, "activityLed", TaskStackSize::SMALL, nullptr, TaskPriority::LED, &activityLedTask);
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
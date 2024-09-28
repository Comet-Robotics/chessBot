#ifndef CHESSBOT_ALLOCATION_H
#define CHESSBOT_ALLOCATION_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <driver/ledc.h>
#include <driver/ledc.h>

namespace chessbot {

// FreeRTOS Task Priorities
// ESP-IDF Included:
// app_main: 1
// esp_timer: 22 = ESP_TASK_TIMER_PRIO (unused)
// FreeRTOS timer: 1 or custom value
// Event loop: 20 = ESP_TASK_EVENT_PRIO or custom
// LwIP: 18 = ESP_TASK_TCPIP_PRIO - Must be higher than all TCP calls
// Wi-Fi: 23
// wpa_supplicant: 2
// mDNS: 1 = CONFIG_MDNS_TASK_PRIORITY (unused)

struct TaskPriority {
    // Maximum for anything involving networking
    static constexpr UBaseType_t BUILTIN_LWIP = 18; //ESP_TASK_TCPIP_PRIO;

    // Lowest
    static constexpr UBaseType_t IDLE = tskIDLE_PRIORITY;

    // Blinking indicator LED
    static constexpr UBaseType_t LED = IDLE;

    // OTA Updating
    static constexpr UBaseType_t UPDATE = IDLE;

    // Socket opening, 
    static constexpr UBaseType_t NET = IDLE + 1;

    // Packet parsing activities
    static constexpr UBaseType_t ROBOT = IDLE + 2;

    // PID, so very high. Keep it fast.
    static constexpr UBaseType_t MOTOR = 25;
};

struct TaskStackSize {
    // Don't call deep functions or else it will crash
    static constexpr configSTACK_DEPTH_TYPE SMALL = configMINIMAL_STACK_SIZE;

    // Anything should be fine
    static constexpr configSTACK_DEPTH_TYPE LARGE = CONFIG_TINYUSB_TASK_STACK_SIZE;
};


// LEDC Mappings
struct LedcMapping {
    // Used by PwmPin
    static constexpr ledc_timer_t PWM = LEDC_TIMER_0;
};

}; // namespace chessbot

#endif // ifndef CHESSBOT_ALLOCATION_H
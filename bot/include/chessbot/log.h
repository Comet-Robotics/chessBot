#ifndef CHESSBOT_LOG_H
#define CHESSBOT_LOG_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <cstdio>

#include <esp_err.h>
#include <esp_log.h>

#include <freertos/task.h>

#include <chessbot/unit.h>

namespace chessbot {

template <typename ErrT = bool>
inline void checkImpl(ErrT val, const char* file, int line);

// Verify the success of a function that returns esp_err_t
inline void checkImpl(bool val, const char* file, int line)
{
    if (!val) {
        // URGENT TODO: STOP ROBOT

        while (true) {
            ESP_LOGE("", "Function call in %s on line %d failed", file, line);
            vTaskDelay(1_s);
        }
    }
}

inline void checkImpl(esp_err_t val, const char* file, int line)
{
    if (val != ESP_OK) {
        // URGENT TODO: STOP ROBOT

        while (true) {
            ESP_LOGE("", "Function call in %s on line %d failed", file, line);
            vTaskDelay(1_s);
        }
    }
}

[[noreturn]] inline void checkImpl(nullptr_t val, const char* file, int line)
{
    // URGENT TODO: STOP ROBOT

    while (true) {
        ESP_LOGE("", "Function call in %s on line %d failed", file, line);
        vTaskDelay(1_s);
    }
}

#define CHECK(val) (checkImpl(val, __FILE__, __LINE__))

#define CHECK_RET(val)       \
    {                        \
        if (val != ESP_OK) { \
            return val;      \
        }                    \
    }

#define FAIL() (checkImpl(nullptr, __FILE__, __LINE__))

}; // namespace chessbot

#endif // ifndef CHESSBOT_LOG_H
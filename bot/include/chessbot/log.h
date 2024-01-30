#ifndef CHESSBOT_LOG_H
#define CHESSBOT_LOG_H

#include <cstdio>

#include <esp_err.h>

#include <freertos/task.h>

#include <chessbot/unit.h>

template<typename ErrT>
void checkImpl(ErrT val, const char* file, int line);

// Verify the success of a function that returns esp_err_t
void checkImpl(esp_err_t val, const char* file, int line)
{
    if (val != ESP_OK)
    {
        while (true)
        {
            printf("Function call in %s on line %d failed\n", file, line);
            vTaskDelay(1_s);
        }
    }
}

#define CHECK(val) (checkImpl(val, __FILE__, __LINE__))

#define CHECK_RET(val) { if (val != ESP_OK) { return val; } }

#endif // ifndef CHESSBOT_LOG_H
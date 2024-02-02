#ifndef CHESSBOT_LOG_H
#define CHESSBOT_LOG_H

#include <cstdio>

#include <esp_err.h>

#include <freertos/task.h>

#include <chessbot/unit.h>

template<typename ErrT>
inline void checkImpl(ErrT val, const char* file, int line);

// Verify the success of a function that returns esp_err_t
inline void checkImpl(bool val, const char* file, int line)
{
    if (!val)
    {
        //URGENT TODO: STOP ROBOT

        while (true)
        {
            printf("Function call in %s on line %d failed\n", file, line);
            vTaskDelay(1_s);
        }
    }
}

inline void checkImpl(esp_err_t val, const char* file, int line)
{
    if (val != ESP_OK)
    {
        //URGENT TODO: STOP ROBOT

        while (true)
        {
            printf("Function call in %s on line %d failed\n", file, line);
            vTaskDelay(1_s);
        }
    }
}

[[noreturn]] inline void checkImpl(nullptr_t val, const char* file, int line)
{
    //URGENT TODO: STOP ROBOT

    while (true)
    {
        printf("Function call in %s on line %d failed\n", file, line);
        vTaskDelay(1_s);
    }
}

#define CHECK(val) (checkImpl(val, __FILE__, __LINE__))

#define CHECK_RET(val) { if (val != ESP_OK) { return val; } }

#define FAIL() (checkImpl(nullptr, __FILE__, __LINE__))

#endif // ifndef CHESSBOT_LOG_H
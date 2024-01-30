#ifndef CHESSBOT_UNIT_H
#define CHESSBOT_UNIT_H

#include <freertos/portmacro.h>

constexpr TickType_t operator""_ms(unsigned long long int time)
{
    return pdMS_TO_TICKS(time);
}

constexpr TickType_t operator""_s(unsigned long long int time)
{
    // seconds * seconds^-1
    return time * CONFIG_FREERTOS_HZ;
}

#endif // ifndef CHESSBOT_UNIT_H
#ifndef CHESSBOT_UTIL_H
#define CHESSBOT_UTIL_H

#include <freertos/FreeRTOS.h> // Mandatory first include
#include <freertos/task.h>

#include <esp_random.h>

#include <cstring>

#include <chessbot/unit.h>

#ifndef MIN
#define MIN(a, b) ((a) > (b) ? (b) : (a))
#endif

namespace chessbot {
template <typename OutT, typename InT>
OutT bitcast(InT in) noexcept
{
    static_assert(sizeof(InT) == sizeof(OutT));

    OutT out;
    std::memcpy(&out, &in, sizeof(OutT));
    return out;
}

inline bool within(float val, float range, float target)
{
    return std::abs(target - val) <= range;
}

inline bool within(int32_t val, int32_t range, int32_t target)
{
    return std::abs(target - val) <= range;
}

inline void waitForever()
{
    while (true) {
        vTaskDelay(1_s);
    }
}

// Get a number x in [low, high]
inline int randIn(int low, int high)
{
    return esp_random() % (high + 1 - low) + low;
}

inline float frand()
{
    return ((double)esp_random() / (RAND_MAX)) * 2 - 1;
}

struct TaskPriority {
    static constexpr UBaseType_t idle = tskIDLE_PRIORITY;
    static constexpr UBaseType_t update = idle;

    static constexpr UBaseType_t net = idle + 1;

    static constexpr UBaseType_t robot = idle + 2;

    static constexpr UBaseType_t motor = idle + 3;
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_UTIL_H
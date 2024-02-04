#ifndef CHESSBOT_UTIL_H
#define CHESSBOT_UTIL_H

#include <cstring>

namespace chessbot {
template <typename OutT, typename InT>
OutT bitcast(InT in) noexcept
{
    static_assert(sizeof(InT) == sizeof(OutT));

    OutT out;
    std::memcpy(&out, &in, sizeof(OutT));
    return out;
}

inline float frand()
{
    static uint32_t next = 1;
    next = next * 1103515245 + 12345;
    return float((uint32_t)(next / 65536) % 32768) / 32768;
}

inline bool within(float val, float range, float target)
{
    return std::abs(target - val) <= range;
}

inline bool within(int32_t val, int32_t range, int32_t target)
{
    return std::abs(target - val) <= range;
}
}; // namespace chessbot

#endif // ifndef CHESSBOT_UTIL_H
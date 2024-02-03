#ifndef CHESSBOT_UTIL_H
#define CHESSBOT_UTIL_H

template<typename OutT, typename InT>
OutT bitcast(InT in)
{
    static_assert(sizeof(InT) == sizeof(OutT));

    OutT out;
    memcpy(&out, &in, sizeof(OutT));
    return out;
}

inline float frand()
{
    static uint32_t next = 1;
    next = next * 1103515245 + 12345;
    return float((uint32_t)(next/65536) % 32768) / 32768;
}

#endif // ifndef CHESSBOT_UTIL_H
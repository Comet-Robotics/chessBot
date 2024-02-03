#ifndef CHESSBOT_CONFIG_H
#define CHESSBOT_CONFIG_H

#include <cstdint>

namespace chessbot
{
    // The config is a large array stored in flash that may be modified at will
    // Members can be added but never subtracted so that persisting earlier configs works

    enum ConfigKey : uint32_t
    {
        MOTOR_A_PIN1 = 0,
        MOTOR_A_PIN2,
        MOTOR_B_PIN1,
        MOTOR_B_PIN2,

        ENCODER_A_PIN1,
        ENCODER_A_PIN2,
        ENCODER_B_PIN1,
        ENCODER_B_PIN2,

        CONFIG_SIZE
    };

    constexpr int CONFIG_SIZE = 300;
 
    uint32_t configStore[CONFIG_SIZE] =
    {
        38, // MOTOR_A_PIN1
        33,
        21, // MOTOR_B_PIN1
        18,

        32, // ENCODER_A_PIN1
        31,
        17,
        34,

        8,
        1,
        2,
        4,
        6
    };

};

#endif // ifndef CHESSBOT_CONFIG_H
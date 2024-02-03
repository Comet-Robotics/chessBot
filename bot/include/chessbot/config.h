#ifndef CHESSBOT_CONFIG_H
#define CHESSBOT_CONFIG_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <cstdint>
#include <bit>

#include <chessbot/log.h>

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

        RELAY_IR_LED,
        PHOTODIODE_FRONT_LEFT,
        PHOTODIODE_FRONT_RIGHT,
        PHOTODIODE_BACK_LEFT,
        PHOTODIODE_BACK_RIGHT,

        WHEEL_DIAMETER_INCHES,

        // Accounts for both ticks per revolution and encoder direction
        // Example: -1 / 12000 for a 12kcpr encoder
        ENCODER_MULTIPLIER,

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

            8, // RELAY_IR_LED
            1, // PHOTODIODE_FRONT_LEFT
            2,
            4,
            6,

            std::bit_cast<uint32_t>(4.375), // WHEEL_DIAMETER_INCHES

            std::bit_cast<uint32_t>(-12000.0), // ENCODER_MULTIPLER
    };

    template <typename ValT = uint32_t>
    ValT getConfig(ConfigKey key)
    {
        CHECK(key < CONFIG_SIZE);

        int ikey = (int)key;
        return configStore[ikey];
    }

    template <typename ValT = uint32_t>
    void setConfig(ConfigKey key, ValT val)
    {
        // this is considerably less simple to implement
        FAIL();
    }
};

#endif // ifndef CHESSBOT_CONFIG_H
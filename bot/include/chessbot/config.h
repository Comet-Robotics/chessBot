#ifndef CHESSBOT_CONFIG_H
#define CHESSBOT_CONFIG_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <bit>
#include <cstdint>

#include <chessbot/log.h>
#include <chessbot/util.h>

namespace chessbot {
// The config is a large array stored in flash that may be modified at will
// Members can be added but never subtracted so that persisting earlier configs works

enum class ConfigKey : uint32_t {
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

uint32_t configStore[CONFIG_SIZE] = {
    38, // MOTOR_A_PIN1
    33,
    21, // MOTOR_B_PIN1
    17,

    32, // ENCODER_A_PIN1
    31,
    18,
    34,

    8, // RELAY_IR_LED
    1, // PHOTODIODE_FRONT_LEFT
    2,
    4,
    6,

    bitcast<uint32_t>(4.375f), // WHEEL_DIAMETER_INCHES

    bitcast<uint32_t>(-12000.0f), // ENCODER_MULTIPLER
};

template <typename ValT = uint32_t>
ValT getConfig(ConfigKey key)
{
    CHECK((int)key < CONFIG_SIZE);

    int ikey = (int)key;
    return bitcast<ValT>(configStore[ikey]);
}

template <typename ValT = uint32_t>
void setConfig(ConfigKey key, ValT val)
{
    // this is considerably less simple to implement
    FAIL();
}

#define PINCONFIG(target) (getConfig<gpio_num_t>(ConfigKey::target))
#define FCONFIG(target) (getConfig<float>(ConfigKey::target))
#define ICONFIG(target) (getConfig<int>(ConfigKey::target))
}; // namespace chessbot

#endif // ifndef CHESSBOT_CONFIG_H
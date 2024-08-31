#ifndef CHESSBOT_CONFIG_H
#define CHESSBOT_CONFIG_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <stdint.h>

#include <chessbot/log.h>
#include <chessbot/util.h>

namespace chessbot {
// The config is a large array stored in flash that may be modified at will
// Members can be added but never subtracted so that persisting earlier configs works
// Each cell is 4 bytes

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

    MOTOR_A_DRIVE_MULTIPLIER,
    MOTOR_B_DRIVE_MULTIPLIER,

    // Accounts for both ticks per revolution and encoder direction
    // Example: -1 / 12000 for a 12kcpr encoder
    ENCODER_MULTIPLIER,

    CONFIG_SIZE
};

extern uint32_t configStore[(size_t)ConfigKey::CONFIG_SIZE];

template <typename ValT = uint32_t>
ValT getConfig(ConfigKey key)
{
    CHECK(key < ConfigKey::CONFIG_SIZE);

    int32_t ikey = (int32_t)key;
    return bitcast<ValT>(configStore[ikey]);
}

template <typename ValT = uint32_t>
void setConfig(ConfigKey key, ValT val)
{
    // this is considerably less simple to implement
    FAIL();
}

#define PINCONFIG(target) (getConfig<gpio_num_t>(ConfigKey::target))
#define ICONFIG(target) (getConfig<int32_t>(ConfigKey::target))
#define UCONFIG(target) (getConfig<uint32_t>(ConfigKey::target))
#define FCONFIG(target) (getConfig<float>(ConfigKey::target))
}; // namespace chessbot

#endif // ifndef CHESSBOT_CONFIG_H
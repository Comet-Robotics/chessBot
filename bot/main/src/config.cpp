#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/config.h>

namespace chessbot {
uint32_t configStore[(size_t)ConfigKey::CONFIG_SIZE] = {
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

    bitcast<uint32_t>(1.0f), // MOTOR_A_DRIVE_MULTIPLIER
    bitcast<uint32_t>(-1.0f), // MOTOR_B_DRIVE_MULTIPLIER

    bitcast<uint32_t>(-12000.0f), // ENCODER_MULTIPLER
};
}; // namespace chessbot
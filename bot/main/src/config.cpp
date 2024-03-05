#include <freertos/FreeRTOS.h> // Mandatory first include

#include <hal/adc_types.h>

#include <chessbot/config.h>

namespace chessbot {
uint32_t configStore[(size_t)ConfigKey::CONFIG_SIZE] = {
    38, // MOTOR_A_PIN1
    33,
    21, // MOTOR_B_PIN1
    16,

    32, // ENCODER_A_PIN1
    31,
    18, // ENCODER_B_PIN1
    34,

    15, // RELAY_IR_LED
    ADC_CHANNEL_0, // PHOTODIODE_FRONT_LEFT (1)
    ADC_CHANNEL_1, // PHOTODIODE_FRONT_RIGHT (2)
    ADC_CHANNEL_3, // PHOTODIODE_BACK_LEFT (4)
    ADC_CHANNEL_5, // PHOTODIODE_BACK_RIGHT (5)

    bitcast<uint32_t>(4.375f), // WHEEL_DIAMETER_INCHES

    bitcast<uint32_t>(-0.5f), // MOTOR_A_DRIVE_MULTIPLIER
    bitcast<uint32_t>(-1.0f), // MOTOR_B_DRIVE_MULTIPLIER

    bitcast<uint32_t>(-12000.0f), // ENCODER_MULTIPLER

    //(uint32_t)inet_addr("192.168.21.248"), // SERVER_IP
    (uint32_t)3232274827, // SERVER_IP 192.168.21.248
    3001, // SERVER_PORT
};
}; // namespace chessbot
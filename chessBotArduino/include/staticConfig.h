// Config generated at compile time and stored in flash

#ifndef CHESSBOTARDUINO_STATIC_CONFIG_H
#define CHESSBOTARDUINO_STATIC_CONFIG_H

#include <Arduino.h>

namespace ChessBotArduino
{
    struct LEGACY_2012_DESIGN
    {
        constexpr static int MOTOR_A_PIN1 = 8;
        constexpr static int MOTOR_A_PIN2 = 9;
        constexpr static int ENCODER_A_PIN1 = 5;
        constexpr static int ENCODER_A_PIN2 = 3;

        constexpr static int MOTOR_B_PIN1 = 11;
        constexpr static int MOTOR_B_PIN2 = 10;
        constexpr static int ENCODER_B_PIN1 = 4;
        constexpr static int ENCODER_B_PIN2 = 2;

        constexpr static int DEFAULT_DRIVE_SPEED = 0;
        constexpr static int DEFAULT_TURN_SPEED = 200;

        constexpr static int ADVANCE_SPACE_TIME = 1000;

        constexpr static float WHEEL_DIAMETER_INCHES = 4.375;
        constexpr static float WHEEL_CIRCUMFERENCE_INCHES = 15; //WHEEL_DIAMETER_INCHES * M_PI;

        constexpr static int ENCODER_TICKS_PER_REVOLUTION = 12000; //14400?

        // Bind the pins needed for this robot design to work
        static void setupGpio()
        {
            pinMode(MOTOR_A_PIN1, OUTPUT);
            pinMode(MOTOR_A_PIN2, OUTPUT);
            pinMode(ENCODER_A_PIN1, INPUT);
            pinMode(ENCODER_A_PIN1, INPUT);

            pinMode(MOTOR_B_PIN1, OUTPUT);
            pinMode(MOTOR_B_PIN2, OUTPUT);
            pinMode(ENCODER_B_PIN1, INPUT);
            pinMode(ENCODER_B_PIN1, INPUT);
        }
    };

    using CONFIG = LEGACY_2012_DESIGN;
}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_STATIC_CONFIG_H
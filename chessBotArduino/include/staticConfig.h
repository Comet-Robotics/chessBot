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
        constexpr static int ENCODER_A_PIN1 = 4;
        constexpr static int ENCODER_A_PIN2 = 2;

        constexpr static int MOTOR_B_PIN1 = 11;
        constexpr static int MOTOR_B_PIN2 = 10;
        constexpr static int ENCODER_B_PIN1 = 5;
        constexpr static int ENCODER_B_PIN2 = 3;

        constexpr static int RELAY_IR_LED = 12;
        constexpr static int PHOTODIODE_FRONT_LEFT = A12;
        constexpr static int PHOTODIODE_FRONT_RIGHT = A13;
        constexpr static int PHOTODIODE_BACK_LEFT = A14;
        constexpr static int PHOTODIODE_BACK_RIGHT = A15;


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
            pinMode(ENCODER_A_PIN2, INPUT);

            pinMode(MOTOR_B_PIN1, OUTPUT);
            pinMode(MOTOR_B_PIN2, OUTPUT);
            pinMode(ENCODER_B_PIN1, INPUT);
            pinMode(ENCODER_B_PIN2, INPUT);

            pinMode(RELAY_IR_LED, OUTPUT);
        }
    };

    struct WEMOS_S2_DESIGN1
    {
        constexpr static int BUTTON_0_PIN = 0;

        constexpr static int MOTOR_A_PIN1 = 16;
        constexpr static int MOTOR_A_PIN2 = 21;
        constexpr static int ENCODER_A_PIN1 = 34;
        constexpr static int ENCODER_A_PIN2 = 35;

        constexpr static int MOTOR_B_PIN1 = 33;
        constexpr static int MOTOR_B_PIN2 = 40;
        constexpr static int ENCODER_B_PIN1 = 36;
        constexpr static int ENCODER_B_PIN2 = 39;

        constexpr static int RELAY_IR_LED = 4;
        constexpr static int PHOTODIODE_FRONT_LEFT = 5;
        constexpr static int PHOTODIODE_FRONT_RIGHT = 6;
        constexpr static int PHOTODIODE_BACK_LEFT = 7;
        constexpr static int PHOTODIODE_BACK_RIGHT = 8;


        constexpr static int DEFAULT_DRIVE_SPEED = 0;
        constexpr static int DEFAULT_TURN_SPEED = 200;

        constexpr static int ADVANCE_SPACE_TIME = 1000;

        constexpr static float WHEEL_DIAMETER_INCHES = 4.375;
        constexpr static float WHEEL_CIRCUMFERENCE_INCHES = 15; //WHEEL_DIAMETER_INCHES * M_PI;

        constexpr static int ENCODER_TICKS_PER_REVOLUTION = 12000; //14400?

        // Bind the pins needed for this robot design to work
        static void setupGpio()
        {
            analogWrite(MOTOR_A_PIN1, 0);
            analogWrite(MOTOR_B_PIN1, 0);


            //pinMode(BUTTON_0_PIN, INPUT);

            //pinMode(MOTOR_A_PIN1, OUTPUT);
            pinMode(MOTOR_A_PIN2, OUTPUT);
            //pinMode(ENCODER_A_PIN1, INPUT);
            //pinMode(ENCODER_A_PIN2, INPUT);

            //pinMode(MOTOR_B_PIN1, OUTPUT);
            pinMode(MOTOR_B_PIN2, OUTPUT);
            //pinMode(ENCODER_B_PIN1, INPUT);
            //pinMode(ENCODER_B_PIN2, INPUT);

            /*ledcAttachPin(MOTOR_A_PIN1, 0);
            ledcSetup(0, 1000, 8);

            ledcAttachPin(MOTOR_B_PIN1, 1);
            ledcSetup(1, 1000, 8);*/
        }
    };

    using CONFIG = WEMOS_S2_DESIGN1;


    const char* WIFI_SSID = "ChessBot";
    const char* WIFI_PASSWORD = "6rpAee6r)()4jnjs";

    const IPAddress SERVER_IP(192,168,55,248);
    const uint16_t SERVER_PORT = 3001;
}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_STATIC_CONFIG_H
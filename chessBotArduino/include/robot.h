#ifndef CHESSBOTARDUINO_ROBOT_H
#define CHESSBOTARDUINO_ROBOT_H

#include "staticConfig.h"
#include "motor.h"
#include "differentialKinematics.h"
#include "button.h"

namespace ChessBotArduino
{

    // The state of a chess bot
    class Robot
    {
    public:
        Button button0;

        Motor left;
        Motor right;

        DifferentialKinematics kinematics;

        Robot() : button0(CONFIG::BUTTON_0_PIN),
            left(CONFIG::MOTOR_A_PIN1, CONFIG::MOTOR_A_PIN2, CONFIG::ENCODER_A_PIN1, CONFIG::ENCODER_A_PIN2),
            right(CONFIG::MOTOR_B_PIN1, CONFIG::MOTOR_B_PIN2, CONFIG::ENCODER_B_PIN1, CONFIG::ENCODER_B_PIN2),
            kinematics(left, right)
        {
            //left.encoder->encoder.readAndReset();
            //right.encoder->encoder.readAndReset();

            kinematics.start();
        }

        void tick()
        {
        }

        void stop()
        {
            left.setPower(0);
            right.setPower(0);
        }
    };

    // Singleton robot instance
    Robot *robotInst;

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_ROBOT_H
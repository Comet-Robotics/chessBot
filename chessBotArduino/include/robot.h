#ifndef CHESSBOTARDUINO_ROBOT_H
#define CHESSBOTARDUINO_ROBOT_H

#include "staticConfig.h"
#include "motor.h"
#include "differentialKinematics.h"

namespace ChessBotArduino
{

    // The state of a chess bot
    class Robot
    {
    public:
        Motor left;
        Motor right;

        DifferentialKinematics kinematics;

        Robot() : left(CONFIG::MOTOR_A_PIN1, CONFIG::MOTOR_A_PIN2, CONFIG::ENCODER_A_PIN1, CONFIG::ENCODER_A_PIN2),
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
            left.setIntPower(0);
            right.setIntPower(0);
        }
    };

    // Singleton robot instance
    Robot *robotInst;

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_ROBOT_H
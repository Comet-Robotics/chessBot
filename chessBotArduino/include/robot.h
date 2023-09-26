#ifndef CHESSBOTARDUINO_ROBOT_H
#define CHESSBOTARDUINO_ROBOT_H

#include "staticConfig.h"
#include "motor.h"

namespace ChessBotArduino {

// The state of a chess bot
class Robot {
    public:
    Motor left;
    Motor right;

    double x = 0.0;
    double y = 0.0;

    Robot() : left(CONFIG::MOTOR_A_PIN1, CONFIG::MOTOR_A_PIN2, CONFIG::ENCODER_A_PIN1, CONFIG::ENCODER_A_PIN2),
        right(CONFIG::MOTOR_B_PIN1, CONFIG::MOTOR_B_PIN2, CONFIG::ENCODER_B_PIN1, CONFIG::ENCODER_B_PIN2) {
            left.encoder->encoder.readAndReset();
            right.encoder->encoder.readAndReset();
        }

    void tick() {

    }

    void stop() {
        left.setIntPower(0);
        right.setIntPower(0);
    }
};

// Singleton robot instance
Robot* robotInst;

};

#endif
#ifndef CHESSBOTARDUINO_ROBOT_H
#define CHESSBOTARDUINO_ROBOT_H

#include "config.h"
#include "motor.h"

namespace ChessBotArduino {

class Robot {
    public:
    Motor left;
    Motor right;

    Robot() : left(CONFIG::MOTOR_A_PIN1, CONFIG::MOTOR_A_PIN2, CONFIG::ENCODER_A_PIN1, CONFIG::ENCODER_A_PIN2),
        right(CONFIG::MOTOR_B_PIN1, CONFIG::MOTOR_B_PIN2, CONFIG::ENCODER_B_PIN1, CONFIG::ENCODER_B_PIN2) {}

    void tick() {

    }
};

Robot* robotInst;

};

#endif
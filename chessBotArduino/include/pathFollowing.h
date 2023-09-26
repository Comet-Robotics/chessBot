#ifndef CHESSBOTARDUINO_PATH_FOLLOWING_H
#define CHESSBOTARDUINO_PATH_FOLLOWING_H

#include <PreMo.h>

#include "robot.h"

namespace ChessBotArduino
{
    // ROBOT MEASUREMENTS
    const float RADIUS = 120.0 / 2.0; // wheel radius in mm
    const float LENGTH = 200;        // wheel base length in mm

    // PULSES PER REV
    const int PULSES_PER_REV = -11500; // number of pulses per revolution of the wheel.

    // MAXIMUM MOTOR SPEED VALUE
    const int MOTOR_SPEED_MAX = 255;

    // PID TUNING
    // PID for path following (for turning when followiung path)
    const double KP = 50;
    const double KD = 1;
    // PID for motors (for twist method)
    const double KP_motor = 1.5;
    const double KI_motor = 0;

    // PATH FOLLOWING SPEED
    // Target speed of path following in percentage.
    const int PATH_FOLLOW_SPEED = 100;

    // MOTOR SPEED FUNCTIONS
    void setLeftForward(int speed)
    {
        robotInst->left.setIntPower(speed);
    }

    void setLeftReverse(int speed)
    {
        robotInst->left.setIntPower(speed);
    }

    void setRightForward(int speed)
    {
        robotInst->right.setIntPower(speed);
    }

    void setRightReverse(int speed)
    {
        robotInst->right.setIntPower(speed);
    }

    void stopMotors()
    {
        robotInst->stop();
    }

    // PATH FOLLOWER
    MotorManager *motorManager;
    EncoderManager *encoderManager;
    PreMo *premo;

    void initPathFollowing()
    {
        Encoder_internal_state_t *leftRaw = (Encoder_internal_state_t *)(&robotInst->left.encoder->encoder);
        Encoder_internal_state_t *rightRaw = (Encoder_internal_state_t *)(&robotInst->left.encoder->encoder);

        motorManager = new MotorManager(setLeftForward, setLeftReverse, setRightForward, setRightReverse, stopMotors);
        encoderManager = new EncoderManager((volatile long unsigned int *)&leftRaw->position, (volatile long unsigned int *)&rightRaw->position, PULSES_PER_REV);
        premo = new PreMo(RADIUS, LENGTH, KP, KD, KP_motor, KI_motor, motorManager, encoderManager);

        motorManager->setSpeedLimits(0, MOTOR_SPEED_MAX);
        premo->twistBothMotors(false);
        premo->setPathFollowSpeed(PATH_FOLLOW_SPEED);
    }

    void startPathFollowing()
    {
        float testX[] = {0.0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        float testY[] = {0.0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};

        // premo->startPathFollowing(testX, testY, 11);

        premo->forward(5);
    }

    void tickPathFollowing()
    {
        premo->loop();
    }

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_PATH_FOLLOWING_H
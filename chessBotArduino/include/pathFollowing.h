#ifndef CHESSBOTARDUINO_PATH_FOLLOWING_H
#define CHESSBOTARDUINO_PATH_FOLLOWING_H

#include <PreMo.h>

#include "robot.h"

namespace ChessBotArduino
{
    // ROBOT MEASUREMENTS
    const float RADIUS = 120.0 / 2.0; // wheel radius in mm
    const float LENGTH = 200;         // wheel base length in mm

    // PULSES PER REV
    const int PULSES_PER_REV = 14400; // number of pulses per revolution of the wheel.

    // MAXIMUM MOTOR SPEED VALUE
    const int MOTOR_SPEED_MAX = 150;

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

    // INTERVALS
    // MIN_PULSE_INTERVAL is the minimum time in microseconds before registering each encoder pulse.
    // This is to compensate for "bouncing" on certain encoders.
    const unsigned long MIN_PULSE_INTERVAL = 175;
    // When following path, send the location to app at this interval in millisecond.
    const unsigned long SEND_INTERVAL = 200;

    // ENCODER PULSES
    volatile unsigned long leftPulses;
    volatile unsigned long rightPulses;

    // TIMING VARIABLES
    unsigned long prevLeftTime;
    unsigned long prevRightTime;
    unsigned long prevSendTime;

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

    volatile unsigned long coarseLeftPos = 2047483647;
    volatile unsigned long coarseRightPos = 2047483647;

    void initPathFollowing()
    {
        // Encoder_internal_state_t *leftRaw = (Encoder_internal_state_t *)(&robotInst->left.encoder->encoder);
        // Encoder_internal_state_t *rightRaw = (Encoder_internal_state_t *)(&robotInst->right.encoder->encoder);


        motorManager = new MotorManager(setRightForward, setRightReverse, setLeftForward, setLeftReverse, stopMotors);
        // encoderManager = new EncoderManager((volatile int32_t*)&leftRaw->position, (volatile int32_t*)&rightRaw->position, PULSES_PER_REV);
        encoderManager = new EncoderManager(&leftPulses, &rightPulses, PULSES_PER_REV);
        premo = new PreMo(RADIUS, LENGTH, KP, KD, KP_motor, KI_motor, motorManager, encoderManager);

        motorManager->setSpeedLimits(0, MOTOR_SPEED_MAX);
        premo->twistBothMotors(false);
        premo->setPathFollowSpeed(PATH_FOLLOW_SPEED);
        premo->reset();

        Serial.println("init complete");
    }

    void startPathFollowing()
    {
        float testX[] = {0.0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        float testY[] = {0.0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};

        // premo->startPathFollowing(testX, testY, 11);

        premo->forward(25.0);
    }

    void tickPathFollowing()
    {
        /*unsigned long oldLeft = coarseLeftPos;
        unsigned long oldRight = coarseRightPos;

        coarseLeftPos = 2047483647 - robotInst->left.encoder->readCoarse();
        coarseRightPos = 2047483647 - robotInst->right.encoder->readCoarse();

        if (oldLeft > coarseLeftPos)
        {
            coarseLeftPos = oldLeft;
        }

        if (oldRight > coarseRightPos)
        {
            coarseRightPos = oldRight;
        }*/

        /*Serial.print(coarseLeftPos);
        Serial.print(" ");
        Serial.print(coarseRightPos);
        Serial.println();*/

        auto v1 = (robotInst->left.encoder->delta());
        auto v2 = (robotInst->right.encoder->delta());

        leftPulses += abs(v1);
        rightPulses += abs(v2);

        premo->loop();
    }

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_PATH_FOLLOWING_H
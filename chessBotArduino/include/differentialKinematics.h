#ifndef CHESSBOTARDUINO_DIFFERENTIAL_KINEMATICS_H
#define CHESSBOTARDUINO_DIFFERENTIAL_KINEMATICS_H

#include <QuickPID.h>

#include "dynamicConfig.h"
#include "staticConfig.h"
#include "motor.h"

namespace ChessBotArduino
{
    struct FPos2 {
        float x;
        float y;
    };

    struct Pose2d {
        FPos2 pos;
        float angle; // Radians counterclockwise from X+
    };

    class DifferentialKinematics {
    public:
        QuickPID leftPid;
        Motor* leftMotor;
        float leftPidIn = 0.0;
        float leftPidOut = 0.0;
        float leftPidTarget = 0.0;

        QuickPID rightPid;
        Motor* rightMotor;
        float rightPidIn = 0.0;
        float rightPidOut = 0.0;
        float rightPidTarget = 0.0;

        Pose2d location = {};
        Pose2d target = {};
    
    public:
        DifferentialKinematics(Motor& leftMotor_, Motor& rightMotor_) : 
            leftPid(&leftPidIn, &leftPidOut, &leftPidTarget), leftMotor(&leftMotor_),
            rightPid(&rightPidIn, &rightPidOut, &rightPidTarget), rightMotor(&rightMotor_) {
                
            }

        void tick(uint32_t delta) {
            leftPidIn = ticksToDistance(leftMotor->pos());
            if (leftPid.Compute()) {
                leftMotor->setPower(leftPidOut);
            }


            rightPidIn = ticksToDistance(rightMotor->pos());
            if (rightPid.Compute()) {
                rightMotor->setPower(rightPidOut);
            }
        }

        // Map inches of driving to encoder ticks
        static int distanceToTicks(float dist) {
            return dist / CONFIG::WHEEL_CIRCUMFERENCE_INCHES * CONFIG::ENCODER_TICKS_PER_REVOLUTION;
        }

        static float ticksToDistance(int ticks) {
            return (float)(ticks) * (CONFIG::WHEEL_CIRCUMFERENCE_INCHES / CONFIG::ENCODER_TICKS_PER_REVOLUTION);
        }

        void start() {
            float proportional = 0.1;
            float integral = 0;
            float derivative = 0;

            leftPid.Reset();
            leftPid.SetMode(QuickPID::Control::automatic);
            leftPid.SetAntiWindupMode(QuickPID::iAwMode::iAwOff);
            leftPid.SetTunings(proportional, integral, derivative);
            leftPid.SetOutputLimits(-1.0, 1.0);

            rightPid.Reset();
            rightPid.SetMode(QuickPID::Control::automatic);
            rightPid.SetAntiWindupMode(QuickPID::iAwMode::iAwOff);
            rightPid.SetTunings(proportional, integral, derivative);
            rightPid.SetOutputLimits(-1.0, 1.0);
        }

        void forward(float dist) {
            target.pos.x += dist * cos(dist);
            target.pos.y += dist * sin(dist);

            leftPidTarget += (dist);
            rightPidTarget += (dist);
        }
    };



};

#endif // ifndef CHESSBOTARDUINO_DIFFERENTIAL_KINEMATICS_H
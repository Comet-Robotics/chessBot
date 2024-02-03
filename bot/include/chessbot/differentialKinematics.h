#ifndef CHESSBOT_DIFFERENTIAL_KINEMATICS_H
#define CHESSBOT_DIFFERENTIAL_KINEMATICS_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <cmath>

#include <pid_ctrl.h>

#include <chessbot/motor.h>

namespace chessbot
{
    struct FPos2
    {
        float x;
        float y;
    };

    struct Pose2d
    {
        FPos2 pos;
        float angle; // Radians counterclockwise from X+
    };

    class DifferentialKinematics
    {
    public:
        pid_ctrl_block_handle_t leftPid;
        pid_ctrl_config_t leftConfig = {};

        Motor *leftMotor;
        float leftTarget = 0.0;

        pid_ctrl_block_handle_t rightPid;
        pid_ctrl_config_t rightConfig = {};

        Motor *rightMotor;
        float rightTarget = 0.0;

        Pose2d location = {};
        Pose2d target = {};

    public:
        DifferentialKinematics(Motor &leftMotor_, Motor &rightMotor_)
        {
            leftConfig.init_param.kp = 0.1; // Proportional
            leftConfig.init_param.ki = 0; // Integral
            leftConfig.init_param.kd = 0; // Derivative

            leftConfig.init_param.max_output = 1.0;
            leftConfig.init_param.min_output = -1.0;

            leftConfig.init_param.max_integral = 10.0;
            leftConfig.init_param.min_integral = -10.0;

            leftConfig.init_param.cal_type = PID_CAL_TYPE_POSITIONAL;

            rightConfig = leftConfig;
            
            CHECK(pid_new_control_block(&leftConfig, &leftPid));
            CHECK(pid_new_control_block(&rightConfig, &rightPid));
        }

        void tick(uint32_t delta)
        {
            float leftIn = ticksToDistance(leftMotor->pos());
            float rightIn = ticksToDistance(rightMotor->pos());

            float leftOut = 0.0;
            CHECK(pid_compute(leftPid, leftIn, &leftOut));

            float rightOut = 0.0;
            CHECK(pid_compute(rightPid, rightIn, &rightOut));

            leftMotor->set(leftOut);
            rightMotor->set(rightOut);

            printf("PID in %f %f out %f %f\n", leftIn, rightIn, leftOut, rightOut);
        }

        // Map inches of driving to encoder ticks
        static int distanceToTicks(float dist)
        {
            return dist / FCONFIG(WHEEL_DIAMETER_INCHES) * FCONFIG(ENCODER_MULTIPLIER);
        }

        static float ticksToDistance(int ticks)
        {
            return (float)(ticks) * FCONFIG(WHEEL_DIAMETER_INCHES) / FCONFIG(ENCODER_MULTIPLIER);
        }

        void forward(float dist)
        {
            target.pos.x += dist * cos(dist);
            target.pos.y += dist * sin(dist);

            leftTarget += (dist);
            rightTarget += (dist);
        }

        void refresh()
        {
            pid_update_parameters(leftPid, &leftConfig.init_param);
            pid_update_parameters(rightPid, &rightConfig.init_param);
        }
    };

};

#endif // ifndef CHESSBOT_DIFFERENTIAL_KINEMATICS_H
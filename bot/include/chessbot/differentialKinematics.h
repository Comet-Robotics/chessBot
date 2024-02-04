#ifndef CHESSBOT_DIFFERENTIAL_KINEMATICS_H
#define CHESSBOT_DIFFERENTIAL_KINEMATICS_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <pid_ctrl.h>

#include <chessbot/motor.h>

namespace chessbot {
struct FVec2 {
    float x;
    float y;
};

struct IVec2 {
    int32_t x;
    int32_t y;
};

struct Pose2d {
    FVec2 pos;
    float angle; // Radians counterclockwise from X+
};

class DifferentialKinematics {
private:
    pid_ctrl_block_handle_t leftPid;
    pid_ctrl_config_t leftConfig = {};

    Motor* leftMotor;
    float leftTarget = 0.0;

    pid_ctrl_block_handle_t rightPid;
    pid_ctrl_config_t rightConfig = {};

    Motor* rightMotor;
    float rightTarget = 0.0;

    Pose2d location = {};
    Pose2d target = {};

public:
    DifferentialKinematics(Motor& leftMotor_, Motor& rightMotor_);

    void tick(uint32_t delta);

    // Map inches of driving to encoder ticks
    static int32_t distanceToTicks(float dist);

    static float ticksToDistance(int32_t ticks);

    void forward(float dist);

    void refresh();
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_DIFFERENTIAL_KINEMATICS_H
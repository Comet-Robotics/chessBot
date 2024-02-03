#ifndef CHESSBOT_ROBOT_H
#define CHESSBOT_ROBOT_H

#include <chessbot/button.h>
#include <chessbot/config.h>
#include <chessbot/differentialKinematics.h>
#include <chessbot/motor.h>
#include <esp_sleep.h>

namespace chessbot {
// The state of a chess bot
class Robot {
public:
    Button button0;

    Motor left;
    Motor right;

    DifferentialKinematics kinematics;

    Robot()
        : button0(GPIO_NUM_0)
        , left(PINCONFIG(MOTOR_A_PIN1), PINCONFIG(MOTOR_A_PIN2), PINCONFIG(ENCODER_A_PIN1), PINCONFIG(ENCODER_A_PIN2))
        , right(PINCONFIG(MOTOR_B_PIN1), PINCONFIG(MOTOR_B_PIN2), PINCONFIG(ENCODER_B_PIN1), PINCONFIG(ENCODER_B_PIN2))
        , kinematics(left, right)
    {
        // left.encoder->encoder.readAndReset();
        // right.encoder->encoder.readAndReset();
    }

    void tick(uint64_t us)
    {
        left.tick(us);
        // right.tick(us);
    }

    void stop()
    {
        left.set(0);
        right.set(0);
    }

    void estop()
    {
        stop();

        // Deep sleep for a second, resetting all registers
        // This resets much more of the chip than an ordinary software reset
        // todo: set wakup reason
        esp_sleep_enable_timer_wakeup(1000000);
        esp_deep_sleep_start();
    }
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_ROBOT_H
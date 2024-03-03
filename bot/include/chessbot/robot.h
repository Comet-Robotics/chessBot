#ifndef CHESSBOT_ROBOT_H
#define CHESSBOT_ROBOT_H

#include <array>

#include <esp_sleep.h>

#include <chessbot/button.h>
#include <chessbot/config.h>
#include <chessbot/differentialKinematics.h>
#include <chessbot/lightSensor.h>
#include <chessbot/motor.h>
#include <chessbot/net.h>

namespace chessbot {
// The state of a chess bot
class Robot {
public:
    Button button0;

    Motor left;
    Motor right;

    // DifferentialKinematics kinematics;

    // LightSensor frontLeft, frontRight, backLeft, backRight;

    TcpClient* client;
    TaskHandle_t task;

    Robot()
        : button0(GPIO_NUM_0)
        , left(PINCONFIG(MOTOR_A_PIN1), PINCONFIG(MOTOR_A_PIN2), PINCONFIG(ENCODER_A_PIN1), PINCONFIG(ENCODER_A_PIN2), FCONFIG(MOTOR_A_DRIVE_MULTIPLIER))
        , right(PINCONFIG(MOTOR_B_PIN1), PINCONFIG(MOTOR_B_PIN2), PINCONFIG(ENCODER_B_PIN1), PINCONFIG(ENCODER_B_PIN2), FCONFIG(MOTOR_B_DRIVE_MULTIPLIER))
    //, kinematics(left, right)
    //, frontLeft(PINCONFIG(PHOTODIODE_FRONT_LEFT))
    //, frontRight(PINCONFIG(PHOTODIODE_FRONT_RIGHT))
    //, backLeft(PINCONFIG(PHOTODIODE_BACK_LEFT))
    //, backRight(PINCONFIG(PHOTODIODE_BACK_RIGHT))
    {
        vTaskDelay(5_s);
        printf("send 1\n");

        runThread();

        auto addr = inet_addr("192.168.153.139");
        uint16_t port = htons(3001);

        client = addTcpClient(addr, port);
        client->waitToConnect();

        printf("send 2\n");

        char helloPacket[] = R"({"type":"CLIENT_HELLO","macAddress":"c0:4e:30:4b:68:76"};)";

        client->send(helloPacket);

        printf("send 3\n");
    }

    void tick(uint64_t us)
    {
        left.tick(us);
        right.tick(us);
    }

    void stop()
    {
        left.set(0);
        right.set(0);
    }

    IVec2 displacements()
    {
        return { 0, 0 };
        // return { left.pos(), right.pos() };
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

    std::array<int, 4> lightLevels()
    {
        // return { frontLeft.read(), frontRight.read(), backLeft.read(), backRight.read() };
        return { 0, 0, 0, 0 };
    }

    void runThread();
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_ROBOT_H
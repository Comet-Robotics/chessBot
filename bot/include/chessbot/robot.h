#ifndef CHESSBOT_ROBOT_H
#define CHESSBOT_ROBOT_H

#include <array>
#include <semaphore>

#include <esp_mac.h>
#include <esp_sleep.h>
#include <lwip/dns.h>
#include <lwip/ip4_addr.h>

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
    enum NOTIFY {
        ROBOT_NOTIFY_DNS
    };

    Button button0;

    Motor left;
    Motor right;

    DifferentialKinematics kinematics;

    LightSensor frontLeft, frontRight, backLeft, backRight;

    TcpClient* client;
    TaskHandle_t task;

    Robot()
        : button0(GPIO_NUM_0)
        , left(PINCONFIG(MOTOR_A_PIN1), PINCONFIG(MOTOR_A_PIN2), PINCONFIG(ENCODER_A_PIN1), PINCONFIG(ENCODER_A_PIN2), FCONFIG(MOTOR_A_DRIVE_MULTIPLIER))
        , right(PINCONFIG(MOTOR_B_PIN1), PINCONFIG(MOTOR_B_PIN2), PINCONFIG(ENCODER_B_PIN1), PINCONFIG(ENCODER_B_PIN2), FCONFIG(MOTOR_B_DRIVE_MULTIPLIER))
        , kinematics(left, right)
        , frontLeft(PINCONFIG(PHOTODIODE_FRONT_LEFT))
        , frontRight(PINCONFIG(PHOTODIODE_FRONT_RIGHT))
        , backLeft(PINCONFIG(PHOTODIODE_BACK_LEFT))
        , backRight(PINCONFIG(PHOTODIODE_BACK_RIGHT))
    {
        printf("send 1\n");

        auto domain = "chess-server.internal";

        printf("Pre DNS\n");

        struct Bundle {
            TaskHandle_t n;
            ip_addr_t* ip;
        };

        ip_addr_t ip = {};
        auto taskToNotify = xTaskGetCurrentTaskHandle();
        Bundle b = { xTaskGetCurrentTaskHandle(), &ip };
        auto er = dns_gethostbyname(
            domain, &ip, [](const char* name, const ip_addr_t* ipaddr, void* cbArg) {
                printf("CALLBACK\n");
                TaskHandle_t taskToNotify = ((Bundle*)(cbArg))->n;
                *(((Bundle*)(cbArg))->ip) = *ipaddr;
                xTaskNotifyGiveIndexed(taskToNotify, (UBaseType_t)ROBOT_NOTIFY_DNS); }, (void*)&b);

        printf("Start DNS %d\n", er);

        ulTaskNotifyTakeIndexed((UBaseType_t)ROBOT_NOTIFY_DNS, pdTRUE, portMAX_DELAY);

        uint16_t port = 3001;

        printf("Got DNS IP %lu\n", ip.u_addr.ip4.addr);

        client = addTcpClient(ip.u_addr.ip4.addr, port);

        printf("send 2\n");

        client->waitToConnect();

        printf("send 3\n");

        runThread();

        printf("send 4\n");

        char helloPacket[58];

        uint8_t mac[6];
        CHECK(esp_read_mac(mac, ESP_MAC_WIFI_STA));
        snprintf(helloPacket, sizeof(helloPacket), R"({"type":"CLIENT_HELLO","macAddress":"%02X:%02X:%02X:%02X:%02X:%02X"};)", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

        client->send(helloPacket);

        printf("send 5\n");
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
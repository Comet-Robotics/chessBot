#ifndef CHESSBOT_ROBOT_H
#define CHESSBOT_ROBOT_H

#include <array>
#include <semaphore>
#include <optional>

#include <esp_flash_partitions.h>
#include <esp_ota_ops.h>
#include <esp_sleep.h>
#include <lwip/dns.h>
#include <lwip/netdb.h>
#include <lwip/ip4_addr.h>

#include <chessbot/button.h>
#include <chessbot/config.h>
#include <chessbot/differentialKinematics.h>
#include <chessbot/lightSensor.h>
#include <chessbot/motor.h>
#include <chessbot/net.h>

namespace chessbot {
// Put the robot in a known state
inline void setGpioOff()
{
    #ifdef OTA_ENABLED
    esp_ota_img_states_t state;

    CHECK(esp_ota_get_state_partition(esp_ota_get_running_partition(), &state));

    if (state == ESP_OTA_IMG_PENDING_VERIFY) {
        // Don't do potentially dangerous GPIO while testing a new update
        return;
    }
    #endif

    gpio_set_level(PINCONFIG(MOTOR_A_PIN1), 0);
    gpio_set_level(PINCONFIG(MOTOR_A_PIN2), 0);
    gpio_set_level(PINCONFIG(MOTOR_B_PIN1), 0);
    gpio_set_level(PINCONFIG(MOTOR_B_PIN2), 0);

    gpio_set_level(PINCONFIG(PHOTODIODE_FRONT_LEFT), 0);
    gpio_set_level(PINCONFIG(PHOTODIODE_FRONT_RIGHT), 0);
    gpio_set_level(PINCONFIG(PHOTODIODE_BACK_LEFT), 0);
    gpio_set_level(PINCONFIG(PHOTODIODE_BACK_RIGHT), 0);
}

// Emergency shutdown handler
inline void safetyShutdown() {
    setGpioOff();
}

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
        esp_register_shutdown_handler(safetyShutdown);

        printf("p1\n");
        runThread();

printf("p2\n");
        auto ip = getServerIp();

        if (ip) {
            uint16_t port = 3001;

            client = addTcpClient(ip->u_addr.ip4.addr, port);
    printf("p3\n");
            client->waitToConnect();
    printf("p4\n");
            client->sendHello();

            printf("Sent HELLO to server\n");
        }
        else {
            printf("Choosing not to connect to server.\n");
        }
    }

    std::optional<ip_addr_t> getServerIp()
    {
        auto domain = "chess-server.internal";

        addrinfo* serverAddr;

        addrinfo hints = {};
        hints.ai_family = PF_UNSPEC;
        hints.ai_socktype = SOCK_STREAM;
        hints.ai_flags |= AI_CANONNAME;

        auto res = getaddrinfo(domain, NULL, &hints, &serverAddr);
        if (res != 0) {
            printf("Failed to resolve server IP!\n");
            return {};
        }

        freeaddrinfo(serverAddr);

        in_addr ip = ((sockaddr_in*)serverAddr->ai_addr)->sin_addr;
        ip_addr_t structure;
        structure.u_addr.ip4.addr = ip.s_addr;
        structure.type = IPADDR_TYPE_V4;
        return structure;
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
        return { left.pos(), right.pos() };
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
        return { frontLeft.read(), frontRight.read(), backLeft.read(), backRight.read() };
    }

    void runThread();
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_ROBOT_H
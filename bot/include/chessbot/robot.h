#ifndef CHESSBOT_ROBOT_H
#define CHESSBOT_ROBOT_H

#include <array>
#include <semaphore>

#include <esp_flash_partitions.h>
#include <esp_mac.h>
#include <esp_ota_ops.h>
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
// Put the robot in a known state
inline void setGpioOff()
{
    esp_ota_img_states_t state;
    //CHECK(esp_ota_get_state_partition(esp_ota_get_running_partition(), &state));

    if (false) { //(state == ESP_OTA_IMG_PENDING_VERIFY) {
        // Don't do potentially dangerous GPIO while testing a new update
        return;
    } else {
        gpio_set_level(PINCONFIG(MOTOR_A_PIN1), 0);
        gpio_set_level(PINCONFIG(MOTOR_A_PIN2), 0);
        gpio_set_level(PINCONFIG(MOTOR_B_PIN1), 0);
        gpio_set_level(PINCONFIG(MOTOR_B_PIN2), 0);

        gpio_set_level(PINCONFIG(PHOTODIODE_FRONT_LEFT), 0);
        gpio_set_level(PINCONFIG(PHOTODIODE_FRONT_RIGHT), 0);
        gpio_set_level(PINCONFIG(PHOTODIODE_BACK_LEFT), 0);
        gpio_set_level(PINCONFIG(PHOTODIODE_BACK_RIGHT), 0);
    }
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

        auto ip = getServerIp();

        uint16_t port = 3001;

        client = addTcpClient(ip.u_addr.ip4.addr, port);

        client->waitToConnect();

        runThread();

        sendHello();

        printf("Sent HELLO to server\n");
    }

    ip_addr_t getServerIp()
    {
        auto domain = "chess-server.internal";

        // Wraps the returning IP and where to notify of its assignment
        struct Bundle {
            TaskHandle_t n;
            ip_addr_t ip;
        };

        Bundle bundle = { xTaskGetCurrentTaskHandle() };

        auto err = dns_gethostbyname(
            domain, &bundle.ip, [](const char* name, const ip_addr_t* ipaddr, void* cbArg) {
                TaskHandle_t taskToNotify = ((Bundle*)(cbArg))->n;
                ((Bundle*)(cbArg))->ip = *ipaddr;
                xTaskNotifyGiveIndexed(taskToNotify, (UBaseType_t)ROBOT_NOTIFY_DNS); }, (void*)&bundle);

        if (err != ERR_OK) {
            printf("DNS resolution error!\n");
        }

        ulTaskNotifyTakeIndexed((UBaseType_t)ROBOT_NOTIFY_DNS, pdTRUE, portMAX_DELAY);

        printf("Got DNS IP %lu\n", bundle.ip.u_addr.ip4.addr);

        return bundle.ip;
    }

    void sendHello()
    {
        char helloPacket[58];
        uint8_t mac[6];
        CHECK(esp_read_mac(mac, ESP_MAC_WIFI_STA));
        snprintf(helloPacket, sizeof(helloPacket), R"({"type":"CLIENT_HELLO","macAddress":"%02X:%02X:%02X:%02X:%02X:%02X"};)", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

        client->send(helloPacket);
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
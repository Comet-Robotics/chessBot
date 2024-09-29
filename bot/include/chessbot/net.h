#ifndef CHESSBOT_NET_H
#define CHESSBOT_NET_H

#include <errno.h>
#include <lwip/sockets.h>
#include <sys/socket.h>
#include <esp_mac.h>

#include <freertos/event_groups.h>
#include <freertos/stream_buffer.h>

#include <string_view>

#include <chessbot/log.h>
#include <chessbot/unit.h>

namespace chessbot {
class TcpClient {
public:
    constexpr static int TCP_BUF_SIZE = 1024;
    constexpr static int TCP_MSG_SIZE_MAX = 1024;
    constexpr static std::pair<TickType_t, TickType_t> TCP_RETRY_FREQUENCY = { 3_s, 10_s };

    constexpr static int STATUS_OPEN = BIT1; // Normal
    constexpr static int STATUS_CONNECTING = BIT2; // Normal

    sockaddr_in destAddr = {};
    int sock = -1;
    EventGroupHandle_t status;
    TickType_t lastRetry = 0;
    bool reconnectOnFail = false;

    char rxBuf[TCP_BUF_SIZE] = {};
    StreamBufferHandle_t rxStream = nullptr;

    // Create a TCP connection by connecting to a remote socket
    TcpClient(uint32_t targetIp, uint16_t port)
    {
        makeBufs();

        destAddr.sin_family = AF_INET;
        destAddr.sin_addr.s_addr = targetIp;
        destAddr.sin_port = htons(port);

        reconnectOnFail = true;
    }

    // Create a TCP connection by connecting to a remote socket
    TcpClient(const char* targetIp, uint16_t port)
    {
        makeBufs();

        destAddr.sin_family = AF_INET;
        inet_pton(AF_INET, targetIp, &destAddr.sin_addr);
        destAddr.sin_port = htons(port);

        reconnectOnFail = true;
    }

    // Create from a socket that already exists
    TcpClient(int fd, sockaddr_in* addr)
    {
        ESP_LOGI("rnet", "Construct TcpClient directly with FD %d", fd);
        sock = fd;
        memcpy(&this->destAddr, &addr, sizeof(addr));

        makeBufs();

        reconnectOnFail = false;

        xEventGroupSetBits(status, STATUS_OPEN);
    }

    void makeBufs()
    {
        status = xEventGroupCreate();
        rxStream = xStreamBufferCreate(TCP_BUF_SIZE, 1);
    }

    // Acts on a socket that is no longer usable
    // Returns whether to destroy the object
    bool invalidate()
    {
        ESP_LOGI("rnet", "Invalidating socket");

        sock = -1;
        xEventGroupClearBits(status, STATUS_OPEN);

        // Note: if a task is waiting on this stream, this call will silently fail
        xStreamBufferReset(rxStream);

        if (reconnectOnFail) 
        {
            ESP_LOGI("rnet", "Reconnecting due to reconnectOnFail with FD %d", sock);
            connect();
            return false;
        }
        else
        {
            return true;
        }
    }

    void connect()
    {
        if (sock != -1) {
            ESP_LOGE("rnet", "Tried to connect on full socket");
            // Already connected
            return;
        }

        xEventGroupSetBits(status, STATUS_CONNECTING);

        ESP_LOGI("rnet", "Start connect");

        // Backoff
        TickType_t now = xTaskGetTickCount();
        if (now - lastRetry < TCP_RETRY_FREQUENCY.first) {
            return;
        } else {
            lastRetry = now;
        }

        ESP_LOGI("rnet", "Start connect 2");

        sock = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock < 0) {
            perror("Socket creation failed");
            invalidate();
            return;
        }
        // CHECK(::ioctl(sock, O_NONBLOCK, 0) >= 0);
        // CHECK(esp_tls_set_socket_non_blocking(sock, true));

        ESP_LOGI("rnet", "Socket created, connecting");

        int err = ::connect(sock, (sockaddr*)&destAddr, sizeof(destAddr));
        if (err != 0) {
            perror("Socket unable to connect");
            invalidate();
            return;
        }
        ESP_LOGI("rnet", "Successfully connected");

        int flags = fcntl(sock, F_GETFL, NULL);
        CHECK(flags >= 0);
        flags |= O_NONBLOCK;
        CHECK(fcntl(sock, F_SETFL, flags));

        xEventGroupClearBits(status, STATUS_CONNECTING);
        xEventGroupSetBits(status, STATUS_OPEN);
    }

    bool isOpen()
    {
        if (sock < 0) {
            ESP_LOGE("rnet", "Invalidating for isOpen 1");
            invalidate();
            return false;
        }

        /*int error = 0;
        socklen_t errorsz = sizeof(error);
        int ret = getsockopt(sock, SOL_SOCKET, SO_ERROR, &error, &errorsz);

        if (ret != 0 || error != 0) {
            ESP_LOGI("rnet", "Invalidating for isOpen 2");
            invalidate();
            return false;
        }*/

        return true;
    }

    void waitToConnect()
    {
        xEventGroupWaitBits(status, STATUS_OPEN, pdFALSE, pdFALSE, portMAX_DELAY);
    }

    void send(std::string_view msg)
    {
        int err = ::send(sock, msg.data(), msg.size(), 0);
        if (err < 0) {
            perror("Error occurred during sending:");
        }
    }

    void recv()
    {
        if (!isOpen()) {
            ESP_LOGE("rnet", "Socket was not open for recv!");
            connect();
            return;
        }

        errno = 0;
        int len = ::recv(sock, rxBuf, sizeof(rxBuf), 0);

        if (len < 0) {
            if (errno == EWOULDBLOCK || errno == EAGAIN || errno == EINPROGRESS) {
                // Just skip it for now
            } else {
                // Error occurred during receiving, or socket closed
                perror("recv failed");
                invalidate();
            }
        } else {
            // Data received
            ESP_LOGI("rnet", "Received %d bytes", len);

            size_t sent = xStreamBufferSend(rxStream, (void*)rxBuf, len, portMAX_DELAY);
            CHECK(sent == len);
        }
    }

    int readUntilTerminator(char* buf, int max, char terminator)
    {
        ESP_LOGI("rnet", "Start read");
        char* i = buf;
        do {
            // Read a character out of the TCP stream
            int read = xStreamBufferReceive(rxStream, i, max, portMAX_DELAY);

            if (read < 0) {
                ESP_LOGE("rnet", "Stream buffer got bad msg %d", read);
                return -1;
            }

            i += read;
        } while (i != buf + max && i[-1] != terminator);

        if (i == buf + max) {
            // Packet was too big, abort
            ESP_LOGE("rnet", "packet was too big");
            invalidate();
            return 0;
        } else {
            return i - buf - 1;
        }
    }

    void sendHello()
    {
        char helloPacket[58];
        uint8_t mac[6];
        CHECK(esp_read_mac(mac, ESP_MAC_WIFI_STA));
        snprintf(helloPacket, sizeof(helloPacket), R"({"type":"CLIENT_HELLO","macAddress":"%02X:%02X:%02X:%02X:%02X:%02X"};)", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

        send(helloPacket);
    }

    ~TcpClient()
    {
        ESP_LOGI("rnet", "Removing TcpClient");

        // todo: this
        shutdown(sock, 0);
        close(sock);
    }
};

void startNetThread();

TcpClient* addTcpClient(uint32_t targetIp, uint16_t port);

constexpr int MAX_TCP_SOCKETS = 10;
constexpr int MAX_TCP_ACCEPT_SOCKETS = 0;
constexpr int TOTAL_DESCRIPTORS = MAX_TCP_SOCKETS + MAX_TCP_ACCEPT_SOCKETS;

extern TcpClient* clients[MAX_TCP_SOCKETS];
extern int clientsCount;
}; // namespace chessbot

#endif // ifndef CHESSBOT_NET_H
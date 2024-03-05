#include <freertos/FreeRTOS.h> // Mandatory first include

#include <esp_log.h>
#include <esp_netif.h>
#include <netdb.h>
#include <sys/poll.h>

#include <chessbot/log.h>
#include <chessbot/net.h>
#include <chessbot/util.h>

#define TAG "netthread"

namespace chessbot {

constexpr int MAX_TCP_SOCKETS = 10;

TcpClient* clients[MAX_TCP_SOCKETS];
int clientsCount = 0;

pollfd pollDescriptors[MAX_TCP_SOCKETS] = {};

int pipe()
{
    const struct addrinfo hints = {
        .ai_family = AF_INET,
        .ai_socktype = SOCK_DGRAM,
    };
    struct addrinfo* res;
    int err;
    struct sockaddr_in saddr = { 0 };

    // ESP_ERROR_CHECK(esp_netif_init());

    err = getaddrinfo("localhost", "79", &hints, &res);

    if (err != 0 || res == NULL) {
        ESP_LOGE(TAG, "DNS lookup failed: %d", errno);
        return -1;
    }

    int socket_fd = socket(res->ai_family, res->ai_socktype, 0);

    if (socket_fd < 0) {
        ESP_LOGE(TAG, "Failed to allocate socket.");
        freeaddrinfo(res);
        return -1;
    }

    saddr.sin_family = PF_INET;
    saddr.sin_port = htons(79);
    saddr.sin_addr.s_addr = htonl(INADDR_ANY);
    err = bind(socket_fd, (struct sockaddr*)&saddr, sizeof(struct sockaddr_in));
    if (err < 0) {
        ESP_LOGE(TAG, "Failed to bind socket");
        freeaddrinfo(res);
        close(socket_fd);
        return -1;
    }

    if (connect(socket_fd, res->ai_addr, res->ai_addrlen) != 0) {
        ESP_LOGE(TAG, "Socket connection failed: %d", errno);
        freeaddrinfo(res);
        close(socket_fd);
        return -1;
    }

    // freeaddrinfo(res);
    return socket_fd;
}

// Puts TCP socket output into strings, re-establishes closed/crashed sockets
// todo: freertos-native tcp queue abstraction
void netThread(void*)
{
    while (true) {
        int rc = poll(pollDescriptors, clientsCount, 500);
        if (rc < 0) {
            printf("Fail\n");
            FAIL();
        } else if (rc > 0) {
            // Something happened to a descriptor
            for (int i = 0; i < clientsCount; i++) {
                int revents = pollDescriptors[i].revents;

                // This is designed so that remaining data is read first, then an invalid state is handled
                if (revents & POLLIN) {
                    clients[i]->recv();
                } else if (revents & POLLNVAL) {
                    // Was never valid
                    clients[i]->invalidate();
                } else if (revents & (POLLHUP | POLLERR)) {
                    // Got closed
                    clients[i]->invalidate();
                }
            }
        }

        vTaskDelay(10_ms);
    }
}

void startNetThread()
{
    xTaskCreate(netThread, "net", CONFIG_TINYUSB_TASK_STACK_SIZE, nullptr, TaskPriority::net, nullptr);
    printf("Start net thread\n");
}

TcpClient* addTcpClient(const char* targetIp, uint16_t port)
{
    CHECK(clientsCount < MAX_TCP_SOCKETS);
    TcpClient* c = new TcpClient(targetIp, port);
    clients[clientsCount] = c;
    c->connect();

    pollDescriptors[clientsCount] = {
        .fd = c->sock,
        .events = POLLERR | POLLHUP | POLLIN
    };

    printf("Sending interrupt to pipe\n");

    return clients[clientsCount++];
}

}; // namespace chessbot
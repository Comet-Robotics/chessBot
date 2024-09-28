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

void startTcpServer();
void acceptTcpServer(int acceptSock);

TcpClient* clients[MAX_TCP_SOCKETS] = {};
int clientsCount = 0;

// Accept sockets first, then recieve sockets since there are more of them
pollfd pollDescriptors[TOTAL_DESCRIPTORS] = {};

void printBits(size_t const size, void const * const ptr)
{
    unsigned char *b = (unsigned char*) ptr;
    unsigned char byte;
    int i, j;
    
    for (i = size-1; i >= 0; i--) {
        for (j = 7; j >= 0; j--) {
            byte = (b[i] >> j) & 1;
            printf("%u", byte);
        }
    }
    puts("");
}

// Puts TCP socket output into strings, re-establishes closed/crashed sockets
void netThread(void*)
{
    while (true) {
        int rc = poll(pollDescriptors, clientsCount, 500);
        if (rc < 0) {
            printf("Poll failed!\n");
            FAIL();
        }
        else if (rc == 0) {
            // Poll just timed out
            continue;
        } else if (rc > 0) {
            // Something happened to a listening descriptor
            for (int i = MAX_TCP_ACCEPT_SOCKETS; i < (clientsCount + MAX_TCP_ACCEPT_SOCKETS); i++) {
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

            // Something happened to an accepting descriptor
            for (int i = 0; i < MAX_TCP_ACCEPT_SOCKETS; i++) {
                int revents = pollDescriptors[i].revents;

                if (revents != 0) {
                    printf("TCP IN REVENTS ");
                    printBits(2, &revents);
                    printf("\n");
                }

                // This is designed so that remaining data is read first, then an invalid state is handled
                if (revents & POLLIN) {
                    printf("Accept POLLIN\n");
                    acceptTcpServer(pollDescriptors[i].fd);
                } else if (revents & POLLNVAL) {
                    // Was never valid
                    printf("Accept POLLNVAL\n");
                    CHECK(false);
                } else if (revents & (POLLHUP | POLLERR)) {
                    // Got closed
                    printf("Reopening accepting TCP socket?\n");
                    startTcpServer();
                }
            }
        }
        vTaskDelay(1_ms);
    }
}

void startNetThread()
{   
    for (int i = 0; i < TOTAL_DESCRIPTORS; i++) {
        pollDescriptors[i].fd = -1;
    }

    startTcpServer();

    xTaskCreate(netThread, "net", TaskStackSize::LARGE, nullptr, TaskPriority::NET, nullptr);

    printf("Started net thread\n");
}

TcpClient* addTcpClient(uint32_t targetIp, uint16_t port)
{
    CHECK(clientsCount < MAX_TCP_SOCKETS);
    TcpClient* c = new TcpClient(targetIp, port);
    clients[clientsCount] = c;
    c->connect();

    pollDescriptors[clientsCount] = {
        .fd = c->sock,
        .events = POLLERR | POLLHUP | POLLIN
    };

    return clients[clientsCount++];
}

// Add a client to poll from an already created socket
TcpClient* addTcpClient(int fd)
{
    CHECK(clientsCount < MAX_TCP_SOCKETS);
    TcpClient* c = new TcpClient(fd);
    clients[clientsCount] = c;

    pollDescriptors[clientsCount] = {
        .fd = c->sock,
        .events = POLLERR | POLLHUP | POLLIN
    };

    return clients[clientsCount++];
}

void startTcpServer()
{
    addrinfo hints = {};
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
    hints.ai_flags = AI_PASSIVE;

    addrinfo* serverSocketInfo = nullptr;
    CHECK(getaddrinfo(NULL, "80", &hints, &serverSocketInfo) == 0);

    int sock = -1;

    for (addrinfo* i = serverSocketInfo; i != nullptr; i = i->ai_next) {
        sock = socket(i->ai_family, i->ai_socktype, i->ai_protocol);
        if (sock < 0) {
            perror("socket() error, nonfatal");
            continue;
        }

        int on = 1;
        CHECK(setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on)) == 0);;

        CHECK(bind(sock, i->ai_addr, i->ai_addrlen) == 0);

        break;
    }

    freeaddrinfo(serverSocketInfo);

    CHECK(listen(sock, 5) == 0);

    CHECK(fcntl(sock, F_SETFD, O_NONBLOCK) == 0);

    pollDescriptors[0] = {
        .fd = sock,
        .events = POLLERR | POLLHUP | POLLIN
    };

    return;

/*

    sockaddr_in destAddr = {};

    destAddr.sin_family = AF_INET;
    destAddr.sin_addr.s_addr = htonl(INADDR_ANY);
    destAddr.sin_port = htons(80);

    // Open a TCP socket on port 80
    int sock = socket(AF_INET, SOCK_STREAM, IPPROTO_IP);
    CHECK(sock >= 0);

    int yes = 1;

    // Allow sock to be reused 
    CHECK(setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(yes)) == 0);;

    // Set socket to be nonblocking, which will be inherited by children
    CHECK(ioctl(sock, FIONBIO, &yes) == 0);

    int flags = fcntl(sock, F_GETFL, NULL);
    CHECK(flags >= 0);
    flags |= O_NONBLOCK;
    CHECK(fcntl(sock, F_SETFL, flags) != -1);

    CHECK(bind(sock, (sockaddr*)&destAddr, sizeof(destAddr)) == 0);

    CHECK(listen(sock, 5) == 0);

    pollDescriptors[0] = {
        .fd = sock,
        .events = POLLERR | POLLHUP | POLLIN
    };
    */
}

void acceptTcpServer(int acceptSock)
{
    struct sockaddr sourceAddr;
    socklen_t addrLen = sizeof(sourceAddr);
    printf("preAccept\n");
    int sock = accept(acceptSock, (struct sockaddr*)&sourceAddr, &addrLen);
    if (sock < 0) {
        printf("Unable to accept connection: errno %d\n", errno);
        return;
    }
    printf("postAccept 2\n");

    //setsockopt(sock, SOL_SOCKET, SO_KEEPALIVE, &keepAlive, sizeof(int));
    //setsockopt(sock, IPPROTO_TCP, TCP_KEEPIDLE, &keepIdle, sizeof(int));
    //setsockopt(sock, IPPROTO_TCP, TCP_KEEPINTVL, &keepInterval, sizeof(int));
    //setsockopt(sock, IPPROTO_TCP, TCP_KEEPCNT, &keepCount, sizeof(int));

    char addrStr[16];
    inet_ntoa_r(((struct sockaddr_in *)&sourceAddr)->sin_addr, addrStr, sizeof(addrStr) - 1);
    printf("Opened socket to %s\n", addrStr);

    TcpClient* client = addTcpClient(sock);

    client->sendHello();
}

}; // namespace chessbot
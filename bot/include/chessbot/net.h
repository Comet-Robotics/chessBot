#ifndef CHESSBOT_NET_H
#define CHESSBOT_NET_H

#include <errno.h>
#include <sys/socket.h>

#include <string_view>

#include <chessbot/log.h>
#include <chessbot/unit.h>

namespace chessbot {
enum class NetClientType {
    Tcp,
    Udp,
};

template <int bufSize>
struct NetBuf {
    char buf[bufSize] = {};
    char* r = buf;
    char* w = buf;

    int remaining()
    {
        return bufSize - size();
    }

    int size()
    {
        return w - r;
    }

    char* end()
    {
        return buf + bufSize;
    }

    bool full()
    {
        return w == end() - 1;
    }

    bool empty()
    {
        return r == w;
    }

    void push_back(char c)
    {
        CHECK(!full());
        if (full) {return;}

        *w++ = c;
    }

    char* write()
    {
        return w;
    }

    char* read()
    {
        return r;
    }

    void compact()
    {
        //CHECK(w >= r);
        if (w < r)
        {
            printf("Buffer corrupted, returning to center\n");
            w = buf;
            r = buf;
            return;
        }

        char* front = buf;

        while (r != w) {
            *front++ = *r++;
        }

        *front = '\0';
        r = buf;
        w = front;
    }

    void clear()
    {
        r = buf;
        w = buf;
        *w = '\0';
    }

    bool contains(char c)
    {
        for (char* i = r; r < w; i++) {
            if (*i == c) {
                return true;
            }
        }

        return false;
    }

    int find(char c)
    {
        for (char* i = r; r < w; i++) {
            if (*i == c) {
                return i - read();
            }
        }

        return -1;
    }
};

class TcpClient {
public:
    constexpr static size_t TCP_BUF_SIZE = 8192 / 2;
    constexpr static TickType_t TCP_RETRY_FREQUENCY = 10_s;

    enum class Status {
        OFF,
        BAD,
        OPEN
    };

    NetBuf<TCP_BUF_SIZE> rxBuf;

    sockaddr_in destAddr = {};
    int sock = -1;
    Status status = Status::OFF;
    TickType_t lastRetry = 0;

    TcpClient(uint32_t targetIp, uint16_t port)
    {
        //destAddr.sin_addr.s_addr = targetIp;

        inet_pton(AF_INET, "192.168.153.73", &destAddr.sin_addr);

        destAddr.sin_family = AF_INET;
        destAddr.sin_port = htons(3001);
    }

    void connect()
    {
        if (status == Status::OPEN) {
            return;
        } else if (status == Status::BAD) {
            // Clear
            rxBuf.clear();
            sock = -1;
        }

        // Backoff
        TickType_t now = xTaskGetTickCount();
        if (now - lastRetry < TCP_RETRY_FREQUENCY) {
            return;
        }
        else {
            lastRetry = now;
        }

        printf("Start connect 3\n");

        sock = socket(AF_INET, SOCK_STREAM, IPPROTO_IP);
        if (sock < 0) {
            perror("Sock fail:");
            printf("Socket creation failed: errno %d", errno);
            sock = -1;
            status = Status::BAD;
            return;
        }
        printf("Socket created, connecting\n");

        int err = ::connect(sock, (sockaddr*)&destAddr, sizeof(destAddr));
        if (err != 0) {
            //printf("Socket unable to connect: errno %d", errno);
            perror("Socket unable to connect:");
            sock = -1;
            status = Status::BAD;
            return;
        }
        printf("Successfully connected");

        status = Status::OPEN;
    }

    bool check()
    {
        if (sock == -1) {
            status = Status::BAD;
            return false;
        }

        int error = 0;
        socklen_t len = sizeof(error);
        int ret = getsockopt(sock, SOL_SOCKET, SO_ERROR, &error, &len);

        if (ret != 0 || error != 0) {
            status = Status::BAD;
            return false;
        }

        return true;
    }

    void waitToConnect()
    {
        while (status != Status::OPEN)
        {
            vTaskDelay(1_s);
            printf("Waiting for socket to be open\n");
        }
    }

    void tick()
    {
        if (!check()) {
            connect();
            return;
        }

        recv();
    }

    void send(std::string_view msg)
    {
        int err = ::send(sock, msg.data(), msg.size(), 0);
        if (err < 0) {
            perror("Hey:");
            printf("Error occurred during sending: errno %d\n", errno);
        }
    }

    void recv()
    {
        if (!check()) {
            connect();
            return;
        }

        int len = ::recv(sock, rxBuf.write(), rxBuf.remaining(), 0);

        if (len < 0) {
            // Error occurred during receiving
            printf("recv failed: errno %d", errno);
            perror("recv failed\n");
            status = Status::BAD;
        } else {
            // Data received
            printf("Received %d bytes\n", len);

            rxBuf.w += len;
            rxBuf.compact();

            printf("%s\n", rxBuf.read());
        }
    }

    ~TcpClient()
    {
        shutdown(sock, 0);
        close(sock);
    }
};

void startNetThread();

TcpClient* addTcpClient(uint32_t targetIp, uint16_t port);
}; // namespace chessbot

#endif // ifndef CHESSBOT_NET_H
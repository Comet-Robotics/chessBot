#include <freertos/FreeRTOS.h> // Mandatory first include

#include <variant>
#include <vector>

#include <chessbot/net.h>
#include <chessbot/util.h>

namespace chessbot {

TcpClient* clients[10];
int clientsCount = 0;

// Puts TCP socket output into strings, re-establishes closed/crashed sockets
// todo: freertos-native tcp queue abstraction
void netThread(void*)
{
    while (true) {
        for (int i = 0; i < clientsCount; i++) {
            clients[i]->tick();
        }

        vTaskDelay(10_ms);
    }
}

void startNetThread()
{
    xTaskCreate(netThread, "net", configMINIMAL_STACK_SIZE, nullptr, TaskPriority::net, nullptr);
}

TcpClient* addTcpClient(uint32_t targetIp, uint16_t port)
{
    clients[clientsCount++] = new TcpClient(targetIp, port);
    return clients[clientsCount - 1];
}

}; // namespace chessbot
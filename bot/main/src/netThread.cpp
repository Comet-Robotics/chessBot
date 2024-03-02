#include <freertos/FreeRTOS.h> // Mandatory first include

#include <variant>
#include <vector>

#include <chessbot/net.h>
#include <chessbot/util.h>

namespace chessbot {

std::vector<std::variant<TcpClient>> clients;

// Puts TCP socket output into strings, re-establishes closed/crashed sockets
//todo: freertos-native tcp queue abstraction
void netThread(void*)
{
    while (true) {
        for (auto& container : clients) {
            if (TcpClient* client = std::get_if<TcpClient>(&container)) {
                client->tick();
            }
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
    clients.emplace_back(TcpClient(targetIp, port));
    return std::get_if<TcpClient>(&clients.back());
}

}; // namespace chessbot
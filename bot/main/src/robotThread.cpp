#include <freertos/FreeRTOS.h> // Mandatory first include

#include <iostream>

#include <ArduinoJson.h>

#include <chessbot/robot.h>

namespace chessbot {

char buf[TcpClient::TCP_BUF_SIZE];

// On its thread, a robot parses commands and acts on them
void robotThread(void* robotPtr)
{
    Robot& bot = *(Robot*)(robotPtr);

    while (true) {
        printf("Start loop\n");
        int read = bot.client->readUntilTerminator(buf, sizeof(buf), ';');

        printf("Mid loop\n");

        std::string_view str(buf, read);
        std::cout << "Deserializing " << str << '\n';

        // Read JSON packet
        //JsonDocument json;
        //DeserializationError error = deserializeJson(json, str);

        /*if (error) {
            printf("deserializeJson() failed: %s\n", error.c_str());
        }

        printf("Post deserialize\n");

        if (json["type"] == "DRIVE_TANK") {
            printf("Post in\n");
            float left = json["left"].as<float>();
            float right = json["right"].as<float>();
            printf("Post f\n");
            printf("Driving that tank! %f %f\n", left, right);
            bot.left.set(left);
            bot.right.set(right);
            printf("Post set\n");
        }*/

        vTaskDelay(10_ms);
    }
}

void Robot::runThread()
{
    CHECK(xTaskCreate(robotThread, "robotThread", configMINIMAL_STACK_SIZE, (void*)this, tskIDLE_PRIORITY + 1, &this->task) == pdPASS);
}

}; // namespace chessbot
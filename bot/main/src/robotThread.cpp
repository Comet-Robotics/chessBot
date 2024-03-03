#include <freertos/FreeRTOS.h> // Mandatory first include

#include <iostream>

#include <ArduinoJson.h>

#include <chessbot/robot.h>

namespace chessbot {

// On its thread, a robot parses commands and acts on them
void robotThread(void* robotPtr)
{
    Robot& bot = *(Robot*)(robotPtr);
    JsonDocument json;

    while (true) {
        auto& buf = bot.client->rxBuf;
        int offset = buf.find(';');
        if (offset != -1) {
            std::string_view str(buf.read(), offset);
            std::cout << "Deserializing " << str << '\n';

            // Read JSON packet
            DeserializationError error = deserializeJson(json, str);
            buf.r += offset;
            printf("Next char is now %c\n", *buf.r);
            buf.r++; // Read past semicolon

            if (error) {
                printf("deserializeJson() failed: %s\n", error.c_str());
            }

            if (json["type"] == "DRIVE_TANK") {
                float left = json["left"].as<float>();
                float right = json["right"].as<float>();
                printf("Driving that tank! %f %f\n", left, right);
                bot.left.set(left);
                bot.right.set(right);
            }
        }

        vTaskDelay(10_ms);
    }
}

void Robot::runThread()
{
    CHECK(xTaskCreate(robotThread, "robotThread", configMINIMAL_STACK_SIZE, (void*)this, tskIDLE_PRIORITY + 1, &this->task) == pdPASS);
}

}; // namespace chessbot
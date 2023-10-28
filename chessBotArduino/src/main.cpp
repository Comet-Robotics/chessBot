#include <Arduino.h>

// #include <String>

#include "staticConfig.h"
#include "dynamicConfig.h"
#include "robot.h"
#include "motor.h"
#include "packet.h"
#include "testingSuite.h"

using namespace ChessBotArduino;

void setup()
{
    delay(500);

    testing = new TestingSuite();

    delay(1000);
}

void loop()
{
    unsigned long ms = millis();

    testing->log(ms);

    /*char cmd[256];
    while (Serial.available()) {
        Serial.readBytesUntil(PACKET_START_CHAR, cmd, 255);
        memset(cmd, '\0', 100);
        int len = Serial.readBytesUntil(PACKET_END_CHAR, cmd, 250);

        handlePacket(cmd, len);
    }*/
}
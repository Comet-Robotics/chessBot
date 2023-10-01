#include <Arduino.h>

// #include <String>

#include "staticConfig.h"
#include "dynamicConfig.h"
#include "robot.h"
#include "motor.h"
#include "packet.h"

using namespace ChessBotArduino;

void setup()
{
    delay(500);

    Serial.begin(9600);

    CONFIG::setupGpio();

    robotInst = new Robot();

    robotInst->kinematics.forward(12);

    delay(1000);
}

void log(unsigned long ms)
{
#define LOG_FREQ 1000 // ms
    static unsigned long lastLog = 0;

    if (ms - lastLog > LOG_FREQ)
    {
        Serial.print(robotInst->kinematics.leftPidIn);
        Serial.print(" ");        
        Serial.print(robotInst->kinematics.leftPidOut);
        Serial.print(" ");
        Serial.print(robotInst->left.pos());
        Serial.print(" ");
        Serial.print(robotInst->kinematics.leftPidTarget);
        Serial.print(" ");
        Serial.println();

        lastLog = ms;
    }
}

void loop()
{
    unsigned long ms = millis();

    log(ms);

    robotInst->kinematics.tick(ms);

    /*char cmd[256];
    while (Serial.available()) {
        Serial.readBytesUntil(PACKET_START_CHAR, cmd, 255);
        memset(cmd, '\0', 100);
        int len = Serial.readBytesUntil(PACKET_END_CHAR, cmd, 250);

        handlePacket(cmd, len);
    }*/
}
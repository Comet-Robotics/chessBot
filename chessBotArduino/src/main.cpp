#include <Arduino.h>

// #include <String>

#include "staticConfig.h"
#include "dynamicConfig.h"
#include "robot.h"
#include "motor.h"
#include "packet.h"
#include "pathFollowing.h"

using namespace ChessBotArduino;

void setup()
{
    delay(500);

    Serial.begin(9600);

    CONFIG::setupGpio();

    robotInst = new Robot();

    delay(1000);

    initPathFollowing();

    startPathFollowing();

    //robotInst->left.setIntPower(250);
    //robotInst->right.setIntPower(250);
}

unsigned long lastLog = 0;
unsigned long lastTick = 0;

void loop()
{
    unsigned long ms = millis();

    if (ms - lastLog > 1000)
    {
        /*Serial.print(((Encoder_internal_state_t *)(&robotInst->left.encoder->encoder))->position);
        Serial.print(" ");
        Serial.print(((Encoder_internal_state_t *)(&robotInst->right.encoder->encoder))->position);
        Serial.print(" ");*/

        Serial.print(leftPulses);
        Serial.print(" ");
        Serial.print(rightPulses);
        Serial.print(" ");

        Serial.print(premo->getX());
        Serial.print(" ");
        Serial.print(premo->getY());
        Serial.print(" ");

        /*float *i = premo->getLocationData();

        for (int j = 0; j < 5; j++)
        {
            Serial.print(i[j], 6);
            Serial.print(" ");
        }*/

        Serial.println();

        lastLog = ms;
    }

    if (ms - lastTick > 25)
    {
        // tickPathFollowing();
        lastTick = ms;
    }

    tickPathFollowing();

    /*char cmd[256];
    while (Serial.available()) {
        Serial.readBytesUntil(PACKET_START_CHAR, cmd, 255);
        memset(cmd, '\0', 100);
        int len = Serial.readBytesUntil(PACKET_END_CHAR, cmd, 250);

        handlePacket(cmd, len);
    }*/

    // delay(1000);
}
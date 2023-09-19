#include <Arduino.h>

//#include <String>

#include "config.h"
#include "robot.h"
#include "motor.h"
#include "packet.h"

using namespace ChessBotArduino;

void setup() {
    Serial.begin(9600);

    CONFIG::setupGpio();

    robotInst = new Robot();
}

String pbuf;

char hexChars[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };

void loop() {
    //Serial.println(robotInst->left.pos());

    //robotInst->left.setPower(1.0);
    //robotInst->right.setPower(1.0);

    //Serial.write(":0000ff01;");

    char cmd[257];
    while (Serial.available()) {
        Serial.readBytesUntil(PACKET_START_CHAR, cmd, 250);
        memset(cmd, '\0', 100);
        int len = Serial.readBytesUntil(PACKET_END_CHAR, cmd, 250);

        //Serial.println(cmd);

        handlePacket(cmd, len);
    }
    
    /*while (Serial.available() > 0) {
        int byte = Serial.read();
        pbuf.concat(hexChars[(byte >> 8) & 0xf]);
        pbuf.concat(hexChars[byte & 0xf]);
        
    }
    Serial.println(pbuf.c_str());
    pbuf = String();*/

    delay(1000);
}
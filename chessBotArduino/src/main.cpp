#include <Arduino.h>

#include "config.h"
#include "robot.h"
#include "motor.h"

using namespace ChessBotArduino;

void setup() {
    Serial.begin(9600);

    CONFIG::setupGpio();

    robotInst = new Robot();
}

void loop() {
    Serial.println(robotInst->left.pos());

    robotInst->left.setPower(1.0);
    robotInst->right.setPower(1.0);

    delay(1000);
}
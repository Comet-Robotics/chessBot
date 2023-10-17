#ifndef CHESSBOTARDUINO_TESTINGSUITE_H
#define CHESSBOTARDUINO_TESTINGSUITE_H

#include "staticConfig.h"
#include "dynamicConfig.h"
#include "robot.h"

#include "Photodiode.h"

namespace ChessBotArduino
{
    class TestingSuite
    {
    public:

        FRPhotodiode FR_Diode;
        FLPhotodiode FL_Diode;
        BRPhotodiode BR_Diode;
        BLPhotodiode BL_Diode;

        TestingSuite() {
            setup();
        }

        void setup()
        {
            CONFIG::setupGpio();

            Serial.begin(9600);
            pinMode(12, OUTPUT);
            digitalWrite(12,HIGH);

            robotInst = new Robot();
            robotInst->kinematics.forward(12);
        }

        void pidTest() {
            Serial.print("pIn: ");
            Serial.print(robotInst->kinematics.leftPidIn);
            Serial.print(", pOut: ");
            Serial.print(robotInst->kinematics.leftPidOut);
            Serial.print(", pos: ");
            Serial.print(robotInst->left.pos());
            Serial.print(", target: ");
            Serial.println(robotInst->kinematics.leftPidTarget);
        }

        void lightMeasurementTest()
        {
            Serial.print("FR: ");
            Serial.print(FR_Diode.GetAnalogLightMeasurement());
            Serial.print(", FL: ");
            Serial.print(FL_Diode.GetAnalogLightMeasurement());
            Serial.print(", BR: ");
            Serial.print(BR_Diode.GetAnalogLightMeasurement());
            Serial.print(", BL");
            Serial.println(BL_Diode.GetAnalogLightMeasurement());
        }

        void log(unsigned long ms)
        {
        #define LOG_FREQ 1000 // ms
            static unsigned long lastLog = 0;

            if (ms - lastLog > LOG_FREQ)
            {
                Serial.println("--- PID Test ---");
                pidTest();
                Serial.println("--- Relay On ---");
                digitalWrite(LEGACY_2012_DESIGN::RELAY_IR_LED, HIGH);
                delay(1); 
                lightMeasurementTest();
                Serial.println("--- Relay Off ---");
                digitalWrite(LEGACY_2012_DESIGN::RELAY_IR_LED, LOW);
                delay(1); 
                lightMeasurementTest();
                Serial.println();
                lastLog = ms;
            }

            robotInst->kinematics.tick(ms);
        }
    };

    TestingSuite *testing;
};

#endif
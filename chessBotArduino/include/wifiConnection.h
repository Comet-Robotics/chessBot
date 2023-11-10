#ifndef CHESSBOTARDUINO_WIFI_H
#define CHESSBOTARDUINO_WIFI_H

#include <WiFi.h>
#include <stdlib.h>

#include "staticConfig.h"
#include "packet.h"
#include "robot.h"

namespace ChessBotArduino
{

    struct PacketReader
    {
        char packetReadBuf[300];
        // read cursor
        char *r = packetReadBuf;
        // write cursor
        char *w = packetReadBuf;

        WiFiClient client;

        void run()
        {
            w += client.read((uint8_t*)r, spaceLeftInBuf());

            if (w == packetReadBuf + sizeof(packetReadBuf))
            {
                shiftBufBack();
            }

            w += client.read((uint8_t*)r, spaceLeftInBuf());

            Serial.print("buf state");
            Serial.println(r);

            if (r[0] != ':' || std::find(r, w, ';') == w)
            {
                // Invalid state, reset and try again
                // todo: make this more tolerant
                Serial.print(r[0] != ':');
                Serial.print(std::find(r, w, ';'));
                Serial.println("invalid packet state");
            }

            while (r <= w)
            {
                actOnPacket(r + 1, std::find(r, w, ';') - 1);
                r = w + 1;
            }

            if (r > w) {
                r = w;
                shiftBufBack();
            }
        }

        int spaceLeftInBuf()
        {
            return (packetReadBuf + sizeof(packetConstructBuf)) - r;
        }

        // Shift r back to the start of the buffer, keeping w at the same offset
        void shiftBufBack()
        {
            Serial.println("shift buf back");
            std::copy(r, w, packetReadBuf);
            w = packetReadBuf + (w - r);
            r = packetReadBuf;
        }

        void actOnPacket(char *start, char *end)
        {
            char* r = start;
            auto type = (PacketType)hexToNum(r, 2);
            r += 2;

            Serial.print("see packet type ");
            Serial.println(type);

            #define EXPECT_CHAR(c) if (*(r++) != c) { return; }

            if (type == PacketType::ESTOP) {
                Serial.println("ESTOP");
                robotInst->stop();
                ESP.restart();
            }
            else if (type == PacketType::DRIVE) {
                Serial.println("s1");

                // ,1.0,1.0
                EXPECT_CHAR(',');
                Serial.println("s2");

                float leftPower = strtof(r, &r);
                Serial.println("s3");

                EXPECT_CHAR(',');
                Serial.println("s4");

                float rightPower = strtof(r, &r);
                Serial.println("s5");
                Serial.println(leftPower);
                Serial.println(rightPower);


                robotInst->left.setPower(leftPower);
                Serial.println("s6");

                robotInst->right.setPower(rightPower);
                Serial.println("s7");

            }
        }
    };

    void connectToServer()
    {
        PacketReader reader;

        int loopCount = 0;
        while (!reader.client.connect(SERVER_IP, SERVER_PORT))
        {
            delay(1000);
            Serial.println("*");

            if (loopCount++ > 10)
            {
                ESP.restart();
            }
        }

        Serial.println("Connected to server!");

        reader.client.print(make<PacketType::CLIENT_HELLO>());

        while (reader.client.connected())
        {
            if (reader.client.available())
            {
                reader.run();
            }
        }
    }

    void connectToWifi()
    {
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

        Serial.print("Connecting to wifi network ");
        Serial.println(WIFI_SSID);

        int loopCount = 0;
        while (WiFi.status() != WL_CONNECTED)
        {
            delay(1000);
            Serial.println(".");

            if (loopCount++ > 100)
            {
                ESP.restart();
            }
        }

        Serial.print("Connected to WiFi network with IP Address: ");
        Serial.println(WiFi.localIP());

        Serial.print("Connecting to ChessBot Server ");
        connectToServer();
    }

};

#endif // ifndef CHESSBOTARDUINO_WIFI_H
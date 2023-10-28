#ifndef CHESSBOTARDUINO_WIFI_H
#define CHESSBOTARDUINO_WIFI_H

#include <WiFi.h>

#include "staticConfig.h"
#include "packet.h"

namespace ChessBotArduino
{

void connectToServer() {
    WiFiClient client;

    int loopCount = 0;
    while (!client.connect(SERVER_IP, SERVER_PORT)) {
        delay(1000);
        Serial.println("*");

        if (loopCount++ > 10) {
            ESP.restart();
        }
    }
    
    Serial.println("Connected to server!");

    client.print(make<PacketType::CLIENT_HELLO>());

    while (client.connected()) {
        if (client.available()) {
            char c = client.read();
            Serial.print(c);
        }
    }
}

void connectToWifi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to wifi network ");
    Serial.println(WIFI_SSID);

    int loopCount = 0;
    while (WiFi.status() != WL_CONNECTED){
        delay(1000);
        Serial.println(".");

        if (loopCount++ > 100) {
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
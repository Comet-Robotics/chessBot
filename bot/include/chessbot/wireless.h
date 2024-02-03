#ifndef WIRELESS_H
#define WIRELESS_H

#include <freertos/FreeRTOS.h> // Mandatory first include

namespace chessbot
{

    bool isWifiConnected();

    void waitForWifiConnection();

    // Connect to wifi and start the service to automatically reconnect
    void startWifi();

};

#endif // ifndef WIRELESS_H
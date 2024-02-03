#ifndef CHESSBOT_WIRELESS_H
#define CHESSBOT_WIRELESS_H

namespace chessbot {
bool isWifiConnected();

void waitForWifiConnection();

// Connect to wifi and start the service to automatically reconnect
void startWifi();
}; // namespace chessbot

#endif // ifndef CHESSBOT_WIRELESS_H
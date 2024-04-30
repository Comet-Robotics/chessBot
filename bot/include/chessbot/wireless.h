#ifndef CHESSBOT_WIRELESS_H
#define CHESSBOT_WIRELESS_H

namespace chessbot {
bool isWifiConnected();

void waitForWifiConnection();

// Connect to wifi and start the service to automatically reconnect
void startWifi();

enum class SLEEP_MODE {
    ACTIVE, // High clock, ready for manual driving
    MAX_MODEM_SLEEP,
    DEEP_SLEEP, // Wake up every 5m or so to check for TCP commands
};

void setWifiSleepPolicy(SLEEP_MODE mode);
}; // namespace chessbot

#endif // ifndef CHESSBOT_WIRELESS_H
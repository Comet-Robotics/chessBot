#ifndef CHESSBOT_WIRELESS_H
#define CHESSBOT_WIRELESS_H

namespace chessbot {
bool isWifiConnected();

void waitForWifiConnection();

// Connect to wifi and start the service to automatically reconnect
void startWifi();

enum class SLEEP_MODE {
    // High clock
    // Sees packets as soon as they reach it
    // Drops to deep after 1m
    // Used during manual driving
    ACTIVE,

    // Low clock, wake up every DTIM to check for TCP commands
    // Sees packets every DTIM (100ms on our setup)
    // Drops to deep after 1m
    // Used during standard driving
    LIGHT_SLEEP,

    // Low clock, wake up every 5s (listen interval) to check for TCP commands
    // May drop packets that were sent inbetween DTIMs
    DEEP_SLEEP,

    // Low clock, wake up every 5m
    // May require reconnecting to wifi, or just using a high listen interval
    // Used during long-term idling (boost converter probably draws more)
    HIBERNATION
};

void setWifiSleepPolicy(SLEEP_MODE mode);
}; // namespace chessbot

#endif // ifndef CHESSBOT_WIRELESS_H
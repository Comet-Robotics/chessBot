#ifndef CHESSBOT_ACTIVITY_LED_H
#define CHESSBOT_ACTIVITY_LED_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/unit.h>

namespace chessbot {
// Activity LED meanings by priority:
// 50ms:    OTA Update
// 5000ms:  Connected
// 1000ms:  Disconnected
constexpr TickType_t ACTIVITY_LED_DELAY_OTA = 50_ms;
constexpr TickType_t ACTIVITY_LED_DELAY_CONNECTED = 5000_ms;
constexpr TickType_t ACTIVITY_LED_DELAY_DISCONNECTED = 1000_ms;

extern bool activityLedIsOta;
extern bool activityLedIsConnected;

void startActivityLed();

void stopActivityLed();
}; // namespace chessbot

#endif // ifndef CHESSBOT_ACTIVITY_LED_H
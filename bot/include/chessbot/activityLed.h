#ifndef CHESSBOT_ACTIVITY_LED_H
#define CHESSBOT_ACTIVITY_LED_H

#include <freertos/FreeRTOS.h> // Mandatory first include

namespace chessbot {
// Delay between toggling the LED
extern TickType_t activityLedDelay;

void startActivityLed();

void stopActivityLed();
}; // namespace chessbot

#endif // ifndef CHESSBOT_ACTIVITY_LED_H
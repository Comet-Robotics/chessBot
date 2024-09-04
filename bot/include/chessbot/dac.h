#ifndef CHESSBOT_DAC_H
#define CHESSBOT_DAC_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <driver/ledc.h>

#include <chessbot/allocation.h>

namespace chessbot {
// Works on any GPIO pin through LEDC
class PwmPin {
    ledc_channel_t channel;
    float level;
    gpio_num_t pin;

public:
    PwmPin(gpio_num_t pin);
    ~PwmPin();

    // 0-1.0
    void set(float level);

private:
    static ledc_channel_t getFreeLedcChannel();
    static void freeLedcChannel(ledc_channel_t channel);
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_DAC_H
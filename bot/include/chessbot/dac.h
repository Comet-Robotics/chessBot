#ifndef CHESSBOT_DAC_H
#define CHESSBOT_DAC_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <driver/ledc.h>

#include <chessbot/allocation.h>

namespace chessbot {
// Works on any GPIO pin through LEDC
class PwmPin {
public:
    constexpr static ledc_timer_bit_t LEDC_DUTY_RES = LEDC_TIMER_14_BIT; //LEDC_TIMER_13_BIT;

    // The ESP32-S2 only supports low speed mode (software emulation)
    constexpr static ledc_mode_t LEDC_MODE = LEDC_LOW_SPEED_MODE;

private:
    ledc_channel_t channel;
    float level;
    gpio_num_t pin;

public:
    PwmPin(gpio_num_t pin);
    ~PwmPin();

    void setDuty(uint32_t duty);

    // [0, 1.0]
    // Does conversion to duty
    void set(float level);

private:
    static ledc_channel_t getFreeLedcChannel();
    static void freeLedcChannel(ledc_channel_t channel);
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_DAC_H
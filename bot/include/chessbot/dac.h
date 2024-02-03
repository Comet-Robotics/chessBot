#ifndef CHESSBOT_DAC_H
#define CHESSBOT_DAC_H

#include <freertos/FreeRTOS.h> // Mandatory first include
#include <freertos/task.h>

#include <driver/ledc.h>

#include <chessbot/log.h>

namespace chessbot
{

    // Only works on pins 17 and 18 on the ESP32-S2
    struct DacPin
    {
        DacPin(int pin);

        // 0-255
        void set(int level);

        // 0-1.0
        void set(float level);
    };

    // Works on any GPIO pin through LEDC
    class PwmPin
    {
        ledc_channel_t channel;
        float level;
        int pin;

    public:
        PwmPin(int pin);
        ~PwmPin();

        // 0-1.0
        void set(float level);

    private:
        static ledc_channel_t getFreeLedcChannel();
        static void freeLedcChannel(ledc_channel_t channel);
    };

};

#endif // ifndef CHESSBOT_DAC_H
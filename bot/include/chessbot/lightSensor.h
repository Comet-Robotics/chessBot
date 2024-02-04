#ifndef CHESSBOT_LIGHT_SENSOR_H
#define CHESSBOT_LIGHT_SENSOR_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/adc.h>

namespace chessbot {
class LightSensor {
    adc_channel_t channel;

public:
    LightSensor(gpio_num_t channel_)
        : channel((adc_channel_t)channel_)
    {
        adcInitPin(channel);
    }

    int read()
    {
        return adcRead(channel);
    }
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_LIGHT_SENSOR_H
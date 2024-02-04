#ifndef CHESSBOT_ADC_H
#define CHESSBOT_ADC_H

#include <freertos/FreeRTOS.h> // Mandatory first include

#include <esp_adc/adc_oneshot.h>

namespace chessbot {
esp_err_t initAdc();

void adcInitPin(adc_channel_t channel, adc_atten_t atten = ADC_ATTEN_DB_11);

// 0-2,200mV
int adcRead(adc_channel_t channel);
}; // namespace chessbot

#endif // ifndef CHESSBOT_ADC_H
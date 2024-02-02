#ifndef CHESSBOT_ADC_H
#define CHESSBOT_ADC_H

#include "freertos/task.h"

#include "esp_adc/adc_oneshot.h"
#include "esp_adc/adc_cali.h"
#include "esp_adc/adc_cali_scheme.h"

#include <chessbot/log.h>

esp_err_t initAdc();

void adcInitPin(adc_channel_t channel, adc_atten_t atten = ADC_ATTEN_DB_11);

#endif // ifndef CHESSBOT_ADC_H
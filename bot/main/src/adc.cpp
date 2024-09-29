#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/adc.h>

#include <chessbot/log.h>

namespace chessbot {
adc_oneshot_unit_handle_t adcHandle = nullptr;
adc_cali_handle_t adc1_cali_chan0_handle = NULL;

esp_err_t initAdc()
{
    adc_oneshot_unit_init_cfg_t adcConfig = {};
    adcConfig.unit_id = ADC_UNIT_1;

    CHECK_RET(adc_oneshot_new_unit(&adcConfig, &adcHandle));

    return ESP_OK;
}

bool example_adc_calibration_init(adc_unit_t unit, adc_channel_t channel, adc_atten_t atten, adc_cali_handle_t* out_handle)
{
    adc_cali_handle_t handle = NULL;
    esp_err_t ret = ESP_FAIL;
    bool calibrated = false;

    if (!calibrated) {
        ESP_LOGI("", "calibration scheme version is %s", "Line Fitting");
        adc_cali_line_fitting_config_t cali_config = {};
        cali_config.unit_id = unit;
        cali_config.atten = atten;
        cali_config.bitwidth = ADC_BITWIDTH_DEFAULT;
        ret = adc_cali_create_scheme_line_fitting(&cali_config, &handle);
        if (ret == ESP_OK) {
            calibrated = true;
        }
    }

    *out_handle = handle;
    if (ret == ESP_OK) {
        ESP_LOGI("", "Calibration Success");
    } else if (ret == ESP_ERR_NOT_SUPPORTED || !calibrated) {
        ESP_LOGI("", "eFuse not burnt, skip software calibration");
    } else {
        ESP_LOGI("", "Invalid arg or no memory");
    }

    return calibrated;
}

void example_adc_calibration_deinit(adc_cali_handle_t handle)
{
    ESP_LOGI("", "deregister %s calibration scheme", "Line Fitting");
    CHECK(adc_cali_delete_scheme_line_fitting(handle));
}

// ADC_ATTEN_DB_0 0.1V to 1.1V
// ADC_ATTEN_DB_2_5 0.1V to 1.5V
// ADC_ATTEN_DB_6 0.1V to 2.2V
// ADC_ATTEN_DB_12 0.1V to 3.9V

void adcInitPin(adc_channel_t channel, adc_atten_t atten)
{
    if (!adcHandle) {
        initAdc();
    }

    adc_oneshot_chan_cfg_t config = {};
    config.bitwidth = ADC_BITWIDTH_DEFAULT;
    config.atten = atten;
    CHECK(adc_oneshot_config_channel(adcHandle, channel, &config));

    adc1_cali_chan0_handle = NULL;
    CHECK(example_adc_calibration_init(ADC_UNIT_1, channel, atten, &adc1_cali_chan0_handle));
}

int adcRead(adc_channel_t channel)
{
    int raw = -1;
    int voltage = -1;

    CHECK(adc_oneshot_read(adcHandle, channel, &raw));
    CHECK(adc_cali_raw_to_voltage(adc1_cali_chan0_handle, raw, &voltage));

    return voltage;
}
}; // namespace chessbot
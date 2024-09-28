#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/dac.h>

#include <driver/ledc.h>

#include <chessbot/log.h>

namespace chessbot {

PwmPin::PwmPin(gpio_num_t pin)
{
    this->channel = getFreeLedcChannel();
    this->pin = pin;

    static bool ledcTimerInitialized = false;

    if (!ledcTimerInitialized) {
        // Prepare and then apply the LEDC PWM timer configuration
        ledc_timer_config_t timerConfig = {};
        timerConfig.speed_mode = LEDC_MODE;
        timerConfig.timer_num = LedcMapping::PWM;
        timerConfig.duty_resolution = LEDC_DUTY_RES;
        timerConfig.freq_hz = 50; //476 * 2; //5000; // Set output frequency at 5 kHz
        timerConfig.clk_cfg = LEDC_AUTO_CLK;
        CHECK(ledc_timer_config(&timerConfig));
    }

    // Prepare and then apply the LEDC PWM channel configuration
    ledc_channel_config_t channelConfig = {};
    channelConfig.speed_mode = LEDC_MODE;
    channelConfig.channel = this->channel;
    channelConfig.timer_sel = LedcMapping::PWM;
    channelConfig.intr_type = LEDC_INTR_DISABLE;
    channelConfig.gpio_num = pin;
    channelConfig.duty = 0;
    channelConfig.hpoint = 0;
    CHECK(ledc_channel_config(&channelConfig));
}

PwmPin::~PwmPin()
{
    CHECK(ledc_stop(LEDC_MODE, this->channel, 0));
    this->freeLedcChannel(this->channel);
}

void PwmPin::setDuty(uint32_t duty) {
    CHECK(ledc_set_duty(LEDC_MODE, this->channel, duty));
    CHECK(ledc_update_duty(LEDC_MODE, this->channel));
}

void PwmPin::set(float val)
{
    uint32_t maxDuty = (1 << LEDC_DUTY_RES) - 1; // 100%, pull high

    // val is [0.0,1.0]
    int32_t duty = /*((1 << LEDC_DUTY_RES) - 1) - */ int32_t(maxDuty * val);

    printf("Calculated duty cycle %d from %f\n", (int)duty, val);

    this->setDuty(duty);
}

// [0,LEDC_CHANNEL_MAX=8)
uint32_t ledcChannels = 0;

ledc_channel_t PwmPin::getFreeLedcChannel()
{
    for (ledc_channel_t i = LEDC_CHANNEL_0; i < LEDC_CHANNEL_MAX; i = ledc_channel_t((int)i + 1)) {
        if (!(ledcChannels & (1 << i))) {
            ledcChannels |= (1 << i);
            return i;
        }
    }

    FAIL();
}

void PwmPin::freeLedcChannel(ledc_channel_t channel)
{
    CHECK(channel & (1 << int(channel)));
    ledcChannels &= ~(1 << int(channel));
}
}; // namespace chessbot
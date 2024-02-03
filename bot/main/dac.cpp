#include <freertos/FreeRTOS.h> // Mandatory first include

#include <bitset>

#include <driver/ledc.h>

#include <chessbot/adc.h>
#include <chessbot/dac.h>
#include <chessbot/log.h>

namespace chessbot
{

// The ESP32-S2 only supports low speed mode (software emulation)
#define LEDC_MODE LEDC_LOW_SPEED_MODE

// We reserve the first LEDC timer for PWM
#define LEDC_PWM_TIMER LEDC_TIMER_0

#define LEDC_DUTY_RES LEDC_TIMER_13_BIT // Set duty resolution to 13 bits
#define LEDC_DUTY (4095)                // Set duty to 50%. ((2 ** 13) - 1) * 50% = 4095
#define LEDC_FREQUENCY (5000)           // Frequency in Hertz. Set frequency at 5 kHz

    PwmPin::PwmPin(int pin)
    {
        this->channel = getFreeLedcChannel();
        this->pin = pin;

        static bool ledcTimerInitialized = false;

        if (!ledcTimerInitialized)
        {
            // Prepare and then apply the LEDC PWM timer configuration
            ledc_timer_config_t timerConfig = {};
            timerConfig.speed_mode = LEDC_MODE;
            timerConfig.timer_num = LEDC_PWM_TIMER;
            timerConfig.duty_resolution = LEDC_DUTY_RES;
            timerConfig.freq_hz = LEDC_FREQUENCY; // Set output frequency at 5 kHz
            timerConfig.clk_cfg = LEDC_AUTO_CLK;
            CHECK(ledc_timer_config(&timerConfig));
        }

        // Prepare and then apply the LEDC PWM channel configuration
        ledc_channel_config_t channelConfig = {};
        channelConfig.speed_mode = LEDC_MODE;
        channelConfig.channel = this->channel;
        channelConfig.timer_sel = LEDC_PWM_TIMER;
        channelConfig.intr_type = LEDC_INTR_DISABLE;
        channelConfig.gpio_num = pin;
        channelConfig.duty = 0; // Set duty to 0%
        channelConfig.hpoint = 0;
        CHECK(ledc_channel_config(&channelConfig));
    }

    PwmPin::~PwmPin()
    {
        this->freeLedcChannel(this->channel);
    }

    void PwmPin::set(float val)
    {
        int duty = ((2 << LEDC_DUTY_RES) - 1) * val;

        CHECK(ledc_set_duty(LEDC_MODE, this->channel, duty));
        CHECK(ledc_update_duty(LEDC_MODE, this->channel));
    }

    std::bitset<LEDC_CHANNEL_MAX> ledcChannels;

    ledc_channel_t PwmPin::getFreeLedcChannel()
    {
        for (ledc_channel_t i = LEDC_CHANNEL_0; i < ledcChannels.size(); i = ledc_channel_t((int)i + 1))
        {
            if (!ledcChannels.test(i))
            {
                ledcChannels.set(i);
                return i;
            }
        }

        FAIL();
    }

    void PwmPin::freeLedcChannel(ledc_channel_t channel)
    {
        CHECK(ledcChannels.test(channel));
        ledcChannels.reset(channel);
    }

};
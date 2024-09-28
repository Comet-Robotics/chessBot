#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/util.h>
#include <chessbot/desc.h>

namespace chessbot {

Desc::Desc(gpio_num_t port) : pin(port) {}

Desc::~Desc() {}

void Desc::set(float power) {
    // Find desired length of pulses in microseconds
    uint32_t us = 0;
    if (power == 0.0) {
        us = NEUTRAL;
    }
    else if (power >= 0.0) {
        us = fmap(power, 0.0, 1.0, FORWARD_MIN, FORWARD_MAX);
    }
    else {
        power = -power;
        us = fmap(power, 0.0, 1.0, REVERSE_MIN, REVERSE_MAX);
    }

    uint32_t duty = fmap(us, 0, FORWARD_MAX, 0, ((1 << PwmPin::LEDC_DUTY_RES) - 1));

    pin.setDuty(duty);
}

}; // namespace chessbot
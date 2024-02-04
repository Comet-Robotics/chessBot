#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/button.h>

namespace chessbot {
Button::Button(gpio_num_t port)
    : port_(port)
{
    gpio_set_direction(port, GPIO_MODE_INPUT);
}

void Button::update()
{
    history_ <<= 1;
    history_ |= gpio_get_level(port_);

    if (history_ == 0b01111111) {
        justPressed_ = true;
    }
}

bool Button::get()
{
    return history_ == 255;
}

bool Button::justPressed()
{
    if (justPressed_) {
        justPressed_ = false;
        return true;
    }
    return false;
}
}; // namespace chessbot
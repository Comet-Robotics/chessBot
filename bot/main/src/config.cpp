#include <freertos/FreeRTOS.h> // Mandatory first include

#include <hal/adc_types.h>

#include <chessbot/config.h>

namespace chessbot {
uint32_t configStore[(size_t)ConfigKey::CONFIG_COUNT] = {};
}; // namespace chessbot
#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/motor.h>

namespace chessbot {

Encoder::Encoder(gpio_num_t channelA_, gpio_num_t channelB_)
    : channelA(channelA_)
    , channelB(channelB_)
{
}

// Get how far the encoder has moved since this function was last called
int32_t Encoder::getDelta()
{
    int64_t currentPos = read();

    if (abs(currentPos) > ENCODER_RESET_THRESHOLD) {
        // encoder.write(0);
    }

    int64_t dif = currentPos - lastPos;

    lastPos = currentPos;

    return dif;
}

int32_t Encoder::read()
{
    return 0; // encoder.read();
}

void Encoder::reset()
{

}

void Encoder::tick(uint64_t us) { }

Motor::Motor(gpio_num_t motorChannelA_,
    gpio_num_t motorChannelB_,
    gpio_num_t encoderChannelA_,
    gpio_num_t encoderChannelB_,
    float driveMultiplier_)
    : encoder(new Encoder(encoderChannelA_, encoderChannelB_))
    , powerPin(motorChannelA_)
    , channelA(motorChannelA_)
    , channelB(motorChannelB_)
    , driveMultiplier(driveMultiplier_)
{
}

Motor::Motor(gpio_num_t motorChannelA_, gpio_num_t motorChannelB_, float driveMultiplier_)
    : powerPin(motorChannelA_)
    , channelA(motorChannelA_)
    , channelB(motorChannelB_)
    , driveMultiplier(driveMultiplier_)
{
}

int32_t Motor::pos() { return encoder->read(); }

void Motor::reset()
{
    set(0);
    encoder->reset();
}

void Motor::tick(uint64_t us) { encoder->tick(us); }

// [-1.0, 1.0]
void Motor::set(float power)
{
    power *= driveMultiplier;

    powerPin.set(power);

    gpio_set_level(channelB, power < 0.0);
    return;
}
}; // namespace chessbot
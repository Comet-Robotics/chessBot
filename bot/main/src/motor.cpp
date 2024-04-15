#include <freertos/FreeRTOS.h> // Mandatory first include

#include <chessbot/log.h>
#include <chessbot/motor.h>

namespace chessbot {

Encoder::Encoder(gpio_num_t channelA_, gpio_num_t channelB_)
    : channelA(channelA_)
    , channelB(channelB_)
{
    CHECK(rotary_encoder_init(&info, channelA, channelB));
    CHECK(rotary_encoder_enable_half_steps(&info, true));
}
Encoder::~Encoder()
{
    CHECK(rotary_encoder_uninit(&info));
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
    rotary_encoder_state_t state = { 0 };
    CHECK(rotary_encoder_get_state(&info, &state));

    return state.position;
}

void Encoder::reset()
{
    rotary_encoder_reset(&info);
}

void Encoder::tick(uint64_t us) { }

Motor::Motor(gpio_num_t motorChannelA_,
    gpio_num_t motorChannelB_,
    gpio_num_t encoderChannelA_,
    gpio_num_t encoderChannelB_,
    float driveMultiplier_)
    //: encoder(new Encoder(encoderChannelA_, encoderChannelB_))
    : encoder(nullptr)
    , channelA(motorChannelA_)
    , channelB(motorChannelB_)
    , driveMultiplier(driveMultiplier_)
{
    // gpio_set_direction(motorChannelB_, GPIO_MODE_OUTPUT);
    // gpio_set_level(motorChannelB_, 0);
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

    if (power > 0.0) {
        // power = 1 - power;
        channelA.set(power);
        channelB.set(0.0);
    } else {
        channelA.set(0.0);
        channelB.set(-power);
    }

    // gpio_set_level(channelB, reverse);
    return;
}
}; // namespace chessbot
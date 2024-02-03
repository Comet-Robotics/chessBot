#ifndef CHESSBOT_MOTOR_H
#define CHESSBOT_MOTOR_H

#include <chessbot/dac.h>
#include <driver/gpio.h>

namespace chessbot {
// Wrapper for an encoder of any type
class Encoder {
public:
    // Threshold for resetting the encoder
    constexpr static int32_t ENCODER_RESET_THRESHOLD = 2147483647 / 2;

    int channelA, channelB;
    //::Encoder encoder;

    int64_t lastPos = 0;

    Encoder(int channelA_, int channelB_)
        : channelA(channelA_)
        , channelB(channelB_)
    // encoder(channelA, channelB)
    {
    }

    // Get how far the encoder has moved since this function was last called
    int32_t getDelta()
    {
        int64_t currentPos = read();

        if (abs(currentPos) > ENCODER_RESET_THRESHOLD) {
            // encoder.write(0);
        }

        int64_t dif = currentPos - lastPos;

        lastPos = currentPos;

        return dif;
    }

    int32_t read()
    {
        return 0; // encoder.read();
    }

    void tick(uint64_t us) { }
};

class Motor {
public:
    Encoder* encoder;
    PwmPin powerPin;

    gpio_num_t channelA;
    gpio_num_t channelB;

    Motor(gpio_num_t motorChannelA_,
        gpio_num_t motorChannelB_,
        int encoderChannelA_,
        int encoderChannelB_)
        : encoder(new Encoder(encoderChannelA_, encoderChannelB_))
        , powerPin(motorChannelA_)
        , channelA(motorChannelA_)
        , channelB(motorChannelB_)
    {
    }

    Motor(gpio_num_t motorChannelA_, gpio_num_t motorChannelB_)
        : powerPin(motorChannelA_)
        , channelA(motorChannelA_)
        , channelB(motorChannelB_)
    {
    }

    int32_t pos() { return encoder->read(); }

    void tick(uint64_t us) { encoder->tick(us); }

    // [-1.0, 1.0]
    void set(float power)
    {
        powerPin.set(power);

        gpio_set_level(channelB, power < 0.0);
        return;
    }
};
}; // namespace chessbot

#endif // ifndef CHESSBOT_MOTOR_H
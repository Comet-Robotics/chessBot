#ifndef CHESSBOTARDUINO_MOTOR_H
#define CHESSBOTARDUINO_MOTOR_H

#include <Encoder.h>

namespace ChessBotArduino {

class Encoder {
    int channelA, channelB;
    ::Encoder encoder;

public:
    Encoder(int channelA_, int channelB_) : channelA(channelA_), channelB(channelB_), encoder(channelA, channelB) {

    }

    int32_t read() {
        return encoder.read();
    }
};

class Motor {
    Encoder* encoder;

    int channelA;
    int channelB;

    int currentDirection = 0;
    int currentPower = 0;

public:
    Motor(int motorChannelA_, int motorChannelB_, int encoderChannelA_, int encoderChannelB_) :
        channelA(motorChannelA_), channelB(motorChannelB_), encoder(new Encoder(encoderChannelA_, encoderChannelB_)) {}

    Motor(int motorChannelA_, int motorChannelB_) :
        channelA(motorChannelA_), channelB(motorChannelB_) {}

    int32_t pos() {
        return encoder->read();
    }

    void setPower(float power) {
        bool newDirection = power < 0;
        if (newDirection != currentDirection) {
            digitalWrite(channelB, newDirection ? HIGH : LOW);
            currentDirection = newDirection;
        }

        int powerInt = power * 255.0;

        if (powerInt != currentPower) {
            analogWrite(channelA, powerInt);
            currentPower = powerInt;
        }
    }
};

};

#endif
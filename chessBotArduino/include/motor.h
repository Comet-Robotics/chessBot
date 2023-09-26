#ifndef CHESSBOTARDUINO_MOTOR_H
#define CHESSBOTARDUINO_MOTOR_H

#include <Encoder.h>

namespace ChessBotArduino {

// Wrapper for an encoder of any type
class Encoder {
public:
    int channelA, channelB;
    ::Encoder encoder;

    int lastPos = 0;

    Encoder(int channelA_, int channelB_) : channelA(channelA_), channelB(channelB_), encoder(channelA, channelB) {}

    // Get how far the encoder has moved since this function was last called, wrapping at the integer limit
    int32_t getDelta() {
        int64_t currentPos = read();
        int64_t lastPos = lastPos;

        int64_t dif = abs(currentPos - lastPos);

        lastPos = currentPos;

        return dif;
    }

    int32_t read() {
        return encoder.read();
    }
};

class Motor {
public:
    Encoder* encoder;

    int channelA;
    int channelB;

    int currentDirection = 0;
    int currentPower = 0;

    Motor(int motorChannelA_, int motorChannelB_, int encoderChannelA_, int encoderChannelB_) :
        encoder(new Encoder(encoderChannelA_, encoderChannelB_)), channelA(motorChannelA_), channelB(motorChannelB_) {}

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

    void setIntPower(int power) {
        bool newDirection = power < 0;
        if (newDirection != currentDirection) {
            digitalWrite(channelB, newDirection ? HIGH : LOW);
            currentDirection = newDirection;
        }

        if (power != currentPower) {
            analogWrite(channelA, power);
            currentPower = power;
        }
    }
};

};

#endif
#ifndef CHESSBOTARDUINO_MOTOR_H
#define CHESSBOTARDUINO_MOTOR_H

#include <Arduino.h>

#ifdef ARDUINO_ARCH_ESP32
#include <RotaryEncoder.h>
#else
#include <Encoder.h>
#endif

namespace ChessBotArduino
{
#ifdef ARDUINO_ARCH_ESP32
    RotaryEncoder *staticEncoders[] = {
        nullptr,
        nullptr,
        nullptr};
    int staticEncodersCnt = 0;


    volatile bool readEncoderISR0_active = false;
    void ICACHE_RAM_ATTR readEncoderISR0()
    {
        //Serial.println("Edge");
        staticEncoders[0]->readAB();
    }

    void ICACHE_RAM_ATTR readEncoderISR1()
    {
        //Serial.println("Edge");
        staticEncoders[1]->readAB();
    }

    void ICACHE_RAM_ATTR readEncoderISR2()
    {
        staticEncoders[2]->readAB();
    }

    using InterruptISR = void(*)();

    InterruptISR encoderISRs[] = {
        readEncoderISR0,
        readEncoderISR1,
        readEncoderISR2,
    };

    // Wrapper for an encoder of any type
    class Encoder
    {
    public:
        // Threshold for resetting the encoder
        constexpr static int32_t ENCODER_RESET_THRESHOLD = 2147483647 / 2;

        int channelA, channelB;
        ::RotaryEncoder encoder;
        int cnt = 0;

        int64_t lastPos = 0;

        Encoder(int channelA_, int channelB_) : channelA(channelA_), channelB(channelB_),
                                                encoder(channelA_, channelB_)
        {
            cnt = staticEncodersCnt++;
            staticEncoders[cnt] = &encoder;
            
            encoder.begin();

            attachInterrupt(digitalPinToInterrupt(channelA_), encoderISRs[cnt], CHANGE);
        }

        // Get how far the encoder has moved since this function was last called
        int32_t getDelta()
        {
            int64_t currentPos = read();

            if (abs(currentPos) > ENCODER_RESET_THRESHOLD)
            {
                encoder.setPosition(0);
            }

            int64_t dif = currentPos - lastPos;

            lastPos = currentPos;

            return dif;
        }

        int32_t read()
        {
            auto pos = encoder.getPosition();
            Serial.println(pos);
            return pos;
        }
    };
#else
    // Wrapper for an encoder of any type
    class Encoder
    {
    public:
        // Threshold for resetting the encoder
        constexpr static int32_t ENCODER_RESET_THRESHOLD = 2147483647 / 2;

        int channelA, channelB;
        ::Encoder encoder;

        int64_t lastPos = 0;

        Encoder(int channelA_, int channelB_) : channelA(channelA_), channelB(channelB_), encoder(channelA, channelB) {}

        // Get how far the encoder has moved since this function was last called
        int32_t getDelta()
        {
            int64_t currentPos = read();

            if (abs(currentPos) > ENCODER_RESET_THRESHOLD)
            {
                encoder.write(0);
            }

            int64_t dif = currentPos - lastPos;

            lastPos = currentPos;

            return dif;
        }

        int32_t read()
        {
            return encoder.read();
        }
    };
#endif

    class Motor
    {
    public:
        Encoder *encoder;

        int channelA;
        int channelB;

        int currentDirection = 0;
        int currentPower = 0;

        Motor(int motorChannelA_, int motorChannelB_, int encoderChannelA_, int encoderChannelB_) : encoder(new Encoder(encoderChannelA_, encoderChannelB_)), channelA(motorChannelA_), channelB(motorChannelB_) {}

        Motor(int motorChannelA_, int motorChannelB_) : channelA(motorChannelA_), channelB(motorChannelB_) {}

        int32_t pos()
        {
            return encoder->read();
        }

        void setPower(float power)
        {
            Serial.print("POWER ");
            Serial.print(channelA);
            Serial.print(" ");
            
            

            int iPower = 0;

            if (power < 0) {
                iPower = 255 - -power * 255;
            }
            else {
                iPower = power * 255;
            }

            analogWrite(channelA, iPower);

            

            Serial.println(iPower);

            //analogWrite(channelA, power);
            digitalWrite(channelB, power < 0.0);
            return;
        }
    };
}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_MOTOR_H
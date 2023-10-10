#ifndef Photodiode_h
#define Photodiode_h

#include <Arduino.h>

#define backRightPhotodiodePin A12
#define backLeftPhotodiodePin A13
#define frontLeftPhotodiodePin A14
#define frontRightPhotodiodePin A15

class Photodiode
{

    public:
        Photodiode(uint8_t photodiodePin)
        { this->photodiodePin = photodiodePin;}

        int GetAnalogLightMeasurement()
        { return analogRead(photodiodePin); }

        bool GetDigitalLightMeasurement(int cutoff)
        { return (analogRead(photodiodePin) > cutoff); }

    private:
        uint8_t photodiodePin;
};

class BRPhotodiode : public Photodiode
{
    public:
        BRPhotodiode() : Photodiode(backRightPhotodiodePin) {}
};

class BLPhotodiode : public Photodiode
{
    public:
        BLPhotodiode() : Photodiode(backLeftPhotodiodePin) {}
};

class FLPhotodiode : public Photodiode
{
    public:
        FLPhotodiode() : Photodiode(frontLeftPhotodiodePin) {}
};


class FRPhotodiode : public Photodiode
{
    public:
        FRPhotodiode() : Photodiode(frontRightPhotodiodePin) {}
};


#endif

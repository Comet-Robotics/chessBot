// Config stored on bot in EEPROM
// When a new element is added to DynConfig, it will clear the existing config

#ifndef CHESSBOTARDUINO_DYNAMIC_CONFIG_H
#define CHESSBOTARDUINO_DYNAMIC_CONFIG_H

#include <EEPROM.h>

namespace ChessBotArduino
{

#pragma pack(push, 1)
    struct DynConfig
    {
        uint8_t ID = 0xFD;

        uint8_t MOTOR_A_PIN1 = 8;
        uint8_t MOTOR_A_PIN2 = 9;
        uint8_t ENCODER_A_PIN1 = 5;
        uint8_t ENCODER_A_PIN2 = 3;

        uint8_t MOTOR_B_PIN1 = 11;
        uint8_t MOTOR_B_PIN2 = 10;
        uint8_t ENCODER_B_PIN1 = 4;
        uint8_t ENCODER_B_PIN2 = 2;
    };
#pragma pack(pop)

    DynConfig dynConfig;

    namespace Eeprom
    {
        // Sync RAM settings to disk, or create them if they don't exist
        void persist()
        {
            EEPROM.put(sizeof(uint32_t), dynConfig);
        }

        uint32_t crc(uint16_t start, uint16_t len)
        {
            uint16_t end = start + len;

            if (end > EEPROM.length())
            {
                return 0;
            }

            const uint32_t crc_table[16] = {
                0x00000000, 0x1db71064, 0x3b6e20c8, 0x26d930ac,
                0x76dc4190, 0x6b6b51f4, 0x4db26158, 0x5005713c,
                0xedb88320, 0xf00f9344, 0xd6d6a3e8, 0xcb61b38c,
                0x9b64c2b0, 0x86d3d2d4, 0xa00ae278, 0xbdbdf21c};

            uint32_t crc = ~0L;

            for (uint16_t index = start; index < end; ++index)
            {
                //crc = crc_table[(crc ^ EEPROM[index]) & 0x0f] ^ (crc >> 4);
                //crc = crc_table[(crc ^ (EEPROM[index] >> 4)) & 0x0f] ^ (crc >> 4);
                crc = ~crc;
            }

            return crc;
        }

        bool crcMatches()
        {
            uint32_t checksum = 0;
            EEPROM.get(0, checksum);

            uint32_t actualChecksum = crc(sizeof(uint32_t), sizeof(DynConfig));

            return checksum == actualChecksum;
        }

        void load()
        {
            if (!crcMatches())
            {
                // Write the default options
                persist();
            }
        }
    }; // namespace Eeprom
};     // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_DYNAMIC_CONFIG_H
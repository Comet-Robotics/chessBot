#ifndef CHESSBOTARDUINO_PACKET_H
#define CHESSBOTARDUINO_PACKET_H

#include <stdint.h>

#include <Arduino.h>

namespace ChessBotArduino
{

    uint64_t hexToNum(char *hex, int bytes)
    {
        uint64_t val = 0;
        int base = 1;

        for (int i = bytes - 1; i >= 0; i--)
        {
            char c = hex[i];

            if (c >= '0' && c <= '9')
            {
                val += (c - '0') * base;
            }
            else if (c >= 'a' && c <= 'z')
            {
                val += (c - 'a' + 10) * base;
            }
            else if (c >= 'A' && c <= 'Z')
            {
                val += (c - 'A' + 10) * base;
            }

            base *= 16;
        }

        return val;
    }

    void numToHex(char *out, uint64_t num, int len);

    enum PacketType
    {
        NOTHING,
        PING_SEND,
        PING_RESPONSE,
        QUERY,
        QUERY_RESPONSE,
        INFORM,
        ASSERT,
    };

#pragma pack(push, 1)
    struct PackedTextPacket
    {
        char checksum[4];
        char id[2];
        char type[2];
        char contents[89];

        PacketType getType()
        {
            return (PacketType)hexToNum(type, 2);
            // return (PacketType)(type[1] - '0');
        }
    };
#pragma pack(pop)

    struct Packet
    {
        uint32_t checksum;
        uint16_t id;
        PacketType type;
        char contents[89];

        void from(PackedTextPacket &base)
        {
            checksum = hexToNum(base.checksum, 4);
            id = hexToNum(base.id, 2);
            type = (PacketType)hexToNum(base.checksum, 2);
            // std::copy(std::begin(base.contents), std::end(base.contents), contents);
        }
    };

    struct PacketWrap
    {
        static const constexpr int MAX_PACKET_SIZE = 100;

        union
        {
            char rawPacket[MAX_PACKET_SIZE];
        };

        /*void read() {
            switch (packet.type) {
                case PacketType::NOTHING return;
                case PacketType::PING_SEND {

                }
            }
        }*/
    };

    static const constexpr int MAX_PACKETS = 100;
    static Packet packets[MAX_PACKETS] = {};

    static const constexpr char PACKET_START_CHAR = ':';
    static const constexpr char PACKET_END_CHAR = ';';

    void handlePacket(char *buf, size_t len)
    {
        PackedTextPacket *p = (PackedTextPacket *)buf;

        if (p->getType() == PacketType::NOTHING)
        {
        }
        else if (p->getType() == PacketType::PING_SEND)
        {
            // Send a ping back

            Serial.write(":0000ff02;");
        }
    }

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_PACKET_H
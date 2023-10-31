#ifndef CHESSBOTARDUINO_PACKET_H
#define CHESSBOTARDUINO_PACKET_H

#include <stdint.h>

#include <Arduino.h>
#include <WiFi.h>

namespace ChessBotArduino
{
    struct StringView
    {
        char *_data;
        size_t _size;

        StringView(char *str) : _data(str), _size(strlen(str)) {}
        StringView(char *data, size_t size) : _data(data), _size(size) {}
        StringView(char *begin, char *end) : _data(begin), _size(size_t(end - begin)) {}

        char *data()
        {
            return _data;
        }

        size_t size()
        {
            return _size;
        }
    };

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

    void numToHex(char *out, uint64_t num, int len)
    {
        const char hex[16] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};

        for (int i = len - 1; i >= 0; i--)
        {
            int d = (num >> (i * 4)) & 0xF;
            out[len - i - 1] = hex[(num >> (i * 4)) & 0xF];
        }
    }

    enum PacketType
    {
        NOTHING,
        CLIENT_HELLO,
        SERVER_HELLO,
        PING_SEND,
        PING_RESPONSE,
        QUERY_VAR,
        QUERY_RESPONSE,
        INFORM_VAR,
        SET_VAR,
        MOVE_TO_SPACE,
        MOVE_TO_POS,
        DRIVE,
        ESTOP,
    };

#pragma pack(push, 1)
    struct PackedTextPacket
    {
        char type[2];
        char contents[100];

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

    int ourName = 0x15;
    int currentTarget = 0xFE;

    char packetConstructBuf[300];

    char *start(PacketType type)
    {
        char *w = packetConstructBuf;
        (*w++) = ':';

        numToHex(w, (int)type, 2);
        w += 2;
        (*w++) = ',';

        return w;
    }

    char *finish(char *w)
    {
        (*w++) = ';';
        *w = '\0';
        return packetConstructBuf;
    }

    template <PacketType type>
    char *make();

    template <>
    char *make<PacketType::CLIENT_HELLO>()
    {
        char *w = start(PacketType::CLIENT_HELLO);

        uint8_t mac[6];
        WiFi.macAddress(mac);
        for (int i = 0; i < 6; i++)
        {
            numToHex(w, mac[i], 2);
            w += 2;
        }

        return finish(w);
    }

    template <>
    char *make<PacketType::PING_RESPONSE>()
    {
        char *w = start(PacketType::PING_RESPONSE);

        return finish(w);
    }

    void send(char *packet)
    {
        Serial.println(packet);
    }

    void handlePacket(char *buf, size_t len)
    {
        PackedTextPacket *p = (PackedTextPacket *)buf;

        switch (p->getType())
        {
        case NOTHING:
            break;
        case PING_SEND:
            send(make<PacketType::PING_RESPONSE>());
            break;
        case MOVE_TO_SPACE:
            break;
        case MOVE_TO_POS:
            break;
        }

        if (p->getType() == PacketType::NOTHING)
        {
        }
        else if (p->getType() == PacketType::PING_SEND)
        {
            // Send a ping back
            Serial.write(make<PacketType::PING_RESPONSE>());
        }
        else if (p->getType() == PacketType::ESTOP) 
        {

        }
    }

}; // namespace ChessBotArduino

#endif // ifndef CHESSBOTARDUINO_PACKET_H
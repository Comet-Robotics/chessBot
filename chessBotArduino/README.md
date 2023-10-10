### Packet docs
Data types:
bool: t/f
uint4: a single hex digit
uint4: 2 hex digits
uint16: 4 hex digits
uint32: 8 hex digits

General packet format:
SrcID: uint8 character robot discriminator, ff for multicast and fe for server
DestID: uint8 character robot discriminator, ff for multicast and fe for server
PacketType: uint8 character packet type identifier
Contents: Whatever goes in the packet, up to 87 bytes
Rotation: uint16 0-360, counterclockwise from x-axis

SrcID,DestID,PacketType,CONTENTS

Packet types:
00 Nothing
01 PingSend
02 PingResponse
03 QueryVar
    String name
04 QueryResp
    String name
    String value
05 InformVar
    String name
    String value
06 SetVar
    String name
    String value
07 MoveToSpace
    uint32 x
    uint32 y
    Rotation rot
08 MoveToPos
    uint32 x
    uint32 y
    Rotation rot

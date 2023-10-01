//todo: add source to all packets

### Packet docs
Data types:
bool
uint4: a single hex digit
uint16: 4 hex digits
uint32: 8 hex digits

General packet format:
Checksum: 4 hex character Adler32 checksum of entire packet after checksum
RobotID: 2 hex character robot discriminator, ff for multicast and fe for server
PacketType: 2 hex character packet type identifier
Contents: Whatever goes in the packet, up to 89 bytes
Rotation: uint16 0-360 

Checksum,RobotID,PacketType,CONTENTS

Packet types:
00 Nothing
01 Ping:
    RobotID from
02 PingResponse:
    RobotID from
03 Query
    <some sort of flags>
04 QueryResp
    RobotID from
    <comma seperated responses>
05 MoveToSpace
    uint4 x
    uint4 y
    Rotation rot
06 MoveToPos
    uint32 x
    uint32 y
    Rotation rot
    uint8 vel
    uint8 rotVel
07 MoveComplete
    bool success
    uint32 newX
    uint32 newY
    Rotation newRot
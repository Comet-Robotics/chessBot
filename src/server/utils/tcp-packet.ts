import { Number, String, Record, Union, Static, Literal } from "runtypes";

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType

export const NOTHING        = Record({ type: Literal('NOTHING'),        });
export const CLIENT_HELLO   = Record({ type: Literal('CLIENT_HELLO'),   macAddress: String });
export const SERVER_HELLO   = Record({ type: Literal('SERVER_HELLO'),   });
export const PING_SEND      = Record({ type: Literal('PING_SEND'),      });
export const PING_RESPONSE  = Record({ type: Literal('PING_RESPONSE'),  });
export const QUERY_VAR      = Record({ type: Literal('QUERY_VAR'),      });
export const QUERY_RESPONSE = Record({ type: Literal('QUERY_RESPONSE'), });
export const INFORM_VAR     = Record({ type: Literal('INFORM_VAR'),     });
export const SET_VAR        = Record({ type: Literal('SET_VAR'),        });
export const TURN_BY_ANGLE  = Record({ type: Literal('TURN_BY_ANGLE'),  deltaHeading: Number });
export const DRIVE_TILES    = Record({ type: Literal('DRIVE_TILES'),    distanceTiles: Number });
export const ACTION_SUCCESS = Record({ type: Literal('ACTION_SUCCESS'), });
export const ACTION_FAIL    = Record({ type: Literal('ACTION_FAIL'),    });
export const DRIVE_TANK     = Record({ type: Literal('DRIVE_TANK'),     left: Number, right: Number});
export const ESTOP          = Record({ type: Literal('ESTOP'),          });

export const Packet = Union(
    NOTHING, 
    CLIENT_HELLO, 
    SERVER_HELLO, 
    PING_SEND, 
    PING_RESPONSE, 
    QUERY_VAR, 
    QUERY_RESPONSE, 
    INFORM_VAR, 
    SET_VAR, 
    TURN_BY_ANGLE, 
    DRIVE_TILES, 
    ACTION_SUCCESS, 
    ACTION_FAIL, 
    DRIVE_TANK, 
    ESTOP);
export type Packet = Static<typeof Packet>;

// const _GENERIC = Record({ type: Literal() });
// const _EMPTY = Record({});

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType

// const _types = {
//     "NOTHING": _EMPTY,
//     "CLIENT_HELLO": Record({ macAddress: String }),
//     "SERVER_HELLO": _EMPTY,
//     "PING_SEND": _EMPTY,
//     "PING_RESPONSE": _EMPTY,
//     "QUERY_VAR": _EMPTY,
//     "QUERY_RESPONSE": _EMPTY,
//     "INFORM_VAR": _EMPTY,
//     "SET_VAR": _EMPTY,
//     "TURN_BY_ANGLE": Record({ deltaHeading: Number }),
//     "DRIVE_TILES": Record({ distanceTiles: Number }),
//     "ACTION_SUCCESS": _EMPTY,
//     "ACTION_FAIL": _EMPTY,
//     "DRIVE_TANK": Record({ left: Number, right: Number }),
//     "ESTOP": _EMPTY,
// };

// export const TYPES = Object.fromEntries<Runtype<object>>( Object.entries(_types).map(([key, value]) => [key, Intersect(Record({ type: Literal(key) }), value)]) );

// export const Packet = Union(
//     TYPES["NOTHING"],
//     ...Object.values(TYPES)
// );
// export type Packet = Static<typeof Packet>;

export function jsonToPacket(json: string): Packet | null {
    const obj = JSON.parse(json);
    if (Packet.guard(obj)) {
        return obj as Packet;
    }
    return null;
}

export function packetToJson(packet: Packet): string | null {
    if (Packet.guard(packet))
        return JSON.stringify(packet);
    return null;
}

import { Number, String, Record, Union, Intersect, Static, Literal, Runtype } from "runtypes";

// const _GENERIC = Record({ type: Literal() });
const _EMPTY = Record({});

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType

const _types = {
    "NOTHING": _EMPTY,
    "CLIENT_HELLO": Record({ macAddress: String }),
    "SERVER_HELLO": _EMPTY,
    "PING_SEND": _EMPTY,
    "PING_RESPONSE": _EMPTY,
    "QUERY_VAR": _EMPTY,
    "QUERY_RESPONSE": _EMPTY,
    "INFORM_VAR": _EMPTY,
    "SET_VAR": _EMPTY,
    "TURN_BY_ANGLE": Record({ deltaHeading: Number }),
    "DRIVE_TILES": Record({ distanceTiles: Number }),
    "ACTION_SUCCESS": _EMPTY,
    "ACTION_FAIL": _EMPTY,
    "DRIVE_TANK": Record({ left: Number, right: Number }),
    "ESTOP": _EMPTY,
};

export const TYPES = Object.fromEntries<Runtype<object>>( Object.entries(_types).map(([key, value]) => [key, Intersect(Record({ type: Literal(key) }), value)]) );

export const Packet = Union(
    TYPES["NOTHING"],
    ...Object.values(TYPES)
);
export type Packet = Static<typeof Packet>;

export function packetFromJson(json: string): Packet {
    const obj = JSON.parse(json);
    if (Packet.guard(obj)) {
        return obj as Packet;
    }
    return { type: "" };
}

export function packetToJson(packet: Packet): string {
    if (Packet.guard(packet))
        return JSON.stringify(packet);
    return "";
}

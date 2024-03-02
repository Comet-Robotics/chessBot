import { Number, String, Record, Union, Static, Literal } from "runtypes";

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType

export const NOTHING = Record({ type: Literal("NOTHING") });
export const CLIENT_HELLO = Record({
    type: Literal("CLIENT_HELLO"),
    macAddress: String,
});
export const SERVER_HELLO = Record({ type: Literal("SERVER_HELLO") });
export const PING_SEND = Record({ type: Literal("PING_SEND") });
export const PING_RESPONSE = Record({ type: Literal("PING_RESPONSE") });
export const QUERY_VAR = Record({ type: Literal("QUERY_VAR") });
export const QUERY_RESPONSE = Record({ type: Literal("QUERY_RESPONSE") });
export const INFORM_VAR = Record({ type: Literal("INFORM_VAR") });
export const SET_VAR = Record({ type: Literal("SET_VAR") });
export const TURN_BY_ANGLE = Record({
    type: Literal("TURN_BY_ANGLE"),
    deltaHeading: Number,
});
export const DRIVE_TILES = Record({
    type: Literal("DRIVE_TILES"),
    tileDistance: Number,
});
export const ACTION_SUCCESS = Record({ type: Literal("ACTION_SUCCESS") });
export const ACTION_FAIL = Record({ type: Literal("ACTION_FAIL") });
export const DRIVE_TANK = Record({
    type: Literal("DRIVE_TANK"),
    left: Number,
    right: Number,
});
export const ESTOP = Record({ type: Literal("ESTOP") });

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
    ESTOP,
);
export type Packet = Static<typeof Packet>;

export function jsonToPacket(jsonStr: string): Packet {
    const obj = JSON.parse(jsonStr);
    if (!Packet.guard(obj)) {
        throw new Error("Invalid packet: " + jsonStr);
    }
    return obj as Packet;
}

export function packetToJson(packet: Packet): string {
    if (!Packet.guard(packet)) {
        throw new Error("Invalid packet: " + JSON.stringify(packet));
    }
    return JSON.stringify(packet);
}

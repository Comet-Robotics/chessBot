import {
    Number as NumberType,
    String,
    Record,
    Union,
    Static,
    Literal,
} from "runtypes";

// MUST be kept in sync with chessBotArduino/include/packet.h PacketType
export const SERVER_PROTOCOL_VERSION = 1;

export const CLIENT_HELLO = Record({
    type: Literal("CLIENT_HELLO"),
    macAddress: String,
});
export const SERVER_HELLO = Record({
    type: Literal("SERVER_HELLO"),
    protocol: NumberType,
});
export const PING_SEND = Record({ type: Literal("PING_SEND") });
export const PING_RESPONSE = Record({ type: Literal("PING_RESPONSE") });

const Float = NumberType.withConstraint((n) => Number.isFinite(n), {
    name: "float",
});
const Int32 = Float.withConstraint((n) => Number.isSafeInteger(n), {
    name: "int32",
});
const Uint32 = Int32.withConstraint((n) => n >= 0, { name: "uint32" });
const VarId = Uint32;

export const QUERY_VAR = Record({
    type: Literal("QUERY_VAR"),
    var_id: VarId,
    var_type: Union(Literal("float"), Literal("uint32"), Literal("int32")),
});
export const QUERY_RESPONSE = Record({
    type: Literal("QUERY_RESPONSE"),
    var_id: VarId,
    var_val: NumberType,
});
export const SET_VAR = Record({
    type: Literal("SET_VAR"),
    var_id: VarId,
}).And(
    Union(
        Record({
            var_type: Literal("float"),
            var_val: Float,
        }),
        Record({
            var_type: Literal("uint32"),
            var_val: Uint32,
        }),
        Record({
            var_type: Literal("int32"),
            var_val: Int32,
        }),
    ),
);

export const TURN_BY_ANGLE = Record({
    type: Literal("TURN_BY_ANGLE"),
    deltaHeading: NumberType,
});
export const DRIVE_TILES = Record({
    type: Literal("DRIVE_TILES"),
    tileDistance: NumberType,
});

export const ACTION_SUCCESS = Record({ type: Literal("ACTION_SUCCESS") });
export const ACTION_FAIL = Record({
    type: Literal("ACTION_FAIL"),
    reason: String,
});

export const DRIVE_TANK = Record({
    type: Literal("DRIVE_TANK"),
    left: NumberType,
    right: NumberType,
});
export const ESTOP = Record({ type: Literal("ESTOP") });

export const Packet = Union(
    CLIENT_HELLO,
    SERVER_HELLO,
    PING_SEND,
    PING_RESPONSE,
    QUERY_VAR,
    QUERY_RESPONSE,
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

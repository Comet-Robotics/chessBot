import { Socket } from "net";
import { BotTunnel } from "../../api/tcp-interface";
import { vi, test, expect, afterEach } from "vitest";
import { Packet, jsonToPacket, packetToJson } from "../tcp-packet";

vi.mock("net");

const mockSocket = vi.mocked(Socket.prototype);

const mockBotTunnel = new BotTunnel(mockSocket, () => {});
vi.spyOn(mockBotTunnel, "isActive").mockReturnValue(true);
const mockWrite = vi.spyOn(mockSocket, "write");

afterEach(() => {
    vi.clearAllMocks();
});

const validMessages: Packet[] = [
    { type: "NOTHING" },
    { type: "CLIENT_HELLO", macAddress: "HELLO3" },
    { type: "DRIVE_TANK", left: 0.3, right: -0.4 },
];

const invalidMessages = [
    {},
    { type: "INVALID_TYPE" },
    { type: "DRIVE_TANK", left: 0.3 },
];

test.each(validMessages)("Test packet serialization", async (packet) => {
    expect(jsonToPacket(packetToJson(packet))).toStrictEqual(packet);
});

test.each(invalidMessages)("Test packet serialization", async (packet) => {
    expect(() => packetToJson(packet as Packet)).toThrowError();
    expect(() => jsonToPacket(JSON.stringify(packet))).toThrowError();
});

test.each(validMessages)("Test message sending", async (packet) => {
    mockBotTunnel.send(packet);
    expect(mockWrite).toBeCalledTimes(1);
    expect(mockWrite.mock.calls[0][0]).toStrictEqual(
        `${packetToJson(packet)};`,
    );
});

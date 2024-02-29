import * as net from "net";
import { BotTunnel } from "../../api/tcp-interface";
import { vi, test, expect, afterEach } from "vitest";
import { Packet, jsonToPacket, packetToJson } from "../tcp-packet";

vi.mock("net");

const mockSocket = vi.mocked(net.Socket.prototype);

const mockBotTunnel = new BotTunnel(mockSocket, (addr) => {
    console.log(addr);
});
mockBotTunnel.id = 69;
mockBotTunnel.address = "lul";

const mockWrite = vi.spyOn(mockSocket, "write");

const testCases = [
    { obj: {}, valid: false },
    { obj: { type: "NOTHING" }, valid: true },
    { obj: { type: "CLIENT_HELLO" }, valid: false },
    { obj: { type: "CLIENT_HELLO", macAddress: "HELLO3" }, valid: true },
    { obj: { type: "DRIVE_TANK" }, valid: false },
    { obj: { type: "DRIVE_TANK", left: 0.3 }, valid: false },
    { obj: { type: "DRIVE_TANK", left: 0.3, right: -0.4 }, valid: true },
] as { obj: object; valid: boolean }[];

afterEach(() => {
    vi.clearAllMocks();
});

test.each(testCases)("Validate packet guard", async ({ obj, valid }) => {
    expect(Packet.guard(obj)).toEqual(valid);
});

test.each(testCases)("Verify packetToJson", async ({ obj, valid }) => {
    expect(packetToJson(obj as Packet)).toEqual(
        valid ? JSON.stringify(obj) : null,
    );
});

test.each(testCases)("Verify packetFromJson", async ({ obj, valid }) => {
    expect(jsonToPacket(JSON.stringify(obj))).toEqual(valid ? obj : null);
});

test.each(testCases)("Test message sending", async ({ obj, valid }) => {
    vi.spyOn(mockBotTunnel, "isActive").mockReturnValue(true);
    mockBotTunnel.send(obj as Packet);
    if (valid)
        expect(mockWrite.mock.calls[0][0]).toStrictEqual(
            `:${JSON.stringify(obj)};`,
        );
    else expect(mockWrite.mock.calls.length).toEqual(0);
});

import * as net from "net";
import { BotTunnel } from "../../api/tcp-interface";
import { vi, test, expect, afterEach } from "vitest";
import { Packet, packetFromJson, packetToJson } from "../tcp-packet";

vi.mock("net");

const mockSocket = vi.mocked(net.Socket.prototype);

const mockBotTunnel = new BotTunnel(mockSocket, (addr) => {
    console.log(addr);
});
mockBotTunnel.id = 69;
mockBotTunnel.address = "lul";

const mockWrite = vi.spyOn(mockSocket, "write");

const testCases = [
    [{}, false],
    [{ type: "NOTHING" }, true],
    [{ type: "CLIENT_HELLO" }, false],
    [{ type: "CLIENT_HELLO", macAddress: "HELLO3" }, true],
    [{ type: "DRIVE_TANK" }, false],
    [{ type: "DRIVE_TANK", left: 0.3 }, false],
    [{ type: "DRIVE_TANK", left: 0.3, right: -0.4 }, true],
] as [object, boolean][];

afterEach(() => {
    vi.clearAllMocks();
});

test.each(testCases)(
    "Validate packet guard",
    async (obj: object, valid: boolean) => {
        expect(Packet.guard(obj)).toEqual(valid);
    },
);

test.each(testCases)(
    "Verify packetToJson",
    async (obj: object, valid: boolean) => {
        expect(packetToJson(obj as Packet)).toEqual(
            valid ? JSON.stringify(obj) : null,
        );
    },
);

test.each(testCases)(
    "Verify packetFromJson",
    async (obj: object, valid: boolean) => {
        expect(packetFromJson(JSON.stringify(obj))).toEqual(valid ? obj : null);
    },
);

test.each(testCases)(
    "Test message sending",
    async (obj: object, valid: boolean) => {
        vi.spyOn(mockBotTunnel, "isActive").mockReturnValue(true);
        mockBotTunnel.send(obj as Packet);
        if (valid)
            expect(mockWrite.mock.calls[0][0]).toStrictEqual(
                `:${JSON.stringify(obj)};`,
            );
        else expect(mockWrite.mock.calls.length).toEqual(0);
    },
);

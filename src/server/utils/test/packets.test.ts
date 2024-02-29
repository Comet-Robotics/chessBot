import * as net from "net";
import { BotTunnel } from "../../api/tcp-interface";
import { vi, test, expect, afterEach } from "vitest";
import { Packet, packetToJson } from "../tcp-packet";

vi.mock("../../api/tcp-interface");

const mockSocket = vi.mocked(net.Socket.prototype);
// mockSocket.readyState = "open"; // fucking hell it wont let me overwrite properties even on a mocked object
// vi.spyOn(mockSocket, 'readyState', 'get').mockReturnValue('open');
// Object.defineProperty(mockSocket, 'readyState', {value: 'open', writable: true})

const mockBotTunnel = new BotTunnel(mockSocket, (addr) => {
    console.log(addr);
});

// vi.spyOn(console, 'log').withImplementation((msg) => console.log(msg));

mockBotTunnel.id = 69;
mockBotTunnel.address = "lul";

const mockWrite = vi.spyOn(mockSocket, "write");

afterEach(() => {
    vi.clearAllMocks();
});

// test.each([
//     [{}, false],
//     [{ type: "NOTHING" }, true],
//     [{ type: "CLIENT_HELLO" }, false],
//     [{ type: "CLIENT_HELLO", macAddress: "HELLO3" }, true],
// ])(
//     "Packet guard",
//     async (obj: object, guard_value: boolean) => {
//         // Packet.
//         expect(Packet.guard(obj)).toEqual(guard_value);
//     }
// )

test.each([
    [{}, null],
    [{ type: "NOTHING" }, JSON.stringify({ type: "NOTHING" })],
    [{ type: "CLIENT_HELLO" }, null],
    [
        { type: "CLIENT_HELLO", macAddress: "HELLO3" },
        JSON.stringify({ type: "CLIENT_HELLO", macAddress: "HELLO3" }),
    ],
])("Test packet writing", async (packet: object, expected: string | null) => {
    vi.spyOn(mockBotTunnel, "isActive").mockReturnValue(true);
    expect(mockBotTunnel.isActive()).toEqual(true);

    expect(packetToJson(packet as Packet)).toEqual(expected);

    mockBotTunnel.send(packet as Packet);
    if (expected !== null)
        expect(mockWrite.mock.calls[0][0]).toStrictEqual(`:${expected};`);
    else expect(mockWrite.mock.calls.length).toEqual(0);
});

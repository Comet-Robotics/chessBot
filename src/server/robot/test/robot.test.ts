import { BotTunnel } from "../../api/tcp-interface";
import { DEGREE } from "../../utils/units";
import { ZERO_INDICES } from "../grid-indices";
import { Robot } from "../robot";
import { RobotSocket } from "../robot-socket";
import { vi, test, expect, afterEach } from "vitest";

vi.mock("../../api/tcp-interface");

const mockRobotSocket = new RobotSocket(vi.mocked(BotTunnel.prototype));
// Alternative, but breaks turnAndDrive
// const mockRobotSocket = jest.mocked(RobotSocket.prototype);

const mockTurn = vi.spyOn(RobotSocket.prototype, "turn");
// const mockDrive = vi.spyOn(RobotSocket.prototype, "drive");

afterEach(() => {
    vi.clearAllMocks();
});

test.each([
    [15, 345, -30],
    [345, 15, 30],
    [90, 170, 80],
])(
    "Turns from %p deg to %p deg",
    async (start: number, end: number, expected: number) => {
        // Convert degrees to radians
        const endRadians = end * DEGREE;
        const robot = new Robot(
            mockRobotSocket,
            "robot1",
            ZERO_INDICES,
            start * DEGREE,
        );
        await robot.absoluteRotate(endRadians);
        expect(mockTurn.mock.calls[0][0]).toBeCloseTo(expected * DEGREE);
        expect(robot.heading).toBeCloseTo(endRadians);
    },
);

test.each([
    [0, 30, 30], //tests simple turn
    [15, -90, 285], //tests crossing 0 from the left
    [350, 20, 10], //tests crossing 0 from the right
    [0, 360, 0], //tests making a 360
    [90, 710, 80], //tests going over 360
    [90, -710, 100], //tests going over -360
])(
    "Turns from %p deg by %p deg",
    async (start: number, delta: number, expected: number) => {
        // Convert degrees to radians
        const deltaRadians = delta * DEGREE;
        const robot = new Robot(
            mockRobotSocket,
            "robot1",
            ZERO_INDICES,
            start * DEGREE,
        );
        await robot.relativeRotate(deltaRadians);

        expect(mockTurn.mock.calls[0][0]).toBeCloseTo(delta * DEGREE);
        expect(robot.heading).toBeCloseTo(expected * DEGREE);
    },
);

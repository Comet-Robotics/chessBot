import { DEGREE } from "../../utils/units";
import { Robot } from "../robot";
import { RobotSocket } from "../robotsocket";
import WebSocket from "ws";

jest.mock("ws");

const mockRobotSocket = new RobotSocket(jest.mocked(WebSocket.prototype));
// Alternative, but breaks turnAndDrive
// const mockRobotSocket = jest.mocked(RobotSocket.prototype);

const mockTurn = jest.spyOn(RobotSocket.prototype, "turn");
const mockDrive = jest.spyOn(RobotSocket.prototype, "drive");
beforeEach(() => {
  mockTurn.mockClear();
  mockDrive.mockClear();
});

describe("absoluteRotate", () => {
  it.each([
    [15, 345, -30],
    [345, 15, 30],
    [90, 170, 80],
  ])(
    "Turns from %p deg to %p deg",
    async (start: number, end: number, expected: number) => {
      // Convert degrees to radians
      const endRadians = end * DEGREE;
      const robot = new Robot(mockRobotSocket, start * DEGREE);
      await robot.absoluteRotate(endRadians);
      expect(mockTurn.mock.calls[0][0]).toBeCloseTo(expected * DEGREE);
      expect(robot.heading).toBeCloseTo(endRadians);
    }
  );
});

describe("absoluteDrive", () => {});

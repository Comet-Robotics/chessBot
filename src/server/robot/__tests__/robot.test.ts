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
  it("Turns left 30 degrees", async () => {
    const robot = new Robot(mockRobotSocket, 15 * DEGREE);
    await robot.absoluteRotate(345 * DEGREE);
    expect(mockTurn.mock.calls[0][0]).toBeCloseTo(-30 * DEGREE);
  });

  it("Turns right 30 degrees", async () => {
    const robot = new Robot(mockRobotSocket, 345 * DEGREE);
    await robot.absoluteRotate(15 * DEGREE);
    expect(mockTurn.mock.calls[0][0]).toBeCloseTo(30 * DEGREE);
  });

  it("Turns left 80 degrees", async () => {
    const robot = new Robot(mockRobotSocket, 90 * DEGREE);
    await robot.absoluteRotate(170 * DEGREE);
    expect(mockTurn.mock.calls[0][0]).toBeCloseTo(80 * DEGREE);
  });
});

describe("absoluteDrive", () => {});

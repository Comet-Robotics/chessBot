import { PieceType, Side, getStartHeading } from "./types";
import { RobotSocket } from "./robotsocket";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public startHeading: number;
  public heading: number;
  public x: number = 0;
  public y: number = 0;

  constructor(
    side: Side,
    public pieceType: PieceType,
    private socket: RobotSocket
  ) {
    this.startHeading = this.heading = getStartHeading(side);
  }

  public async absoluteRotate(heading: number): Promise<void> {
    // TODO: do some annoying logic
    this.socket.drive(heading);
  }

  public async relativeRotate(heading: number): Promise<void> {
    // TODO: some more annoying logic
    this.socket.drive(heading);
  }

  public async relativeMove(x: number, y: number): Promise<void> {
    // TODO: Compute drive arguments
    const promise = this.socket.drive();
    this.heading = Math.atan2(y - this.y, x - this.x);
    this.x += x;
    this.y += y;
    return promise;
  }
}

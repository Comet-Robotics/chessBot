import { RobotSocket } from "./robotsocket";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public heading: number;
  public x: number = 0;
  public y: number = 0;

  constructor(private socket: RobotSocket, public startHeading: number) {
    this.heading = startHeading;
  }

  public async absoluteRotate(heading: number): Promise<void> {
    // do some annoying logic
    this.socket.drive(heading);
  }

  public async relativeRotate(heading: number): Promise<void> {
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

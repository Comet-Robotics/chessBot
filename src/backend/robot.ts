import { RobotSocket } from "./robotsocket";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public heading: number;
  public x: number = 0;
  public y: number = 0;

  constructor(private socket: RobotSocket, private startHeading: number) {
    this.heading = startHeading;
  }

  public async relativeRotate(heading: number): Promise<void> {
    this.socket.drive(heading);
  }

  public async relativeMove(
    x: number,
    y: number,
    reorient: boolean = false
  ): Promise<void> {
    // TODO: Implement
    const promise = this.socket.drive();
    if (reorient) {
      promise.then(() => this.socket.drive());
    }

    if (reorient) {
      this.heading = this.startHeading;
    } else {
      this.heading = Math.atan2(y - this.y, x - this.x);
    }
    this.x += x;
    this.y += y;
    return promise;
  }
}

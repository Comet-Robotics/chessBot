import { Position, ZERO_POSITION } from "./pair";
import { RobotSocket } from "./robotsocket";
import { DEGREE, clampHeading } from "./units";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public _heading: number;

  constructor(
    private socket: RobotSocket,
    // public const
    public readonly startHeading: number = 0,
    // public immutable
    public _position: Position = ZERO_POSITION
  ) {
    this._heading = startHeading;
  }

  public get position(): Position {
    return this._position;
  }

  public get heading(): number {
    return this._heading;
  }

  /**
   * @param heading : An absolute heading to turn to.
   */
  public async absoluteRotate(heading: number): Promise<void> {
    const delta1: number = heading - this._heading;
    var delta2: number;
    if (this._heading < heading) {
      delta2 = heading - (this._heading + 360 * DEGREE);
    } else {
      delta2 = heading + 360 * DEGREE - this._heading;
    }

    if (Math.abs(delta1) < Math.abs(delta2)) {
      this.socket.turn(delta1);
    } else {
      this.socket.turn(delta2);
    }
    this._heading = heading;
  }

  /**
   * @param deltaHeading : A relative heading to turn by.
   */
  public async relativeRotate(deltaHeading: number): Promise<void> {
    this.socket.turn(deltaHeading);
    this._heading = clampHeading(this._heading + deltaHeading);
  }

  /**
   * Turns and drives the robot to `this.position + deltaPosition`.
   * @param deltaPosition : The amount to offset the current position by.
   */
  public async relativeMove(deltaPosition: Position): Promise<void> {
    // TODO: Compute drive arguments
    const promise = this.socket.turnAndDrive();
    this._heading = Math.atan2(deltaPosition.y, deltaPosition.x); // y, x for atan2
    this._position = this._position.add(deltaPosition);
    return promise;
  }
}

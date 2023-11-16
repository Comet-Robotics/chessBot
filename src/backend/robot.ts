import { Position, ZERO_POSITION } from "./pair";
import { RobotSocket } from "./robotsocket";
import { clampHeading } from "./units";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public _heading: number;

  constructor(
    private socket: RobotSocket,
    public readonly startHeading: number = 0,
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
    // TODO: do some annoying logic
    this.socket.turn(heading);
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

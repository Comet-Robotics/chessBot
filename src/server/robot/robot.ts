import { Position, ZERO_POSITION } from "./pair";
import { RobotSocket } from "./robot-socket";
import { FULL_ROTATION, clampHeading } from "../utils/units";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  private _heading: number;

  constructor(
    private readonly socket: RobotSocket,
    public readonly startHeading: number = 0,
    private _position: Position = ZERO_POSITION
  ) {
    this._heading = startHeading;
  }

  public get position(): Position {
    return this._position;
  }

  private set position(position: Position) {
    this._position = position;
  }

  public get heading(): number {
    return this._heading;
  }

  private set heading(heading: number) {
    this._heading = heading;
  }

  /**
   * @param heading An absolute heading to turn to.
   */
  public async absoluteRotate(heading: number): Promise<void> {
    const delta1: number = heading - this.heading;
    var delta2: number;
    if (this.heading < heading) {
      delta2 = heading - (this.heading + FULL_ROTATION);
    } else {
      delta2 = heading + FULL_ROTATION - this.heading;
    }
    const turnAmount = Math.abs(delta1) < Math.abs(delta2) ? delta1 : delta2;
    this.heading = heading;
    return this.socket.turn(turnAmount);
  }

  /**
   * @param deltaHeading A relative heading to turn by.
   */
  public async relativeRotate(deltaHeading: number): Promise<void> {
    this.heading = clampHeading(this.heading + deltaHeading);
    return this.socket.turn(deltaHeading);
  }

  /**
   * Turns and drives the robot to `this.position + deltaPosition`.
   * @param deltaPosition The amount to offset the current position by.
   */
  public async relativeMove(deltaPosition: Position): Promise<void> {
    // TODO: Compute drive arguments
    const promise = this.socket.turnAndDrive();
    this.heading = Math.atan2(deltaPosition.y, deltaPosition.x); // y, x for atan2
    this.position = this.position.add(deltaPosition);
    return promise;
  }
}

import { PieceType, Side, getStartHeading } from "./types";
import { RobotSocket } from "./robotsocket";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
  public _heading: number;
  public _x: number = 0;
  public _y: number = 0;

  constructor(
    public _side: Side,
    public _pieceType: PieceType,
    private socket: RobotSocket
  ) {
    this._heading = getStartHeading(_side);
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this._y;
  }

  public get heading(): number {
    return this._heading;
  }

  public get side(): Side {
    return this._side;
  }

  public get pieceType(): PieceType {
    return this._pieceType;
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
    this._heading = Math.atan2(y - this.y, x - this.x);
    this._x += x;
    this._y += y;
    return promise;
  }
}

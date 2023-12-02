import WebSocket from "ws";
/**
 * Represents a connection to a physical robot.
 */
export class RobotSocket {
  constructor(private socket: WebSocket) {}

  public async turnAndDrive(
    deltaHeading: number = 0,
    distance: number = 0
  ): Promise<void> {
    return this.turn(deltaHeading).then(() => this.drive(distance));
  }

  /**
   * @param distance The distance to drive forward or backwards by. 1 is defined as the length of a tile.
   */
  public async drive(distance: number): Promise<void> {
    this.socket.send("arg");
  }

  /**
   * @param deltaHeading A relative heading to turn by. May be positive or negative.
   */
  public async turn(deltaHeading: number): Promise<void> {
    this.socket.send("agg");
  }
}

/**
 * Represents a connection to a physical robot.
 */
export class RobotSocket {
  // TODO: Implement
  constructor() {}

  public async turnAndDrive(
    relativeHeading: number = 0,
    distance: number = 0
  ): Promise<void> {
    return this.turn(relativeHeading).then(() => this.drive(distance));
  }

  /**
   *
   * @param distance The distance to drive forward or backwards by. 1 is defined as the length of a tile.
   */
  public async drive(distance: number): Promise<void> {}

  /**
   * @param relativeHeading A relative heading to turn by. May be positive or negative.
   */
  public async turn(relativeHeading: number): Promise<void> {}
}

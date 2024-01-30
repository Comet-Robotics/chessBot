import { BotTunnel, PacketType } from "../api/tcp-interface";

/**
 * Represents a connection to a physical robot.
 */
export class RobotSocket {
  constructor(private tunnel: BotTunnel) {}

  public async turnAndDrive(
    deltaHeading: number = 0,
    distance: number = 0
  ): Promise<void> {
    return this.turn(deltaHeading).then(() => this.drive(distance));
  }

  /**
   * Send a packet to the robot indicating distance to drive. Returns a promise that finishes when the
   * robot finishes the action.
   * 
   * @param distance The distance to drive forward or backwards by. 1 is defined as the length of a tile.
   */
  public async drive(distance: number): Promise<void> {
    this.tunnel.send(PacketType.DRIVE_TILES, distance.toString());
    // TODO: wait for tunnel to receive ACTION_X message
  }

  /**
   * Send a packet to the robot indicating angle to turn. Returns a promise that finishes when the
   * robot finishes the action.
   * 
   * @param deltaHeading A relative heading to turn by, in radians. May be positive or negative.
   */
  public async turn(deltaHeading: number): Promise<void> {
    this.tunnel.send(PacketType.TURN_BY_ANGLE, deltaHeading.toString());
    // TODO: wait for tunnel to receive ACTION_X message
  }
}

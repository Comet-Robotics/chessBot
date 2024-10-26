import { FULL_ROTATION, RADIAN, clampHeading } from "../utils/units";
import { Position, ZERO_POSITION } from "./position";
import { GridIndices } from "./grid-indices";
import { tcpServer } from "../api/api";
import { BotTunnel } from "../api/tcp-interface";

/**
 * Represents a robot.
 * Includes information about the current location as well as tooling for communication.
 */
export class Robot {
    private _heading: number;

    constructor(
        public readonly id: string,
        /**
         * The location the robot lives in when its not in use.
         */
        public readonly homeIndices: GridIndices,
        public readonly startHeading: number = 0,
        private _position: Position = ZERO_POSITION,
    ) {
        this._heading = startHeading;
    }

    public get position(): Position {
        return this._position;
    }

    private set position(coords: Position) {
        this._position = coords;
    }

    public get heading(): number {
        return this._heading;
    }

    private set heading(heading: number) {
        this._heading = heading;
    }

    /**
     * @param heading - An absolute heading to turn to, in degrees. 0 is up (from white to black). CW is positive.
     */
    public async absoluteRotate(heading: number): Promise<void> {
        const delta1: number = heading - this.heading;
        let delta2: number;
        if (this.heading < heading) {
            delta2 = heading - (this.heading + FULL_ROTATION);
        } else {
            delta2 = heading + FULL_ROTATION - this.heading;
        }
        const turnAmount =
            Math.abs(delta1) < Math.abs(delta2) ? delta1 : delta2;
        this.heading = heading;
        return this.sendTurnPacket(turnAmount);
    }

    /**
     * @param deltaHeading - A relative heading to turn by, in degrees.
     */
    public async relativeRotate(deltaHeading: number): Promise<void> {
        this.heading = clampHeading(this.heading + deltaHeading);
        return this.sendTurnPacket(deltaHeading);
    }

    /**
     * Turns and drives the robot to `this.position + deltaPosition`.
     * @param deltaPosition - The amount to offset the current position by.
     */
    public async relativeMove(deltaPosition: Position): Promise<void> {
        const offset = deltaPosition.sub(this.position);
        const distance = Math.hypot(offset.x, offset.y);
        const angle = clampHeading(Math.atan2(-offset.x, offset.y) * RADIAN);
        // TODO: in sim mode, for some reason the rotate packet gets sent, but we never make it to sending the drive packet.
        // my best guess is that there's some sort of issue with the actionComplete event 
        // not being emitted / handled properly?
        const promise = this.absoluteRotate(angle).then(() => {
            console.log(`notice how this never gets logged... even though the rotate packet is sent`)
            return this.sendDrivePacket(distance)
        });
        this.position = this.position.add(deltaPosition);
        return promise;
    }

    protected getTunnel(): BotTunnel {
        return tcpServer!.getTunnelFromId(this.id);
    }

    /**
     * Send a packet to the robot indicating angle to turn. Returns a promise that finishes when the
     * robot finishes the action.
     *
     * @param deltaHeading - A relative heading to turn by, in radians. May be positive or negative.
     */
    public async sendTurnPacket(deltaHeading: number): Promise<void> {
        const tunnel = this.getTunnel();
        tunnel.send({ type: "TURN_BY_ANGLE", deltaHeading });
        return tunnel.waitForActionResponse();
    }

    /**
     * Send a packet to the robot indicating distance to drive. Returns a promise that finishes when the
     * robot finishes the action.
     *
     * @param tileDistance - The distance to drive forward or backwards by. 1 is defined as the length of a tile.
     */
    public async sendDrivePacket(tileDistance: number): Promise<void> {
        const tunnel = this.getTunnel();
        tunnel.send({ type: "DRIVE_TILES", tileDistance });
        return tunnel.waitForActionResponse();
    }
}

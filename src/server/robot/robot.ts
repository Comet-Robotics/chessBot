import { FULL_ROTATION, clampHeading } from "../utils/units";
import { Position, ZERO_POSITION } from "./position";
import { GridIndices } from "./grid-indices";
import { tcpServer } from "../api/api";

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
     * @param heading - An absolute heading to turn to.
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
        return this.turn(turnAmount);
    }

    /**
     * @param deltaHeading - A relative heading to turn by.
     */
    public async relativeRotate(deltaHeading: number): Promise<void> {
        this.heading = clampHeading(this.heading + deltaHeading);
        return this.turn(deltaHeading);
    }

    /**
     * Turns and drives the robot to `this.position + deltaPosition`.
     * @param deltaPosition - The amount to offset the current position by.
     */
    public async relativeMove(deltaPosition: Position): Promise<void> {
        // TODO: Compute drive arguments
        const xOffset = deltaPosition.x - this.position.x;
        const yOffset = deltaPosition.y - this.position.y;
        const distance = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
        const promise = this.drive(distance);
        this.position = this.position.add(deltaPosition);
        return promise;
    }

    public async turn(deltaHeading: number): Promise<void> {
        const tunnel = tcpServer.getTunnelFromId(this.id);
        tunnel.send({ type: "TURN_BY_ANGLE", deltaHeading });
        return tunnel.waitForActionResponse();
    }

    public async drive(tileDistance: number): Promise<void> {
        const tunnel = tcpServer.getTunnelFromId(this.id);
        tunnel.send({ type: "DRIVE_TILES", tileDistance });
        return tunnel.waitForActionResponse();
    }
}

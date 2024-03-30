import { Indices } from "./pair";
import { Robot } from "./robot";

/**
 * Stores robots. Provides utilities for finding them by position.
 */
export class RobotManager {
    robots: Map<string, Robot> = new Map();
    positions: Map<string, Indices> = new Map();

    constructor() {}

    addRobot(id: string, robot: Robot) {
        this.robots.set(id, robot);
    }

    getRobot(id: string): Robot {
        const robot = this.robots.get(id);
        if (robot === undefined) {
            throw new Error("Failed to find robot with id " + id);
        }
        return robot;
    }
}

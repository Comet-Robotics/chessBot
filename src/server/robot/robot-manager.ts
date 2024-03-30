import { GridIndices } from "./grid-indices";
import { Robot } from "./robot";

/**
 * Stores robots. Provides utilities for finding them by position.
 */
export class RobotManager {
    /**
     * Maps robot ids to robots.
     */
    idsToRobots: Map<string, Robot> = new Map();

    /**
     * Maps robot locations to their ids.
     */
    indicesToIds: Map<GridIndices, string> = new Map();

    constructor(robots: Robot[]) {
        robots.forEach((robot) => this.addRobot(robot));
    }

    addRobot(robot: Robot) {
        this.idsToRobots.set(robot.id, robot);
        this.indicesToIds.set(robot.homeIndices, robot.id);
    }

    /**
     * Retrieves a robot by id.
     * Throws if no robot is found.
     */
    getRobot(robotId: string): Robot {
        const robot = this.idsToRobots.get(robotId);
        if (robot === undefined) {
            throw new Error("Failed to find robot with id " + robotId);
        }
        return robot;
    }

    /**
     * Returns `true` if a Robot is at the specified position, and `false` otherwise.
     */
    isRobotAtIndices(indices: GridIndices): boolean {
        return this.indicesToIds.has(indices);
    }

    /**
     * Retrieves a robot at `indices`.
     * Throws if no robot is found.
     */
    getRobotAtIndices(indices: GridIndices): Robot {
        const robotId = this.indicesToIds.get(indices);
        if (robotId === undefined) {
            throw new Error("Failed to find robot at position " + indices);
        }
        return this.getRobot(robotId);
    }
}

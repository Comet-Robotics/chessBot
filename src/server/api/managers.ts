/**
 * This module creates global singleton instances of the various manager classes.
 */

import { RobotManager } from "../robot/robot-manager";
import { ClientManager } from "./client-manager";
import { SocketManager } from "./socket-manager";
import { virtualRobots } from "../simulator/robot";
import { USE_VIRTUAL_ROBOTS } from "../utils/env";

export const socketManager = new SocketManager({});
export const clientManager = new ClientManager(socketManager);
export const robotManager = new RobotManager(USE_VIRTUAL_ROBOTS ? Array.from(virtualRobots.values()) : []);

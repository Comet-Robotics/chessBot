/**
 * This module creates global singleton instances of the various manager classes.
 */

import { RobotManager } from "../robot/robot-manager";
import { ClientManager } from "./client-manager";
import { SocketManager } from "./socket-manager";

export const socketManager = new SocketManager({});
export const clientManager = new ClientManager(socketManager);
export const robotManager = new RobotManager([]);

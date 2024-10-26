import EventEmitter from "node:events";
import { BotTunnel } from "./api/tcp-interface";
import { Robot } from "./robot/robot";
import config from './api/bot-server-config.json';
import { Packet } from "./utils/tcp-packet";
import { Position, ZERO_POSITION } from "./robot/position";

export class VirtualBotTunnel extends BotTunnel {
    connected = true;

    deltaHeading = 0;
    deltaPosition = ZERO_POSITION;

    constructor() {
        super(null, (_) => {})
        this.emitter = new EventEmitter();
    }

    isActive(): boolean {
        return true;
    }

    getIdentifier(): string {
        return "Virtual Bot ID: " + this.id;
    }

    send(packet: Packet) {
        // NOTE: need to ensure that all the packets which are used in the Robot class (src/server/robot/robot.ts) are also provided with a matching virtual implementation here
        switch (packet.type) {
            case "TURN_BY_ANGLE":
                this.deltaHeading += packet.deltaHeading;
                break;
            case "DRIVE_TILES":
                this.deltaPosition = this.deltaPosition.add(new Position(packet.tileDistance, 0));
                break;
            default:
                throw new Error("Invalid packet type for virtual bot: " + packet.type)
        }
        //  TODO: send WS messages for simulator updates
    }
}

export class VirtualRobot extends Robot {
    getTunnel(): BotTunnel {
        return virtualBotTunnels.get(this.id)!;
    }

}

const virtualBotIds = Array(32).fill(undefined).map((_, i) => `virtual-robot-${(i+1).toString()}`)

const virtualBotTunnels = new Map<string, BotTunnel>(
    virtualBotIds.map((id) => [id, new VirtualBotTunnel()]),
);

export const virtualRobots = new Map<string, VirtualRobot>(
    virtualBotIds.map((id) => {
        const realRobotConfig = config[id.replace("virtual-", "")]
        return [id, new VirtualRobot(
            id,
            realRobotConfig.homePosition,
            undefined,
            realRobotConfig.defaultPosition,
        )] as const
    }),
);




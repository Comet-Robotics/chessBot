import EventEmitter from "node:events";
import { BotTunnel } from "./api/tcp-interface";
import { Robot } from "./robot/robot";
import config from "./api/bot-server-config.json";
import { Packet } from "./utils/tcp-packet";
import { Position, ZERO_POSITION } from "./robot/position";
import path from "path";
import {
    SimulatorUpdateMessage,
    StackFrame,
} from "../common/message/simulator-message";
import { socketManager } from "./api/managers";

const srcDir = path.resolve(__dirname, "../");

function getStack(justMyCode = true) {
    // inspired by https://stackoverflow.com/a/56651526
    const err = new Error();
    Error.captureStackTrace(err, getStack);

    const { stack } = err;
    if (!stack) return;
    const cleanedStack = parseErrorStack(stack);

    if (justMyCode) {
        const chessBotCodeEndFrame = cleanedStack.findIndex(
            (frame) => !frame.fileName.startsWith(srcDir),
        );
        if (chessBotCodeEndFrame !== -1) {
            cleanedStack.splice(chessBotCodeEndFrame);
        }
    }

    return cleanedStack;
}

const parseErrorStack = (stack: string): StackFrame[] => {
    const lines = stack.split("\n");
    const frames = lines.slice(1).map((line) => {
        const match = line.match(/^\s+at (?:(.+) \()?(.+):(\d+):(\d+)\)?$/);
        if (!match) {
            throw new Error(`Invalid stack frame: ${line}`);
        }
        const [, functionName, fileName, lineNumber, columnNumber] = match;
        return {
            fileName,
            functionName,
            lineNumber: parseInt(lineNumber),
            columnNumber: parseInt(columnNumber),
        };
    });
    return frames;
};

export class VirtualBotTunnel extends BotTunnel {
    connected = true;

    heading = 0;
    position = ZERO_POSITION;

    static messages: {
        ts: Date;
        message: SimulatorUpdateMessage;
    }[] = [];

    constructor(private robotId: string) {
        super(null, (_) => {});

        // pulling initial heading and position from robot, then only depending on messages sent to the 'robot' to update the position and heading
        const robot = virtualRobots.get(robotId)!;
        this.heading = robot.heading;
        this.position = robot.position;

        this.emitter = new EventEmitter();
    }

    isActive(): boolean {
        return true;
    }

    getIdentifier(): string {
        return "Virtual Bot ID: " + this.robotId;
    }

    private emitActionComplete() {
        this.emitter.emit("actionComplete", { success: true });
    }

    send(packet: Packet) {
        const stack = getStack();

        // NOTE: need to ensure that all the packets which are used in the Robot class (src/server/robot/robot.ts) are also provided with a matching virtual implementation here
        switch (packet.type) {
            case "TURN_BY_ANGLE":
                this.heading += packet.deltaHeading;
                this.emitActionComplete();
                break;
            case "DRIVE_TILES": {
                const distance = packet.tileDistance;
                const angleInRadians = this.heading * (Math.PI / 180);
                const deltaX = distance * Math.sin(angleInRadians);
                const deltaY = distance * Math.cos(angleInRadians);

                const newPosition = this.position.add(
                    new Position(deltaX, deltaY),
                );
                console.log(
                    `Robot ${this.robotId} moved to ${newPosition.x}, ${newPosition.y} from ${this.position.x}, ${this.position.y}`,
                );
                this.position = newPosition;

                this.emitActionComplete();
                break;
            }
            default:
                throw new Error(
                    "Unhandled packet type for virtual bot: " + packet.type,
                );
        }

        const message = new SimulatorUpdateMessage(
            this.robotId,
            {
                position: this.position,
                heading: this.heading,
            },
            packet,
            stack,
        );
        VirtualBotTunnel.messages.push({ ts: new Date(), message });
        socketManager.sendToAll(message);
    }
}

export class VirtualRobot extends Robot {
    public getTunnel(): BotTunnel {
        return virtualBotTunnels.get(this.id)!;
    }
}

const virtualBotIds = Array(32)
    .fill(undefined)
    .map((_, i) => `virtual-robot-${(i + 1).toString()}`);

export const virtualRobots = new Map<string, VirtualRobot>(
    virtualBotIds.map((id) => {
        const realRobotConfig = config[id.replace("virtual-", "")];
        return [
            id,
            new VirtualRobot(
                id,
                realRobotConfig.homePosition,
                undefined,
                new Position(
                    realRobotConfig.defaultPosition.x + 0.25,
                    realRobotConfig.defaultPosition.y + 0.25,
                ),
            ),
        ] as const;
    }),
);

const virtualBotTunnels = new Map<string, BotTunnel>(
    virtualBotIds.map((id) => [id, new VirtualBotTunnel(id)]),
);

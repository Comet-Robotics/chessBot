import { Packet } from "../../server/utils/tcp-packet";
import { Message, MessageType } from "./message";
export type SimulatedRobotLocation = {
    position: { x: number; y: number };
    heading: number;
};

export type StackFrame = {
    fileName: string;
    functionName?: string;
    lineNumber: number;
    columnNumber: number;
};

export class SimulatorUpdateMessage extends Message {
    protected type = MessageType.SIMULATOR_UPDATE;

    constructor(
        public readonly robotId: string,
        public readonly location: SimulatedRobotLocation,
        public readonly packet: Packet,
        public readonly stackTrace?: StackFrame[],
    ) {
        super();
    }

    protected toObj(): object {
        return {
            ...super.toObj(),
            robotId: this.robotId,
            location: {
                x: this.location.position.x,
                y: this.location.position.y,
            },
            packet: this.packet,
            stackTrace: this.stackTrace,
        };
    }
}

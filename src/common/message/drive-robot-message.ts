import { Message, MessageType } from "./message";

export class DriveRobotMessage extends Message {
    constructor(
        public readonly id: string,
        public readonly leftPower: number,
        public readonly rightPower: number,
    ) {
        super();
    }

    protected type = MessageType.DRIVE_ROBOT;

    protected toObj(): Object {
        return {
            ...super.toObj(),
            id: this.id,
            leftPower: this.leftPower,
            rightPower: this.rightPower,
        };
    }
}

/**
 * An abstract message used to stop a robot.
 * This message looks to the server like a DriveRobotMessage with power set to 0.
 */
export class StopRobotMessage extends DriveRobotMessage {
    constructor(public readonly id: string) {
        super(id, 0, 0);
    }
}

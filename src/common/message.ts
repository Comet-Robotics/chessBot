export function parseMessage(text: string): Message {
  const obj = JSON.parse(text);
  switch (obj.type) {
    case MessageType.POSITION:
      return new PositionMessage(obj.position);
    case MessageType.MOVE:
      return new MoveMessage(obj.from, obj.to);
    case MessageType.PROMOTION:
      return new PromotionMessage(obj.from, obj.to, obj.promotion);
    case MessageType.RESET:
      return new ResetMessage();
  }
  throw new Error("Message failed");
}

export abstract class Message {
  public abstract get type(): MessageType;

  public toJson(): string {
    return JSON.stringify(this.toObj());
  }

  protected toObj(): Object {
    return { type: this.type };
  }
}

export class PositionMessage extends Message {
  constructor(public readonly position: string) {
    super();
  }

  public get type(): MessageType {
    return MessageType.POSITION;
  }

  protected toObj(): Object {
    return { ...super.toObj(), position: this.position };
  }
}

export class MoveMessage extends Message {
  constructor(public readonly from: string, public readonly to: string) {
    super();
  }

  public get type(): MessageType {
    return MessageType.MOVE;
  }

  protected toObj(): Object {
    return { ...super.toObj(), from: this.from, to: this.to };
  }
}

export class PromotionMessage extends MoveMessage {
  constructor(from: string, to: string, public readonly promotion: string) {
    super(from, to);
  }

  public get type(): MessageType {
    return MessageType.PROMOTION;
  }

  public toObj(): Object {
    return { ...super.toObj(), promotion: this.promotion };
  }
}

export class ResetMessage extends Message {
  public get type(): MessageType {
    return MessageType.RESET;
  }
}

export enum MessageType {
  /**
   * Starts a game.
   */
  START_GAME = "start-game",
  /**
   * A message defining the position of a game.
   */
  POSITION = "position",
  /**
   * A message containing a single move.
   */
  MOVE = "move",
  /**
   * A message containing a promotion.
   */
  PROMOTION = "promotion",
  /**
   * A request to reset the game.
   */
  RESET = "reset",
}

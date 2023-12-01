export abstract class Message {
  public toJson(): string {
    return JSON.stringify({ type: this.type, ...this.toObj() });
  }

  public abstract get type(): MessageType;

  protected toObj(): Object {
    return {};
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
    return { position: this.position };
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
    return { from: this.from, to: this.to };
  }
}

export class PromotionMessage extends MoveMessage {
  constructor(from: string, to: string, public readonly promotion: string) {
    super(from, to);
  }

  public get type(): MessageType {
    return MessageType.PROMOTION;
  }

  protected toObj(): Object {
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
   * A message defining the position of a game.
   */
  POSITION,
  /**
   * A message containing a single move.
   */
  MOVE,
  /**
   * A message containing a promotion.
   */
  PROMOTION,
  /**
   * A request to reset the game.
   */
  RESET,
}

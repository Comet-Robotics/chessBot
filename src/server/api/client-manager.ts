export class ClientManager {
  private clientSockets: Record<string, WebSocket>;
  constructor() {
    this.clientSockets = {};
  }

  public registerClient(clientId: string, socket: WebSocket) {
    this.clientSockets[clientId] = socket;
  }

  public getClient(clientId: string): WebSocket {
    return this.clientSockets[clientId];
  }
}

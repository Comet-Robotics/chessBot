const BotManager = require('./BotManager.js');
const BotServer = require('./BotServer.js');
const DebugServer = require('./DebugServer.js');
const WebServer = require('./WebServer.js');

// Bundle of all state stored on this device
class ChessBotServer {
    // Maintains state of bots in the chess game
    botManager;

    // Maintains connections with robots
    botServer;

    // Maintains connections with clients with special access
    // They can drive individual bots
    debugServer;

    // Maintains the normal player interface of a chess board
    webServer;

    config;

    constructor() {
        // todo: watch config file for changes
        this.config = require('../config.json');

        this.botManager = new BotManager.BotManager(this);
        this.botServer = new BotServer(this);
        this.debugServer = new DebugServer(this);
        this.webServer = new WebServer(this);
    }

    run() {
        this.webServer.run(this.config.webServerPort);
    }
}

module.exports = ChessBotServer;

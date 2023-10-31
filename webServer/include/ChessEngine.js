// Sets up the chess engine.
// This covers all the playing and valid move checking for the chess game
const jsChessEngine = require('js-chess-engine');

class ChessEngine {
    game;

    constructor() {
        this.game = new jsChessEngine.Game();
    }

    // Turns the board into a form that can easily be sent over a network
    getStatus() {
        return this.game.exportJson();
    }
}

module.exports = ChessEngine;

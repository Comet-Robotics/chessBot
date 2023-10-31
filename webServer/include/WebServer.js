// Imports a bunch of libraries (Code other people wrote that we can freely use)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const expressWs = require('express-ws');

class WebServer {
    // Express instance
    #app;

    // Reference back to whole server
    #server;

    constructor(server) {
        this.#server = server;

        this.makeExpressServer();
    }

    makeExpressServer() {
        this.#app = express();

        // Bind the websocket handler to the express server
        expressWs(this.#app);

        // Sets up some stuff you don't have to worry about.
        this.#app.use(bodyParser.json());
        this.#app.use(cors());
        this.#app.use(express.static(path.join('../chess-bot-client/build')));

        // When a client connects, this sends them the website html
        this.#app.get('/', function(req, res) {
            res.sendFile(path.join(__dirname, '../', 'index.html'));
        });

        // This runs whenever a client tries to make a move
        this.#app.post('/move/:from/:to', (req, res) => {
            const fromRequest = req.params.from;
            const toRequest = req.params.to;
            console.log(fromRequest, toRequest);

            // If the move is invalid, this will error
            try {
                const moveResponse = game.move(fromRequest, toRequest);
                chessStatus = game.exportJson();
                console.log('move response: ' + moveResponse);
                res.send(chessStatus);
            } catch (error) {
                console.log(error);
                res.status(404).json({error: 'move error'});
            }
            // Any code past the try catch can safely assume the move is valid

            game.printToConsole();
            botManager.sendMove(fromRequest, toRequest);
        });


        // This runs whenever the client requests the board status
        this.#app.get('/status', (req, res) => {
            console.log('Status Sent!');
            res.send(chessStatus);
        });

        // This runs when the client makes an ai move
        this.#app.post('/aimove/:level', (req, res) => {
            const levelRequest = req.params.level;

            // If the move is invalid, this will error
            try {
                const aiMoveResponse = game.aiMove(levelRequest);
                chessStatus = game.exportJson();
                console.log('AI move response: ' + aiMoveResponse);
                res.send(chessStatus);
            } catch (error) {
                console.log(error);
                res.status(404).json({error: 'ai move error'});
            }
            // Any code past the try catch can safely assume the move is valid

            game.printToConsole();
            botManager.sendMove(fromRequest, toRequest);
        });

        // This resets the board for the clients
        this.#app.post('/resetGame', (req, res) => {
            game = new jsChessEngine.Game();
            chessStatus = game.exportJson();
            game.printToConsole();
            res.send(chessStatus);
        });

        // This runs when a client clicks on a piece,
        // and requests the valid moves
        this.#app.get('/moves/:piece', (req, res) => {
            const piece = req.params.piece;
            console.log('Status Sent!');
            console.log(piece);
            res.send(game.moves(piece));
        });

        this.#app.get('/debug', function(req, res) {
            res.sendFile(path.join(__dirname, '../debug', 'index.html'));
        });

        const server = this.#server;

        this.#app.ws('/debug/ws', function(ws, req) {
            server.debugServer.bindWebSocket(ws, req);
        });
    }

    run(port) {
        // This basically just says that the server listens for data
        // on the network port set earlier
        this.#app.listen(port, () => {
            console.log('ChessBot server online!');
        });
    }
};

module.exports = WebServer;

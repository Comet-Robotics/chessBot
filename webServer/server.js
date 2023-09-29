// Imports a bunch of libraries (Code other people wrote that we can freely use)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// BotManager code is in it's own file
// This line allow THIS file to incorporate the code.
// Basically a self made library
const BotManager = require('./include/BotManager.js');

// Creates our custom bot manager and runs it's constructor
const botManager = new BotManager;

const app = express();
// Different from usb port. This is a network port
const port = 3000;

// Sets up the chess engine.
//  This covers all the playing and valid move checking for the chess game
const jsChessEngine = require('js-chess-engine');
game = new jsChessEngine.Game();

// Turns the board into a form that can easily be sent over a network
chessStatus = game.exportJson();

// Sets up some stuff you don't have to worry about. Things like security, etc
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join('../chess-bot-client/build')));

// This basically just says that the server listens for data
// on the network port set earlier
app.listen(port, () => {
    console.log('ChessBot server online!');
});

// When a client connects, this sends them the website html
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../', 'index.html'));
});

// This runs whenever a client tries to make a move
app.post('/move/:from/:to', (req, res) => {
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
app.get('/status', (req, res) => {
    console.log('Status Sent!');
    res.send(chessStatus);
});

// This runs when the client makes an ai move
app.post('/aimove/:level', (req, res) => {
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
app.post('/resetGame', (req, res) => {
    game = new jsChessEngine.Game();
    chessStatus = game.exportJson();
    game.printToConsole();
    res.send(chessStatus);
});

// This runs when a client clicks on a piece, and requests the valid moves
app.get('/moves/:piece', (req, res) => {
    const piece = req.params.piece;
    console.log('Status Sent!');
    console.log(piece);
    res.send(game.moves(piece));
});

// Xbee code is in it's own file
// This lines allow THIS file to incorporate the code.
// Basically a self made library
const Xbee = require('./Xbee.js');

// If true, you will be required to have an xbee plugged into your computer
const usingXBee = false;

// Since commits will overwrite the usb port, this will allow you to easily
// swap to the right one
// Make sure to use the same usb port on your computer every time
// if you add yours here
// To find your usb port name on Windows, open cmd and type 'mode'
// while you have an XBee plugged in

// const masonPort = '/dev/tty.usbserial-D30DRP81';
const dylanPort = 'COM5';

if (usingXBee) {
    serverXbee = new Xbee();
    serverXbee.configConnection(dylanPort);
}

// A location in 2D space with an x and y coordinate
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// A class for a path object that holds the chess piece and relative tile movements
class Path {
    constructor(piece, horizontal, vertical) {
        this.piece = piece;
        this.horizontal = horizontal;
        this.vertical = vertical;
    }
}

// This is our chess piece object that we can make instances (copies) of
class ChessPiece {
    constructor(id, type, color, location) {
        this.id = id;
        this.type = type;
        this.color = color;
        this.location = location;
    }
}

// Class to handle all the bot oriented code for the server
class BotManager {
    botMoving = false;
    // Runs when a new instance of the BotManager class is created
    constructor() {
        this.initializeBoard();
    }
    // This is a get status to determine if the bot is moving or not
    getStatus() {
        return this.botMoving;
   }  

    // Sets up an empty board
    initializeBoard() {
        // Board is 10x10 instead of 8x8 so that we can have a
        // tile of padding all around the edges
        const boardSize = 10;

        // Creates an empty 10 element long array
        this.board = new Array(boardSize);
        // Loops through each element and sets their value
        // to a new 10 element long array of zeros
        for (let i=0; i < boardSize; i++) {
            this.board[i] = Array(boardSize).fill(0);
        }
    }

    // Will go down a path to find a new path for every bot until an empty space
    // This is only half finished. I suck at recursion lol
    recursiveCalculateCollision(from, piece, collection) {
        Point next = use *from* to determine where bot needs to move to get out of way
        Path nextPath = calculatePath(piece.location, next)
        add nextPath to collection
        ChessPiece[] collisions = calculateAllCollisions(nextPath)
        // If there are no more collisions, this loop won't run, and recursion stops
        loop through collisions -> currentCollision {
            recursiveCalculateCollision(from, currentCollision, collection)
        }
    }

    // This runs whenever a valid move is made. This is where we come in.
    // We need to get the physical chess bot from point a to b
    // from/to is a string in the form of a3, b7, e4, etc...
    sendMove(from, to) {
        // Just some test code to make sure commands
        // from the server reach the chess bot
        const msg = '200,w;';
        if (usingXBee) {
            serverXbee.sendMessage(msg);
        } else {
            console.log('Sent Command: ', msg);

            // Testing out piece objects and board
            const piece1 = new ChessPiece(1, 'Knight', 'Black');
            const piece2 = new ChessPiece(2, 'Queen', 'White');
            this.board[2][5] = piece1;
            this.board[2][6] = piece2;
            if (this.board[2][5] != 0) {
                console.log(this.board[2][5].id, this.board[2][5+1].type);
            }
        }
    }
}

module.exports = BotManager;

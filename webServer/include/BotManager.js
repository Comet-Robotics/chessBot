// Xbee code is in it's own file
// This lines allow THIS file to incorporate the code.
// Basically a self made library
const Xbee = require('./Xbee.js');
const BotServer = require('./BotServer.js').BotServer;

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

// A class for a path object that holds the chess piece and relative tile
// movements
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
    board;
    // Runs when a new instance of the BotManager class is created
    constructor() {
        this.initializeBoard();

        this.server = new BotServer();
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

    printBoard() {
        for (let y = 0; y < 10; y++) {
            let line = '';
            for (let x = 0; x < 10; x++) {
                if (typeof this.board[x][y].type == 'undefined') {
                    line += '_';
                } else {
                    line += this.board[x][y].type;
                }
                line += ' ';
            }
            console.log(line);
        }
        console.log();
    }

    // Calculates the number of horizontal and vertical tiles to
    // get to destination and returns it
    // Expecting 2 point objects
    // finds the difference between the points and the starting piece
    // returns path object
    calculatePath(from, to) {
        // calc movement diffs
        const horizontal = to.x - from.x;
        const vertical = from.y - to.y;

        // find piece in "from" spot
        const piece = this.board[from.x][from.y];

        // create botPath
        const botPath = new Path(piece, horizontal, vertical);
        return botPath;
    }

    calculateAllCollisions(path) {
        const start = path.piece.location;
        const collisions = [];

        // check both horizontal directions
        // hoirzontal doesn't check the turning point,
        // itll get checked by vertical
        // doesn't check starting point
        if (path.horizontal < 0) {
            for (let i = start.x-1; i > (start.x + path.horizontal); i--) {
                if (this.board[i][start.y].id != 0) {
                    const collisionPiece = this.board[i][start.y];
                    collisions.push(collisionPiece);
                }
            }
        }
        if (path.horizontal > 0) {
            for (let i = start.x+1; i < (start.x + path.horizontal); i++) {
                if (this.board[i][start.y].id != 0) {
                    const collisionPiece = this.board[i][start.y];
                    collisions.push(collisionPiece);
                }
            }
        }

        // mark bots new x coord.
        const newXCoord = start.x + (path.horizontal);

        // only check turning point if horizontal is not 0
        if (path.horizontal != 0) {
            if (this.board[newXCoord][start.y].id != 0) {
                const collisionPiece = this.board[newXCoord][start.y];
                collisions.push(collisionPiece);
            }
        }

        // check both vertical directions
        // vertical does check the starting point
        if (path.vertical < 0) {
            for (let i = start.y+1; i <= (start.y - path.vertical); i++) {
                if (this.board[newXCoord][i].id != 0) {
                    const collisionPiece = this.board[newXCoord][i];
                    collisions.push(collisionPiece);
                }
            }
        }
        if (path.vertical > 0) {
            for (let i = start.y-1; i >= (start.y - path.vertical); i--) {
                if (this.board[newXCoord][i].id != 0) {
                    const collisionPiece = this.board[newXCoord][i];
                    collisions.push(collisionPiece);
                }
            }
        }
        return collisions;
    }

    // Takes in a piece and finds a new path for every bot until an empty space
    // Paths are not prevented from intersecting. Requires extensive testing
    recursiveCalculateCollision(from, piece, collection, depth) {
        const newLocation = this.findShiftLocation(from, piece);
        const newPath = this.calculatePath(piece.location, newLocation);
        // If recursion depth is new high, expand collection length
        if (depth >= collection.length) {
            collection.push([]);
        }
        // Recursion depth is the same as phase. Add path to current depth
        collection[depth].push(newPath);
        // Most paths will only have one collision
        const collisions = this.calculateAllCollisions(newPath);
        // If there are no more collisions,
        // this loop won't run, and recursion stops
        for (let cI = 0; cI < collisions.length; cI++) {
            const currentCollision = collisions[cI];
            // The depth increases every time the function recurses
            this.recursiveCalculateCollision(from,
                currentCollision, collection, depth+1);
        }
    }

    convertStringToPoint(stringPoint) {
        let x;
        let y;

        const serverinput = stringPoint[0];

        switch (serverinput) {
        case 'h':
            x = 1;
            break;
        case 'g':
            x = 2;
            break;
        case 'f':
            x = 3;
            break;
        case 'e':
            x = 4;
            break;
        case 'd':
            x = 5;
            break;
        case 'c':
            x = 6;
            break;
        case 'b':
            x = 7;
            break;
        case 'a':
            x = 8;
            break;
        default:
            x = 0;
            console.log('X value error');
        }
        y = parseInt(stringPoint[1]);
        const point = new Point(x, y);

        return point;
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

    shiftCollisions(phases) {
        const unshifts = [];
        for (let phaseIndex = 0; phaseIndex<phases.length; phaseIndex++) {
            const phaseMoves = phases[phaseIndex];
            unshifts.push([]);
            this.moveMultipleBots(phaseMoves);
            for (let pathIndex = 0; pathIndex<phaseMoves.length; pathIndex++) {
                const path = phaseMoves[pathIndex];
                const invertedPath = new Path(
                    path.piece, -path.horizontal, -path.vertical,
                );
                unshifts[phaseIndex].push(invertedPath);
            }
        }
        return unshifts;
    }
}


module.exports = {BotManager, Point, ChessPiece, Path};

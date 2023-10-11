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

    // Calculates the number of horizontal and vertical tiles to
    // get to destination and returns it
    // Expecting 2 point objects
    // finds the difference between the points and the starting piece
    // returns path object
    calculatePath(from, to) {
        // calc movement diffs
        horizontal = to.x - from.x;
        vertical = from.y - to.y;

        // find piece in "from" spot
        piece = this.board[from.x][from.y];

        // create botPath
        botPath = new Path(piece, horizontal, vertical);
        return botPath;
        // git test
        // i've done better
    }
    void populateBoard() {
        // loop through board vertically -> y {
            // loop through board horizontally -> x{
                // code to determine what should be in this spot on the board
                ChessPiece piece = whatever piece should be at this spot
                board[x][y] = piece

                for (let y = 0; y < 8; y++){
                    for (let x = 0; x < 8; x++){
                        let name, color;  
                        if (y == 0 || y == 7){
                            switch(x){
                                case 0:
                                case 7:
                                    name = "Rooke";
                                break;
                                case 1:
                                case 6:
                                    name = "Knight";
                                break;
                                case (2):
                                case (5):
                                    name = "Bishop";
                                break;
                                case (3):
                                    name = "King";
                                break;
                                case(4):
                                    name = "Queen";
                            }
                        }
                        else if (y = 1 || y == 6){
                            name = "Pawn";
                        }
                        else if (y >=  3 || y <= 5){
                           const piece = {name: "N/A", location:"N/A", color:"N/A"}
                        }
                        switch(y){
                            case 0:
                            case 1:
                                color = "White";
                            break;
                            case 6:
                            case 7:
                                color = "Black";
                        }
                        piece = {name: name, color: color, location: [x,y]}
                            
                            
                        }
                    }
                             
                            
                        } 

                        }
                        

                    }    
                }
                
            }
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

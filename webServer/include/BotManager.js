// Xbee code is in it's own file
// This lines allow THIS file to incorporate the code. Basically a self made library
const Xbee = require('./Xbee.js')

// If true, you will be required to have an xbee plugged into your computer
var usingXBee = false

// Since commits will overwrite the usb port, this will allow you to easily swap to the right one
// Make sure to use the same usb port on your computer every time if you add yours here
// To find your usb port name on Windows, open cmd and type 'mode' while you have an XBee plugged in
var masonPort = "/dev/tty.usbserial-D30DRP81"
var dylanPort = "COM5"

if (usingXBee) {
  serverXbee = new Xbee()
  serverXbee.configConnection(dylanPort)
}

// This is our chess piece object that we can make instances (copies) of
// Example: let pieceName = new ChessPiece(3, "Knight", "Black");
class ChessPiece
{
    constructor(id, type, color) {
        this.id = id
        this.type = type
        this.color = color
    }
}

// Class to handle all the bot oriented code for the server
class BotManager
{
    // Runs when a new instance of the BotManager class is created
    constructor() {
        this.initializeBoard()
    }

    // Sets up an empty board
    initializeBoard() {
        // Board is 10x10 instead of 8x8 so that we can have a tile of padding all around the edges
        const boardSize = 10

        // Creates an empty 10 element long array
        this.board = new Array(boardSize)
        // Loops through each element and sets their value to a new 10 element long array of zeros
        for (var i=0; i < boardSize; i++) {
            this.board[i] = Array(boardSize).fill(0)
        }
    }

    // This runs whenever a valid move is made. This is where we come in.
    // We need to get the physical chess bot from point a to b
    // from/to is a string in the form of a3, b7, e4, etc...
    sendMove(from, to) {
        // Just some test code to make sure commands from the server reach the chess bot
        let msg = "200,w;"
        if (usingXBee) {
            serverXbee.sendMessage(msg)
        } else {
            console.log("Sent Command: ", msg)

            // Testing out piece objects and board
            let piece1 = new ChessPiece(1, "Knight", "Black")
            let piece2 = new ChessPiece(2, "Queen", "White")
            this.board[2][5] = piece1
            this.board[2][6] = piece2
            if (this.board[2][5] != 0) {
                console.log(this.board[2][5].id, this.board[2][5+1].type)
            }
        }
    }
}

module.exports = BotManager
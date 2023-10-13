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
    constructor(piece, horizontal, vertical, isXFirst) {
        this.piece = piece;
        this.horizontal = horizontal;
        this.vertical = vertical;
        this.xFirst = isXFirst;
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
    // This returns the status to of whether the bots are moving or not
    getStatus() {
        return this.botMoving;
    }

    // Sets up an empty 10x10 matrix for the board
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

    // Prints out the current state of the board to the console
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
    // Finds the difference between the points and the starting piece
    // Expects 2 Point objects
    // Returns Path object
    calculatePath(from, to) {
        // Calculate position diffrences
        const horizontal = to.x - from.x;
        const vertical = from.y - to.y;

        // Find the ChessPiece in "from" spot
        const piece = this.board[from.x][from.y];

        // Create a new Path with the piece and differences
        const botPath = new Path(piece, horizontal, vertical);
        return botPath;
    }

    // Determine every robot in the way of a Path and put them into an array
    // Expects a Path object
    // Returns an array of Path objects
    calculateAllCollisions(path) {
        const start = path.piece.location;
        const collisions = [];

        // Check both horizontal directions
        // Hoirzontal doesn't check the turning point,
        // that will get checked by vertical
        // Doesn't check starting point
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

        // Mark bot's new x coord.
        const newXCoord = start.x + (path.horizontal);

        // Only check turning point if horizontal is not 0
        if (path.horizontal != 0) {
            if (this.board[newXCoord][start.y].id != 0) {
                const collisionPiece = this.board[newXCoord][start.y];
                collisions.push(collisionPiece);
            }
        }

        // Check both vertical directions
        // Vertical does check the starting point
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

    // Calculates which quadrant a point is in
    // Expects a Point object
    // Returns an integer
    calculateQuadrant(location) {
        let quadrant = 1;
        // Within left half of board
        if (location.x < 5) {
            // Within bottom left
            if (location.y > 4) {
                quadrant = 3;
            // Within top left
            } else {
                quadrant = 2;
            }
        // Within bottom right
        } else if (location.y > 4) {
            quadrant = 4;
        }
        return quadrant;
    }

    // Calculate whether piece needs to move horizontally or vertically to
    // get out of the way of a path
    // Expects 2 Point objects, a Path object, a Piece object, and an integer
    // Returns a boolean
    calculateIfMovementAxisHorizontal(from, to, path, location, quadrant) {
        // If piece is directly in line with main bot and not a corner,
        // it only has 1 available movement axis
        // All corners prioritize vertical axis
        if (location.x == from.x) {
            if (location.y == to.y) {
                return false;
            } else {
                return true;
            }
        } else if (location.y == from.y) {
            return false;
        // Use quadrant and y direction to determine whether bot should
        // move horizontally or vertically
        } else {
            let tempBool;
            // Top half of board (Higher = Closer to edge of board)
            if (quadrant < 3) {
                // Current piece is at or above main bot
                if (location.y <= from.y) {
                    tempBool = false;
                // Current piece is below main bot
                } else {
                    tempBool = true;
                }
            // Bottom half of board (Lower = Closer to edge of board)
            } else {
                // Current piece is at or below main bot
                if (location.y >= from.y) {
                    tempBool = false;
                // Current piece is above main bot
                } else {
                    tempBool = true;
                }
            }
            // If the y direction is first in the Path, simply flip the
            // result of the above checks
            if (!path.xFirst) {
                if (tempBool) {
                    tempBool = false;
                } else {
                    tempBool = true;
                }
            }
            return tempBool;
        }
    }

    // Determines where a piece needs to move depending on it's
    // position to the main bot and edge of board
    // Expects 2 Point objects, a Path object, and a ChessPiece object
    // Returns a Point object
    findShiftLocation(from, to, path, piece) {
        console.log('');
        const location = piece.location;
        console.log('Location: ' + location.x + ', ' + location.y);

        // Check whether there is a piece in "to" position
        // AKA: Whether the main bot is capturing a piece
        let capture = false;
        if (this.board[to.x][to.y].id != 0) {
            capture = true;
        }
        console.log('Capture: ' + capture);

        // The board is split into four 4x4 quadrants in each corner
        const quadrant = this.calculateQuadrant(piece.location);
        console.log('Quadrant: ' + quadrant);

        // Calculate whether the piece is moving
        // horizontally or vertically
        const isHorizontal = this.calculateIfMovementAxisHorizontal(from, to,
            path, location, quadrant);
        console.log('Horizontal: ' + isHorizontal);

        // Calculate which horizontal side of the board the piece is on
        let pieceIsOnLeft;
        // Piece is on the left side of the board
        if (1 < quadrant < 4) {
            pieceIsOnLeft = true;
        // Piece is on the right side of the board
        } else {
            pieceIsOnLeft = false;
        }
        console.log('Left: ' + pieceIsOnLeft);

        // Calculate which vertical side of the board the piece is on
        let pieceIsOnTop;
        // Piece is on the top side of the board
        if (quadrant < 3) {
            pieceIsOnTop = true;
        // Piece is on the bottom side of the board
        } else {
            pieceIsOnTop = false;
        }
        console.log('Top: ' + pieceIsOnTop);

        // HORIZONTAL
        // Piece is moving horizontally
        // Horizontal moves get an extra movement option
        // (Vertical doesn't to prevent double assignment in corners)
        // TODO: At corner on vertical, check if horizontal would
        // have moved into the way instead of assuming it would
        if (isHorizontal) {
            // Piece is to the right of the main bot
            if (location.x > from.x) {
                // Piece is on the left side of the board
                if (pieceIsOnLeft) {
                    // Main bot is capturing
                    if (capture) {
                        // Move one space to the left
                        return new Point(location.x-1, location.y);
                    // Main bot is not capturing
                    } else {
                        // First check if the spot to the right is empty
                        if (this.board[location.x+1][location.y].id == 0) {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        } else {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        }
                    }
                // Piece is on the right side of the board
                } else {
                    // Main bot is capturing
                    if (capture) {
                        // Piece is right next to padding (as well as capture)
                        if (location.x == 8) {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        // Piece is not right next to padding
                        } else {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        }
                    // Main bot is not capturing
                    } else {
                        // First check if the spot to the left is empty
                        if (this.board[location.x-1][location.y].id == 0) {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        } else {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        }
                    }
                }
            // Piece is to the left of the main bot
            } else if (location.x < from.x) {
                // Piece is on the left side of the board
                if (pieceIsOnLeft) {
                    // Main bot is capturing
                    if (capture) {
                        // Piece is right next to padding (as well as capture)
                        if (location.x == 1) {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        // Piece is not right next to padding
                        } else {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        }
                    // Main bot is not capturing
                    } else {
                        // First check if the spot to the right is empty
                        if (this.board[location.x+1][location.y].id == 0) {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        } else {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        }
                    }
                // Piece is on the right side of the board
                } else {
                    // Main bot is capturing
                    if (capture) {
                        // Move one space to the right
                        return new Point(location.x+1, location.y);
                    // Main bot is not capturing
                    } else {
                        // First check if the spot to the left is empty
                        if (this.board[location.x-1][location.y].id == 0) {
                            // Move one space to the left
                            return new Point(location.x-1, location.y);
                        } else {
                            // Move one space to the right
                            return new Point(location.x+1, location.y);
                        }
                    }
                }
            // Piece is in the same column as the main bot
            } else {
                if (pieceIsOnLeft) {
                    // Move one space to the left
                    return new Point(location.x-1, location.y);
                } else {
                    // Move one space to the right
                    return new Point(location.x+1, location.y);
                }
            }
        // VERTICAL
        // Piece is moving vertically
        } else {
            // Piece is below the main bot
            if (location.y > from.y) {
                // Piece is on the top side of the board
                if (pieceIsOnTop) {
                    // Piece is a corner
                    if (location.x == from.x) {
                        // Move one space down
                        return new Point(location.x, location.y+1);
                    // Piece is next to a corner
                    // (Needs to check the horizontal before the corner)
                    } else if (location.x == from.x+1 || location.x ==
                        from.x-1) {
                        // First check if the spot below is empty
                        if (this.board[location.x][location.y+1].id == 0) {
                            // Move one space down
                            return new Point(location.x, location.y+1);
                        } else {
                            // Piece is to the left of the main bot
                            if (location.x < from.x) {
                                // There is not a piece above the corner
                                if (this.board[location.x+1][location.y-1].id ==
                                0) {
                                    // Move one space up
                                    return new Point(location.x, location.y-1);
                                // There is a piece above the corner
                                } else {
                                    // Move one space down
                                    return new Point(location.x, location.y+1);
                                }
                            // Piece is to the right of the main bot
                            } else {
                                // There is not a piece above the corner
                                if (this.board[location.x+1][location.y-1].id ==
                                0) {
                                    // Move one space up
                                    return new Point(location.x, location.y-1);
                                // There is a piece above the corner
                                } else {
                                    // Move one space down
                                    return new Point(location.x, location.y+1);
                                }
                            }
                        }
                    // Piece is not near a corner
                    } else {
                        // First check if the spot below is empty
                        if (this.board[location.x][location.y+1].id == 0) {
                            // Move one space down
                            return new Point(location.x, location.y+1);
                        } else {
                            // Move one space up
                            return new Point(location.x, location.y-1);
                        }
                    }
                // Piece is on the bottom side of the board
                } else {
                    // Move one space down
                    return new Point(location.x, location.y+1);
                }
            // Piece is above the main bot
            } else if (location.y < from.y) {
                // Piece is on the top side of the board
                if (pieceIsOnTop) {
                    // Move one space up
                    return new Point(location.x, location.y-1);
                // Piece is on the bottom side of the board
                } else {
                    // Piece is a corner
                    if (location.x == from.x) {
                        // Move one space up
                        return new Point(location.x, location.y-1);
                    // Piece is next to a corner
                    // (Needs to check the horizontal before the corner)
                    } else if (location.x == from.x+1 || location.x ==
                        from.x-1) {
                        // First check if the spot above is empty
                        if (this.board[location.x][location.y-1].id == 0) {
                            // Move one space up
                            return new Point(location.x, location.y-1);
                        } else {
                            // Piece is to the left of the main bot
                            if (location.x < from.x) {
                                // There is not a piece above the corner
                                if (this.board[location.x+1][location.y+1].id ==
                                0) {
                                    // Move one space down
                                    return new Point(location.x, location.y+1);
                                // There is a piece above the corner
                                } else {
                                    // Move one space up
                                    return new Point(location.x, location.y-1);
                                }
                            // Piece is to the right of the main bot
                            } else {
                                // There is not a piece above the corner
                                if (this.board[location.x+1][location.y+1].id ==
                                0) {
                                    // Move one space down
                                    return new Point(location.x, location.y+1);
                                // There is a piece above the corner
                                } else {
                                    // Move one space up
                                    return new Point(location.x, location.y-1);
                                }
                            }
                        }
                    // Piece is not near a corner
                    } else {
                        // First check if the spot above is empty
                        if (this.board[location.x][location.y-1].id == 0) {
                            // Move one space up
                            return new Point(location.x, location.y-1);
                        } else {
                            // Move one space down
                            return new Point(location.x, location.y+1);
                        }
                    }
                }
            // Piece is in the same row as the main bot
            } else {
                // Piece is, or is next to, a corner
                // (Doesn't check the horizontal. Assumes worst case)
                if (to.x-1 <= location.x <= to.x+1) {
                    // Piece is below main bot's destination
                    if (location.y > to.y) {
                        // Move one space down
                        return new Point(location.x, location.y+1);
                    // Piece is above main bot's destination
                    } else {
                        // Move one space up
                        return new Point(location.x, location.y-1);
                    }
                // Piece is not near a corner
                } else {
                    if (pieceIsOnTop) {
                        // Move one space to the left
                        return new Point(location.x-1, location.y);
                    } else {
                        // Move one space to the right
                        return new Point(location.x+1, location.y);
                    }
                }
            }
        }
    }

    // Takes in a piece and finds a new path for every bot until an empty space
    // Paths are not prevented from intersecting. Requires extensive testing
    // Expects a Point object, a ChessPiece object, an array (filled with
    // arrays of Paths when recursing), and an integer
    // Doesn't return, but modifies the original array
    recursiveCalculateCollision(from, piece, collection, depth) {
        const newLocation = this.findShiftLocation(from, piece);
        const newPath = this.calculatePath(piece.location, newLocation);
        // If recursion depth is new high, expand collection length
        if (depth >= collection.length) {
            collection.push([]);
        }
        // Recursion depth is the same thing as phase. Add path to current depth
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

module.exports = {BotManager, Point, ChessPiece, Path};

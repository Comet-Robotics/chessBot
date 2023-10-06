
// eslint-disable-next-line no-unused-vars
const {BotManager, Point, ChessPiece, Path} = require('./include/BotManager');

// create copy of botManager
testBotManager = new BotManager();

// output current status of chess board
testBotManager.printBoard();

// set test case of board
testBotManager.board[1][1] = new ChessPiece(1, 'A', true, new Point(1, 1));
testBotManager.board[1][2] = new ChessPiece(2, 'B', true, new Point(1, 2));
testBotManager.board[1][3] = new ChessPiece(3, 'C', true, new Point(1, 3));
testBotManager.board[2][3] = new ChessPiece(4, 'D', true, new Point(2, 3));
testBotManager.board[2][4] = new ChessPiece(5, 'E', true, new Point(2, 4));
testBotManager.board[2][5] = new ChessPiece(6, 'F', true, new Point(2, 5));
testBotManager.board[3][3] = new ChessPiece(7, 'G', true, new Point(3, 3));

// output current status of chess board
testBotManager.printBoard();

const from = new Point(3, 3);
testPath = testBotManager.calculatePath(from, new Point(1, 1));
console.log(testPath);

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);
console.log(collisions);
console.log('=========================================');

const finalPaths = [];
for (let i = 0; i < collisions.length; i++) {
    const recursiveCollections = [];
    const currentCollision = collisions[i];
    testBotManager.recursiveCalculateCollision(from, currentCollision,
        recursiveCollections, 0);
    for (let i = 0; i < recursiveCollections.length; i++) {
        if (i >= finalPaths.length) {
            finalPaths.push([]);
        }
        finalPaths[i].push(recursiveCollections[i]);
    }
    console.log(finalPaths);
}

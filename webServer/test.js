
// eslint-disable-next-line no-unused-vars
const {BotManager, Point, ChessPiece, Path} = require('./include/BotManager');

// create copy of botManager
testBotManager = new BotManager();

// set test case of board
testBotManager.board[1][1] = new ChessPiece(0, 'A', true, new Point(1, 1));
testBotManager.board[1][3] = new ChessPiece(0, 'C', true, new Point(1, 3));
testBotManager.board[2][3] = new ChessPiece(0, 'D', true, new Point(2, 3));
testBotManager.board[3][3] = new ChessPiece(0, 'E', true, new Point(3, 3));
testBotManager.board[2][4] = new ChessPiece(0, 'F', true, new Point(2, 4));

// output current status of chess board
console.table(testBotManager.board);
from = new Point(3, 3);
testPath = testBotManager.calculatePath(from, new Point(1, 1));

console.log('Path:');
console.log(testPath);
console.log('\n');

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);
console.log(collisions);
console.log(collisions[0].location.x);
console.log('=========================================');

const finalPaths = [];
for (let i = 0; i < collisions.length; i++) {
    const recursiveCollections = [];
    const currentCollision = collisions[i];
    testBotManager.recursiveCalculateCollision(from, currentCollision,
        recursiveCollections, 1);
    for (let i = 0; i < recursiveCollections.length; i++) {
        finalPaths.push(recursiveCollections[i]);
    }
    console.log(finalPaths);
}

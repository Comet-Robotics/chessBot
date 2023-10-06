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
testBotManager.board[3][3] = new ChessPiece(5, 'E', true, new Point(3, 3));

// output current status of chess board
testBotManager.printBoard();

// TEST L PATTERN!
console.log('L PATTERN:');

testPath = testBotManager.calculatePath(new Point(3, 3), new Point(1, 1));

console.log('Path:');
console.log(testPath);
console.log('\n');

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);
console.log(collisions);
console.log('=========================================');

console.log('VERTICAL:');

testPath = testBotManager.calculatePath(new Point(1, 3), new Point(1, 1));

console.log('Path:');
console.log(testPath);
console.log('\n');

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);
console.log(collisions);
console.log('=========================================');

console.log('HORIZONTAL:');

testPath = testBotManager.calculatePath(new Point(3, 3), new Point(1, 3));

console.log('Path:');
console.log(testPath);
console.log('\n');

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);
console.log(collisions);
console.log('=========================================');

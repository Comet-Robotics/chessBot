
const {BotManager, Point, ChessPiece, Path} = require('./include/BotManager');

// create copy of botManager
testBotManager = new BotManager();

// output current status of chess board
console.table(testBotManager.board);

// set test case of board
testBotManager.board[1][1] = new ChessPiece(0, 'A', true, new Point(1, 1));
testBotManager.board[2][1] = new ChessPiece(0, 'B', true, new Point(1, 2));
testBotManager.board[3][1] = new ChessPiece(0, 'C', true, new Point(1, 3));
testBotManager.board[3][2] = new ChessPiece(0, 'D', true, new Point(2, 3));
testBotManager.board[3][3] = new ChessPiece(0, 'E', true, new Point(3, 3));

// output current status of chess board
console.table(testBotManager.board);

testPath = testBotManager.calculatePath(new Point(3, 3), new Point(1, 1));

console.log('Path:');
console.log(testPath);

console.log('Collisions:');
collisions = testBotManager.calculateAllCollisions(testPath);

console.log(collisions);

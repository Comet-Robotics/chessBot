var express = require('express');
var app = express();
const jsChessEngine = require('js-chess-engine');

const game = new jsChessEngine.Game();

app.get('/', function (req, res) {
   res.send('Hello World');
})

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
   chessGame();
})

function chessGame(){
  play(); 
}

function play () {
  const status = game.exportJson()
  if (status.isFinished) {
      console.log(`${status.turn} is in ${status.checkMate ? 'checkmate' : 'draw'}`)
  } else {
      console.time('Calculated in')
      const move = game.aiMove(status.turn === 'black' ? 0 : 2)
      console.log(`${status.turn.toUpperCase()} move ${JSON.stringify(move)}`)
      console.timeEnd('Calculated in')
      game.printToConsole()
      play()
  }
}
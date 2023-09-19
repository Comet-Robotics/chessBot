const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 

const Xbee = require('./include/Xbee.js')

//if true, you will be required to have an xbee plugged into your computer
var usingXBee = true;

//Since commits will overwrite the port, this will allow you to easily swap to the right one
//Make sure to use the same port on your computer every time if you add yours here
//To find your port name on Windows, open cmd and type 'mode' while you have an XBee plugged in
var masonPort = "/dev/tty.usbserial-D30DRP81";
var dylanPort = "COM5";

if (usingXBee) {
  serverXbee = new Xbee();
  serverXbee.configConnection(dylanPort);
}

const app = express();
const port = 3000;

const jsChessEngine = require('js-chess-engine');
const { move, status, moves, aiMove } = jsChessEngine
game = new jsChessEngine.Game();

chessStatus = game.exportJson();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join('../chess-bot-client/build')));


app.listen(port, () => {
   console.log("ChessBot server online!");
})

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../', 'index.html'));
});

app.post('/move/:from/:to', (req,res) => {
  const fromRequest = req.params.from
  const toRequest = req.params.to
  console.log(fromRequest, toRequest);

  try {
    const moveResponse = game.move(fromRequest, toRequest);
    chessStatus = game.exportJson()
    console.log("move response: " + moveResponse);
    res.send(chessStatus);
  }
  catch (error){
    console.log(error);
    res.status(404).json({error: "move error"})
  }

  game.printToConsole();
  moveTest();
})

app.get('/status', (req, res) => {
  console.log('Status Sent!');
  res.send(chessStatus);
})

app.post('/aimove/:level', (req, res) => {
  const levelRequest = req.params.level;
  
  try {
    const aiMoveResponse = game.aiMove(levelRequest);
    chessStatus = game.exportJson()
    console.log("AI move response: " + aiMoveResponse);
    res.send(chessStatus)
  }
  catch (error) {
    console.log(error);
    res.status(404).json({error: "ai move error"})
  }
  game.printToConsole();
})

app.post('/resetGame', (req, res) => {
  game = new jsChessEngine.Game();
  chessStatus = game.exportJson();
  game.printToConsole();
  res.send(chessStatus)
})

app.get('/moves/:piece', (req, res) => {
  const piece = req.params.piece;
  console.log('Status Sent!');
  console.log(piece)
  res.send(game.moves(piece));
})

function moveTest()
{
    msg = "200,w;"
    if (usingXBee) {
      serverXbee.sendMessage(msg)
    } else {
      console.log("Sent Command: ", msg);
    }
}


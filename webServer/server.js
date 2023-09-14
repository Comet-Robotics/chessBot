const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 

//setting up imports for the xbee serial connection
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;

//if true, you will be required to have an xbee plugged into your computer
var usingXBee = false;

if (usingXBee) {
    //this creates a new xbeeAPI object
    var xbeeAPI = new xbee_api.XBeeAPI(
        {
            api_mode: 1
        }
    );

    //sets up the USB serial port and baud rate
    var serialport = new SerialPort(
        {
            path: "COM4",
            baudRate: 9600,
        });

    //creates the pipes between serial port and the xbeeAPI
    serialport.pipe(xbeeAPI.parser);
    xbeeAPI.builder.pipe(serialport);

    //supposed to receive data, but i don't think it works 
    xbeeAPI.parser.on("data", function (frame) {
        console.log(">>", frame);
    });

    //open the serial port
    serialport.on("open", function () { });
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
  var frame_obj = { //the frame_obj is the data to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "200,w;",
    commandParameter: [],
    };
    if (usingXBee) {
        //send the data thru the xbee pipe
        xbeeAPI.builder.write(frame_obj);
    } else {
        console.log("Sent Command: ", frame_obj.command);
    }
}
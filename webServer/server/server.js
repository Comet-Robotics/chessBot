const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const jsChessEngine = require('js-chess-engine');
const game = new jsChessEngine.Game();

chessStatus = game.exportJson();


app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(chessStatus);
})

app.listen(port, () => {
   console.log("Example app listening at http://%s:%s");
})

app.post('/move/:from/:to', (req,res) => {
  const fromRequest = req.params.from
  const toRequest = req.params.to
  console.log(fromRequest, toRequest);

  try {
    const moveResponse = game.move(fromRequest, toRequest);
    res.send({message: moveResponse});

  }
  catch (error){
    console.log(error);
    res.status(404).json({error: error})
  }

  chessStatus = game.exportJson()
})

app.post('/status', (req, res) => {
  console.log('hi');
  res.send(chessStatus);
})








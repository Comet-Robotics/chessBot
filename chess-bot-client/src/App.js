import { Chessboard } from "react-chessboard";
import './App.css';

function App() {
  return (
    <div className="App">
        <div class="flex">
          <div class="flexChild">
          <Chessboard id="reactBoard" />
          </div>
          <div class="flexChild">
              <h1>ChessBot Control </h1>
          </div>
        </div>
    </div>
  );
}

export default App;

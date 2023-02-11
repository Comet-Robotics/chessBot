import logo from './logo.svg';
import { Chessboard } from "react-chessboard";
import './App.css';

function App() {
  return (
    <div className="App">
        <div>
          <Chessboard id="reactBoard" />
        </div>
    </div>
  );
}

export default App;

import { useCallback } from "react";
import "./App.css";

import { ChessboardWrapper } from "./ChessboardWrapper";
import { post } from "./api";

export function App() {
  const onClick = useCallback(async () => {
    const response = await post("move", {
      "start": "a1",
      "end": "a2"
    });
    console.log(response);
  }, []);

  return (
    <div className="app">
      <ChessboardWrapper position={"ahh"} />
      <button
        type="button"
        onClick={onClick}
      >Hello World</button>
    </div>
  );
}
import { FocusStyleManager } from "@blueprintjs/core";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Body } from "./body";
import { Debug } from "./pages/debug";

export function App(): JSX.Element {
  FocusStyleManager.onlyShowFocusOnTabs();
  return (

    <div id="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Body />} />
          <Route path="/debug" element={<Debug />} />
        </Routes>
      </Router>
    </div>
  );
}

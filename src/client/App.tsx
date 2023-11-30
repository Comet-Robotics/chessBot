import { FocusStyleManager } from "@blueprintjs/core";
import { Body } from "./body";

export function App(): JSX.Element {
  FocusStyleManager.onlyShowFocusOnTabs();
  return (
    <div className="app-container">
      <Body />
    </div>
  );
}
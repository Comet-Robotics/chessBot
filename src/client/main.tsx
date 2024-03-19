import ReactDOM from "react-dom/client";

import "./index.scss";

import { FocusStyleManager, BlueprintProvider } from "@blueprintjs/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { StrictMode } from "react";

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <div id="app-container">
            <BlueprintProvider>
                <RouterProvider router={router} />
            </BlueprintProvider>
        </div>
    </StrictMode>,
);

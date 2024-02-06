import React from "react";
import ReactDOM from "react-dom/client";

import "./index.scss";

import { FocusStyleManager } from "@blueprintjs/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <div id="app-container">
            <RouterProvider router={router} />
        </div>
    </React.StrictMode>,
);

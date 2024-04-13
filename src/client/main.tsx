import ReactDOM from "react-dom/client";

import "./index.scss";

import { FocusStyleManager, BlueprintProvider } from "@blueprintjs/core";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";

export const queryClient = new QueryClient();

FocusStyleManager.onlyShowFocusOnTabs();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <div id="app-container">
            <BlueprintProvider>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router} />
                </QueryClientProvider>
            </BlueprintProvider>
        </div>
    </StrictMode>,
);

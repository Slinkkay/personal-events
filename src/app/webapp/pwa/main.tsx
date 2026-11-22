import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(getElementByIdOrThrow("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

function getElementByIdOrThrow(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Root element with id '${id}' not found`);
    return el;
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .catch((err) => console.error("Service worker registration failed", err));
    });
}

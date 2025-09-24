import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";      // keep for a tiny reset (see below)
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

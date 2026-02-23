import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";
import { AuthContextProvider } from "./context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = storedTheme || (prefersDark ? "dark" : "light");

if (theme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <>
          <App />
          <SpeedInsights />
        </>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

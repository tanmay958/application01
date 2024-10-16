import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";
import Navbar from "./components/Navbar.jsx";
import WidgetDatabase from "./components/WidgetDatabase.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Navbar />
    <WidgetDatabase />
  </StrictMode>
);

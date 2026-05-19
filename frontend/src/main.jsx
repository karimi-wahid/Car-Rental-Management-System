import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DirectionProvider } from "./components/ui/direction";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DirectionProvider>
      <App />
    </DirectionProvider>
  </StrictMode>,
);

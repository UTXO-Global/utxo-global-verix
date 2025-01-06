import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import CCCProvider from "@/providers/ccc-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CCCProvider>
      <App />
    </CCCProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import CCCProvider from "@/providers/ccc-provider.tsx";
import { AppProvider } from "@/providers/app-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CCCProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </CCCProvider>
  </StrictMode>
);

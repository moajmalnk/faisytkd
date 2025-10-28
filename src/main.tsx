import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeIOSFixes } from "./lib/ios-utils.ts";

// Initialize iOS-specific fixes before rendering
initializeIOSFixes();

createRoot(document.getElementById("root")!).render(<App />);

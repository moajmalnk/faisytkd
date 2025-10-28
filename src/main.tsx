import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeIOSFixes } from "./lib/ios-utils.ts";

// Initialize iOS-specific fixes before rendering (with error handling)
try {
  initializeIOSFixes();
} catch (error) {
  console.error('Failed to initialize iOS fixes:', error);
  // Continue anyway - don't block app from loading
}

// Ensure root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);

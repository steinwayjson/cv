import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { initAnalytics } from "./lib/analytics";

initAnalytics();

const root = document.getElementById("root")!;

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (root.children.length > 0) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.classList.add("hidden");
      setTimeout(() => loader.remove(), 200);
    }
    root.style.transition = "opacity 0.25s ease";
    root.style.opacity = "1";
  });
});
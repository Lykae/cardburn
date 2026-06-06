import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

async function setup() {
  await Capacitor.isNativePlatform();

  await StatusBar.setOverlaysWebView({ overlay: true });
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.hide();
}

setup();

createRoot(document.getElementById("root")!).render(<App />);

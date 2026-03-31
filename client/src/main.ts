import "./style.css";

import { CanvasEditor } from "./CanvasEditor";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) throw new Error("Falta un contenedor principal para el canvas");

new CanvasEditor(app, {
  showGrid: false,
});

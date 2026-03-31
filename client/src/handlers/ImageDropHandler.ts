import type { CanvasEditor } from "../CanvasEditor";
import { importImage } from "../store/actions";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";
import type { CanvasHandler } from "./CanvasHandler";

export class ImageDropHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;

    canvasEditor.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    });

    canvasEditor.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      this.handleDrop(e);
    });
  }

  private async handleDrop(e: DragEvent) {
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      const rect = this.canvasEditor.canvas.getBoundingClientRect();
      const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
      const worldPoint = canvasToWorld(pos, this.canvasEditor.state.transform);
      await importImage(worldPoint, file);
    }
  }
}

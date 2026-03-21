import type { CanvasEditor } from "../CanvasEditor";
import type { CanvasHandler } from "./CanvasHandler";

export class DragHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;
  pointers: Set<number> = new Set();
  isDragging = false;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;

    canvasEditor.canvas.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this),
    );
    canvasEditor.canvas.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this),
    );
    window.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  private onPointerDown(e: PointerEvent) {
    this.pointers.add(e.pointerId);
    this.isDragging = this.pointers.size === 1;
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    const deltaX = e.movementX;
    const deltaY = e.movementY;
    this.canvasEditor.state.x -= deltaX;
    this.canvasEditor.state.y -= deltaY;
  }

  private onPointerUp(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size === 0) {
      this.isDragging = false;
    }
  }
}

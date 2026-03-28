import { Action, Tool } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import { findBeadIndexAt, getBeadCellAt, getLoom } from "../utils/loomUtils";
import type { CanvasEditor } from "../CanvasEditor";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";

export class EraseBeadHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;

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
    if (this.canvasEditor.state.action !== Action.NONE) return;
    if (this.canvasEditor.state.activeTool !== Tool.ERASE) return;
    this.canvasEditor.state.action = Action.ERASE;
    this.eraseBeadEvent(e);
  }

  private onPointerMove(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.ERASE) return;
    if (this.canvasEditor.state.activeTool !== Tool.ERASE) return;
    this.eraseBeadEvent(e);
  }

  private onPointerUp() {
    if (this.canvasEditor.state.action !== Action.ERASE) return;
    this.canvasEditor.state.action = Action.NONE;
  }

  private eraseBeadEvent(e: PointerEvent) {
    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state.transform);
    const loom = getLoom(this.canvasEditor.document.elements);
    if (!loom) return;
    const hit = getBeadCellAt(worldPoint, loom);
    if (!hit) return;

    const beadIndex = findBeadIndexAt(this.canvasEditor.document.elements, {
      x: hit.beadX,
      y: hit.beadY,
    });

    if (beadIndex === -1) return;
    this.canvasEditor.document.elements.splice(beadIndex, 1);
  }
}

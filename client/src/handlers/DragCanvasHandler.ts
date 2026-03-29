import type { CanvasHandler } from "./CanvasHandler";
import type { CanvasEditor } from "../CanvasEditor";
import { Action, Tool } from "../types";

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
    if (
      (this.canvasEditor.state.activeTool !== Tool.MOVE && !e.ctrlKey) ||
      this.canvasEditor.state.action !== Action.NONE
    )
      return;
    this.pointers.add(e.pointerId);

    if (this.pointers.size === 1) {
      this.isDragging = true;
      if (this.canvasEditor.state.activeTool !== Tool.MOVE) {
        this.canvasEditor.state.action = Action.MOVE;
      }
    } else {
      this.isDragging = false;
      this.canvasEditor.state.action = Action.NONE;
    }
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    if (
      this.canvasEditor.state.action !== Action.NONE &&
      this.canvasEditor.state.action !== Action.MOVE
    )
      return;
    this.canvasEditor.state.action = Action.MOVE;

    let deltaX = e.movementX;
    let deltaY = e.movementY;

    const dpr = window.devicePixelRatio || 1;

    if (dpr !== 1 && e.pointerType !== "touch") {
      deltaX = deltaX / dpr;
      deltaY = deltaY / dpr;
    }

    this.canvasEditor.state.transform.x -= deltaX;
    this.canvasEditor.state.transform.y -= deltaY;
  }

  private onPointerUp(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    if (this.canvasEditor.state.action !== Action.MOVE) return;
    this.canvasEditor.state.action = Action.NONE;
    if (this.pointers.size === 0) {
      this.isDragging = false;
    }
  }
}

import { Action, Tool, type Vec2 } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import { LoomElement } from "../LoomElement";
import { BeadElement } from "../BeadElement";
import type { CanvasEditor } from "../CanvasEditor";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";

export class DrawBeadHandler implements CanvasHandler {
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
    if (this.canvasEditor.state.activeTool !== Tool.DRAW) return;
    this.canvasEditor.state.action = Action.DRAW;
    this.drawBeadEvent(e);
  }

  private onPointerMove(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.DRAW) return;
    if (this.canvasEditor.state.activeTool !== Tool.DRAW) return;
    this.drawBeadEvent(e);
  }

  private onPointerUp() {
    if (this.canvasEditor.state.action !== Action.DRAW) return;
    this.canvasEditor.state.action = Action.NONE;
  }

  private drawBeadEvent(e: PointerEvent) {
    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state);
    const hit = this.getBeadCellAt(worldPoint);
    if (!hit) return;

    const beadIndex = this.findBeadIndexAt(hit.beadX, hit.beadY);

    if (beadIndex !== -1) {
      (this.canvasEditor.elements[beadIndex] as BeadElement).color =
        this.canvasEditor.state.activeBead;
      return;
    }

    this.canvasEditor.elements.push(
      new BeadElement({
        x: hit.beadX,
        y: hit.beadY,
        color: this.canvasEditor.state.activeBead,
      }),
    );
  }

  private getBeadCellAt(point: Vec2) {
    const loom = this.canvasEditor.elements.find(
      (element): element is LoomElement => element instanceof LoomElement,
    );

    if (!loom) return null;

    const columnSpacing = loom.BEAD_WIDTH + loom.SPACING;
    const rowSpacing = loom.BEAD_HEIGHT + loom.SPACING;
    const originX = loom.x + loom.FRAME_WIDTH + 1;
    const originY = loom.y + loom.SPACING;
    const maxX = originX + loom.columns * columnSpacing - loom.SPACING;
    const maxY = originY + loom.rows * rowSpacing - loom.SPACING;

    if (
      point.x < originX ||
      point.y < originY ||
      point.x > maxX ||
      point.y > maxY
    ) {
      return null;
    }

    const col = Math.floor((point.x - originX) / columnSpacing);
    const row = Math.floor((point.y - originY) / rowSpacing);

    if (col < 0 || row < 0 || col >= loom.columns || row >= loom.rows) {
      return null;
    }

    const beadX = originX + col * columnSpacing;
    const beadY = originY + row * rowSpacing;
    return { beadX, beadY };
  }

  private findBeadIndexAt(x: number, y: number) {
    return this.canvasEditor.elements.findIndex(
      (element) =>
        element instanceof BeadElement && element.x === x && element.y === y,
    );
  }
}

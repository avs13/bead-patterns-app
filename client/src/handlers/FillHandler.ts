import { Action, Tool } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import { BeadElement } from "../BeadElement";
import type { CanvasEditor } from "../CanvasEditor";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";
import {
  cellToWorld,
  findBeadAt,
  getBeadCellAt,
  getLoom,
} from "../utils/loomUtils";

export class FillHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    canvasEditor.canvas.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this),
    );
  }

  private onPointerDown(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.NONE) return;
    if (this.canvasEditor.state.activeTool !== Tool.FILL) return;
    this.canvasEditor.state.action = Action.FILL;
    this.fillFromEvent(e);
    this.canvasEditor.state.action = Action.NONE;
  }

  private fillFromEvent(e: PointerEvent) {
    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state);
    const loom = getLoom(this.canvasEditor.elements);
    if (!loom) return;
    const hit = getBeadCellAt(worldPoint, loom);
    if (!hit) return;

    const startPos = cellToWorld(loom, hit.col, hit.row);
    const startBead = findBeadAt(this.canvasEditor.elements, startPos);
    const replacement = this.canvasEditor.state.activeBead;

    const isEmptyFill = !startBead;
    const targetColor = startBead?.color ?? null;
    if (!isEmptyFill && targetColor === replacement) return;

    // Algoritmo de flood fill
    const visited = new Set<string>();

    const queue: Array<{ col: number; row: number }> = [
      { col: hit.col, row: hit.row },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      const key = `${current.col}:${current.row}`;
      if (visited.has(key)) continue;
      visited.add(key);
      if (
        current.col < 0 ||
        current.row < 0 ||
        current.col >= loom.columns ||
        current.row >= loom.rows
      ) {
        continue;
      }

      const pos = cellToWorld(loom, current.col, current.row);
      const bead = findBeadAt(this.canvasEditor.elements, pos);
      if (isEmptyFill) {
        if (bead) continue;
        this.canvasEditor.elements.push(
          new BeadElement({
            x: pos.x,
            y: pos.y,
            color: replacement,
          }),
        );
      } else {
        if (!bead || bead.color !== targetColor) continue;
        bead.color = replacement;
      }

      queue.push(
        { col: current.col + 1, row: current.row },
        { col: current.col - 1, row: current.row },
        { col: current.col, row: current.row + 1 },
        { col: current.col, row: current.row - 1 },
      );
    }
  }
}

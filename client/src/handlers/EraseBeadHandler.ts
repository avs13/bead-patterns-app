import { Action, Tool, HistoryAction, type BeadDrawDelta } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import { findBeadIndexAt, getBeadCellAt, getLoom } from "../utils/loomUtils";
import type { CanvasEditor } from "../CanvasEditor";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";
import { historyPush } from "../store/actions";
import type { BeadElement } from "../elements/BeadElement";

export class EraseBeadHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    canvasEditor.canvas.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this)
    );
    canvasEditor.canvas.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this)
    );
    window.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  private currentStroke: BeadDrawDelta[] = [];

  private onPointerDown(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.NONE) return;
    if (this.canvasEditor.state.activeTool !== Tool.ERASE) return;
    this.canvasEditor.state.action = Action.ERASE;
    this.currentStroke = [];
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
    if (this.currentStroke.length > 0) {
      historyPush({
        action: HistoryAction.DRAW,
        state: this.currentStroke,
      });
      this.currentStroke = [];
    }
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

    const bead = this.canvasEditor.document.elements[beadIndex] as BeadElement;

    const existingDelta = this.currentStroke.find(
      (d) => d.x === hit.beadX && d.y === hit.beadY
    );

    if (!existingDelta) {
      this.currentStroke.push({
        x: hit.beadX,
        y: hit.beadY,
        prevColor: bead.color,
        newColor: null,
      });
    }

    this.canvasEditor.document.elements.splice(beadIndex, 1);
  }
}

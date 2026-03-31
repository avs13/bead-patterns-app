import { Action, Tool, HistoryAction, type BeadDrawDelta } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import { historyPush } from "../store/actions";
import { BeadElement } from "../elements/BeadElement";
import { findBeadIndexAt, getBeadCellAt, getLoom } from "../utils/loomUtils";
import type { CanvasEditor } from "../CanvasEditor";
import { canvasToWorld, screenToCanvas } from "../utils/transformUtils";

export class DrawBeadHandler implements CanvasHandler {
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

  private beadDrawBuffer: BeadDrawDelta[] = [];

  private onPointerDown(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.NONE) return;
    if (this.canvasEditor.state.activeTool !== Tool.DRAW) return;
    this.canvasEditor.state.action = Action.DRAW;
    this.beadDrawBuffer = [];
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
    if (this.beadDrawBuffer.length > 0) {
      historyPush({
        action: HistoryAction.DRAW,
        state: this.beadDrawBuffer,
      });
      this.beadDrawBuffer = [];
    }
  }

  private drawBeadEvent(e: PointerEvent) {
    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state.transform);
    
    const loom = getLoom(this.canvasEditor.document.elements);
    if (!loom) return;
    
    const hit = getBeadCellAt(worldPoint, loom);
    if (!hit) return;

    if (this.beadDrawBuffer.some(d => d.x === hit.beadX && d.y === hit.beadY)) return;

    const activeColor = this.canvasEditor.state.activeBead;
    const elements = this.canvasEditor.document.elements;
    const beadIndex = findBeadIndexAt(elements, { x: hit.beadX, y: hit.beadY });

    if (beadIndex !== -1) {
      const bead = elements[beadIndex] as BeadElement;
      if (bead.color === activeColor) return;

      this.beadDrawBuffer.push({
        x: hit.beadX,
        y: hit.beadY,
        prevColor: bead.color,
        newColor: activeColor,
      });
      bead.color = activeColor;
      return;
    }

    this.beadDrawBuffer.push({
      x: hit.beadX,
      y: hit.beadY,
      prevColor: null,
      newColor: activeColor,
    });

    elements.push(new BeadElement({ x: hit.beadX, y: hit.beadY, color: activeColor }));
  }
}

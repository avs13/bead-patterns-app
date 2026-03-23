import type { CanvasEditor } from "../CanvasEditor";
import type { CanvasState } from "../types";

interface Vec2 {
  x: number;
  y: number;
}

export class wheelZoomHandler {
  readonly ZOOM_DELTA = 1.15;
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    canvasEditor.canvas.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = this.toLocalPoint(e, rect);
    const anchor = this.screenToWorld(pos);

    this.canvasEditor.state.zoom *=
      e.deltaY < 0 ? this.ZOOM_DELTA : 1 / this.ZOOM_DELTA;

    const nextTranslation = this.translationForAnchor(
      anchor,
      pos,
      this.canvasEditor.state,
    );

    this.canvasEditor.state.x = nextTranslation.x;
    this.canvasEditor.state.y = nextTranslation.y;
  }

  private screenToWorld(
    point: Vec2,
    state: CanvasState = this.canvasEditor.state,
  ) {
    const local = this.rotatePoint(
      { x: point.x + state.x, y: point.y + state.y },
      -state.rotation,
    );
    return {
      x: local.x / state.zoom,
      y: local.y / state.zoom,
    };
  }

  private translationForAnchor(
    worldPoint: Vec2,
    screenPoint: Vec2,
    state: CanvasState,
  ) {
    const local = this.rotatePoint(
      { x: worldPoint.x * state.zoom, y: worldPoint.y * state.zoom },
      state.rotation,
    );
    return {
      x: local.x - screenPoint.x,
      y: local.y - screenPoint.y,
    };
  }

  private rotatePoint(point: Vec2, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos,
    };
  }

  private toLocalPoint(touch: WheelEvent, rect: DOMRect) {
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }
}

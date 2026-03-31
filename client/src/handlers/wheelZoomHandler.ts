import type { CanvasEditor } from "../CanvasEditor";
import {
  canvasToWorld,
  screenToCanvas,
  translationForAnchor,
} from "../utils/transformUtils";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_DELTA } from "../types";

export class wheelZoomHandler {
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
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const anchor = canvasToWorld(pos, this.canvasEditor.state.transform);

    const nextZoom =
      this.canvasEditor.state.transform.zoom *
      (e.deltaY < 0 ? ZOOM_DELTA : 1 / ZOOM_DELTA);
    this.canvasEditor.state.transform.zoom = Math.max(
      MIN_ZOOM,
      Math.min(nextZoom, MAX_ZOOM)
    );
    const nextTranslation = translationForAnchor(
      anchor,
      pos,
      this.canvasEditor.state.transform
    );

    this.canvasEditor.state.transform.x = nextTranslation.x;
    this.canvasEditor.state.transform.y = nextTranslation.y;
  }
}

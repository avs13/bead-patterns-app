import type { CanvasEditor } from "../CanvasEditor";
import {
  canvasToWorld,
  screenToCanvas,
  translationForAnchor,
} from "../utils/transformUtils";

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
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const anchor = canvasToWorld(pos, this.canvasEditor.state.transform);

    this.canvasEditor.state.transform.zoom *=
      e.deltaY < 0 ? this.ZOOM_DELTA : 1 / this.ZOOM_DELTA;

    const nextTranslation = translationForAnchor(
      anchor,
      pos,
      this.canvasEditor.state.transform,
    );

    this.canvasEditor.state.transform.x = nextTranslation.x;
    this.canvasEditor.state.transform.y = nextTranslation.y;
  }
}

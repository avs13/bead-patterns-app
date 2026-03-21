import type { CanvasEditor } from "../CanvasEditor";

export interface CanvasHandler {
  canvasEditor: CanvasEditor;
}

export type CanvasHandlerConstructor = new (
  canvasEditor: CanvasEditor,
) => CanvasHandler;

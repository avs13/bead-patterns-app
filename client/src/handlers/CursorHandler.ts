import type { CanvasHandler } from "./CanvasHandler";
import type { CanvasEditor } from "../CanvasEditor";
import { Action, Tool } from "../types";
import { effect } from "../libs/stateManager";

export class CursorHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;
  isCtrlPressed = false;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;

    effect(() => {
      const activeTool = this.canvasEditor.state.activeTool;
      const action = this.canvasEditor.state.action;
      this.updateCursor(activeTool, action);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Control" && !this.isCtrlPressed) {
        this.isCtrlPressed = true;
        this.updateCursor(
          this.canvasEditor.state.activeTool,
          this.canvasEditor.state.action
        );
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Control" && this.isCtrlPressed) {
        this.isCtrlPressed = false;
        this.updateCursor(
          this.canvasEditor.state.activeTool,
          this.canvasEditor.state.action
        );
      }
    });
  }

  private updateCursor(activeTool: Tool, action: Action) {
    const canvas = this.canvasEditor.canvas;

    if (action === Action.MOVE) {
      canvas.style.cursor = "grabbing";
      return;
    }

    if (activeTool === Tool.MOVE || this.isCtrlPressed) {
      canvas.style.cursor = "grab";
      return;
    }

    if (activeTool === Tool.DRAW || activeTool === Tool.FILL) {
      canvas.style.cursor = "crosshair";
      return;
    }

    if (activeTool === Tool.ERASE) {
      canvas.style.cursor = "cell";
      return;
    }

    canvas.style.cursor = "default";
  }
}

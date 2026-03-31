import type { CanvasHandler } from "./CanvasHandler";
import type { CanvasEditor } from "../CanvasEditor";
import { Action, Tool } from "../types";
import { historyRedo, historyUndo } from "../store/actions";

export class ShortcutsHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;

  readonly shortcuts = [
    {
      key: "d",
      action: () => (this.canvasEditor.state.activeTool = Tool.DRAW),
    },
    {
      key: "m",
      action: () => (this.canvasEditor.state.activeTool = Tool.MOVE),
    },
    {
      key: "s",
      action: () => (this.canvasEditor.state.activeTool = Tool.SELECT),
    },
    {
      key: "b",
      action: () => (this.canvasEditor.state.activeTool = Tool.ERASE),
    },
    {
      key: "r",
      action: () => (this.canvasEditor.state.activeTool = Tool.FILL),
    },
    {
      key: "ctrl+z",
      action: () => historyUndo(),
    },
    {
      key: "ctrl+shift+z|ctrl+y",
      action: () => historyRedo(),
    },
  ];

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;

    window.addEventListener("keydown", this.onKeydown.bind(this));
  }

  onKeydown(e: KeyboardEvent) {
    if (this.canvasEditor.state.action !== Action.NONE) return;

    const pressedShortcut = this.getShortcut(e);
    const matchedShortcut = this.shortcuts.find((shortcut) =>
      shortcut.key
        .toLocaleLowerCase()
        .split("|")
        .some((key) => key === pressedShortcut)
    );

    if (matchedShortcut) {
      e.preventDefault();
      matchedShortcut.action();
    }
  }

  getShortcut(e: KeyboardEvent) {
    const key = e.key.toLocaleLowerCase();
    if (e.shiftKey && e.ctrlKey) {
      return `ctrl+shift+${key}`;
    }
    if (e.shiftKey) {
      return `shift+${key}`;
    }
    if (e.ctrlKey) {
      return `ctrl+${key}`;
    }
    return key;
  }
}

import { set } from "../libs/stateManager";
import { proxy } from "../libs/stateManager";
import { Action, Tool, type CanvasState, type DocumentState } from "../types";

export const editorStore = proxy<CanvasState>({
  transform: { x: 0, y: 0, zoom: 1, rotation: 0 },
  activeTool: Tool.DRAW,
  action: Action.NONE,
  activeBead: "#3b82f6",
});

export const documentStore = proxy<DocumentState>({
  id: "",
  name: "",
  beadPalette: [],
  elements: set([]),
});

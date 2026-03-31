import { set } from "../libs/stateManager";
import { proxy } from "../libs/stateManager";
import {
  Action,
  Tool,
  type CanvasState,
  type DocumentState,
  type FilesState,
  type HistoryState,
} from "../types";

export const editorStore = proxy<CanvasState>({
  transform: { x: 0, y: 0, zoom: 1, rotation: 0 },
  activeTool: Tool.DRAW,
  action: Action.NONE,
  activeBead: "",
});

export const documentStore = proxy<DocumentState>({
  id: "",
  name: "",
  beadPalette: [],
  elements: set([]),
});

export const uiStore = proxy({
  isSidebarOpen: false,
});

export const filesStore = proxy<FilesState>({
  files: [],
});

export const historyStore = proxy<HistoryState>({
  undoStack: [],
  redoStack: [],
});

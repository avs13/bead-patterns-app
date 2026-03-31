import type { FileMeta } from "./storage/fileStorage";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const ZOOM_DELTA = 1.15;

export interface CanvasState {
  transform: {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
  };
  activeTool: Tool;
  action: Action;
  activeBead: string;
}

export interface DocumentState {
  id: string;
  name: string;
  beadPalette: string[];
  elements: CanvasElement[];
}

export interface FilesState {
  files: FileMeta[];
}

export type Vec2 = {
  x: number;
  y: number;
};

export interface CanvasEditorOptions {
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
}

export interface CanvasElement {
  draw(ctx: CanvasRenderingContext2D): void;
}

export enum Tool {
  MOVE = "move",
  SELECT = "select",
  DRAW = "draw",
  ERASE = "erase",
  FILL = "fill",
}

export enum Action {
  NONE,
  MOVE,
  PINCH,
  DRAW,
  ERASE,
  FILL,
}

export enum HistoryAction {
  DRAW,
  PALETTE_COLOR_CHANGE,
  PALETTE_COLOR_REMOVE,
}

export interface HistoryState {
  undoStack: History[];
  redoStack: History[];
}

export interface BeadDrawDelta {
  x: number;
  y: number;
  prevColor: string | null;
  newColor: string | null;
}

export interface DrawHistory {
  action: HistoryAction.DRAW;
  state: BeadDrawDelta[];
}

export interface PaletteColorChangeHistory {
  action: HistoryAction.PALETTE_COLOR_CHANGE;
  state: {
    oldColor: string;
    newColor: string;
    paletteIndex: number;
    beadDeltas: BeadDrawDelta[];
  };
}

export interface PaletteColorRemoveHistory {
  action: HistoryAction.PALETTE_COLOR_REMOVE;
  state: {
    color: string;
    paletteIndex: number;
    beadDeltas: BeadDrawDelta[];
  };
}

export type History =
  | DrawHistory
  | PaletteColorChangeHistory
  | PaletteColorRemoveHistory;

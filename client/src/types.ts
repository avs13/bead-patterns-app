import type { FileMeta } from "./storage/fileStorage";

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

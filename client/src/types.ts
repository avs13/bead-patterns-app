export interface CanvasState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  activeTool: Tool;
  action: Action;
  beadPalette: string[];
  activeBead: string;
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
}

export interface CanvasState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
  activeTool: Tool;
  action: Action;
}

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

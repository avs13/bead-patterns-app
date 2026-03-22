export interface CanvasState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface CanvasEditorOptions {
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
}

export interface CanvasElement {
  draw(ctx: CanvasRenderingContext2D): void;
}

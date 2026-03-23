import { DragHandler } from "./handlers/DragCanvasHandler";
import { PinchTransformHandler } from "./handlers/PinchTransformHandler";
import { wheelZoomHandler } from "./handlers/wheelZoomHandler";
import {
  Action,
  Tool,
  type CanvasEditorOptions,
  type CanvasElement,
  type CanvasState,
} from "./types";
import { ToolsComponent } from "./ToolsComponent";
import type {
  CanvasHandler,
  CanvasHandlerConstructor,
} from "./handlers/CanvasHandler";
import { LoomElement } from "./LoomElement";
import { DrawBeadHandler } from "./handlers/DrawBeadHandler";
import { EraseBeadHandler } from "./handlers/EraseBeadHandler";
import { FillHandler } from "./handlers/FillHandler";

export class CanvasEditor {
  #root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  #options: Required<CanvasEditorOptions>;
  #dpr = window.devicePixelRatio || 1;
  #width = 0;
  #height = 0;

  state: CanvasState = {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
    activeTool: Tool.MOVE,
    action: Action.NONE,
    beadPalette: [
      "#3b82f6",
      "#0ea5e9",
      "#ef4444",
      "#f97316",
      "#a855f7",
      "#f59e0b",
      "#22c55e",
    ],
    activeBead: "#3b82f6",
  };

  handlers: CanvasHandler[] = [];
  elements: CanvasElement[] = [];

  constructor(root: HTMLElement, options: CanvasEditorOptions = {}) {
    if (!root) throw new Error("El elemento root HTML no existe");
    this.#root = root;
    this.#root.innerHTML = "";
    this.canvas = document.createElement("canvas");
    this.#root.append(this.canvas);

    const toolsComponent = new ToolsComponent();
    toolsComponent.activeTool = this.state.activeTool;

    this.#root.append(toolsComponent);

    toolsComponent.addEventListener("toolchange", (event) => {
      const detail = (event as CustomEvent<{ tool: Tool }>).detail;
      if (!detail?.tool) return;
      this.state.activeTool = detail.tool;
    });

    this.#options = {
      showGrid: options.showGrid ?? false,
      gridSize: options.gridSize ?? 20,
      gridColor: options.gridColor ?? "#6460bf",
    };

    this.ctx = this.canvas.getContext("2d")!;
    this.setupCanvas();
    this.setupEventsHandlers();
    this.setupTouchGuards();
    this.loop();
  }

  private setupCanvas() {
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));
  }

  private setupEventsHandlers() {
    const handles: CanvasHandlerConstructor[] = [
      DragHandler,
      PinchTransformHandler,
      wheelZoomHandler,
      DrawBeadHandler,
      EraseBeadHandler,
      FillHandler,
    ];

    this.handlers = handles.map((Handler) => new Handler(this));
  }

  private setupTouchGuards() {
    window.addEventListener(
      "touchmove",
      (e) => {
        const target = e.target as Node | null;
        if (
          target &&
          (target === this.canvas || this.canvas.contains(target))
        ) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  }

  private loop() {
    this.ctx.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.#width, this.#height);
    this.ctx.save();
    this.ctx.translate(-this.state.x, -this.state.y);
    this.ctx.rotate(this.state.rotation);
    this.ctx.scale(this.state.zoom, this.state.zoom);
    if (this.#options.showGrid) {
      this.renderGrid();
    }

    for (const element of this.elements) {
      element.draw(this.ctx);
    }

    this.ctx.restore();
    requestAnimationFrame(this.loop.bind(this));
  }

  private resizeCanvas() {
    const rect = this.#root.getBoundingClientRect();
    this.#dpr = window.devicePixelRatio || 1;
    this.#width = rect.width;
    this.#height = rect.height;

    this.canvas.width = Math.round(rect.width * this.#dpr);
    this.canvas.height = Math.round(rect.height * this.#dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  private renderGrid(): void {
    const { gridSize, gridColor } = this.#options;

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.2;
    this.ctx.setLineDash([]);

    for (let x = 0; x <= this.#width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.#height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.#height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.#width, y);
      this.ctx.stroke();
    }
  }
}

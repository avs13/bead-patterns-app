import { DragHandler } from "./handlers/DragCanvasHandler";
import { PinchTransformHandler } from "./handlers/PinchTransformHandler";
import { wheelZoomHandler } from "./handlers/wheelZoomHandler";
import {
  type CanvasEditorOptions,
  type CanvasState,
  type DocumentState,
} from "./types";
import { ToolsComponent } from "./components/ToolsComponent";
import type {
  CanvasHandler,
  CanvasHandlerConstructor,
} from "./handlers/CanvasHandler";
import { DrawBeadHandler } from "./handlers/DrawBeadHandler";
import { EraseBeadHandler } from "./handlers/EraseBeadHandler";
import { FillHandler } from "./handlers/FillHandler";
import { documentStore, editorStore } from "./store/store";
import { BeadPaletteComponent } from "./components/BeadPaletteComponent";
import { TopPanelComponent } from "./components/TopPanelComponent";

export class CanvasEditor {
  #root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  #options: Required<CanvasEditorOptions>;
  #dpr = window.devicePixelRatio || 1;
  #width = 0;
  #height = 0;

  state: CanvasState = editorStore;
  document: DocumentState = documentStore;

  handlers: CanvasHandler[] = [];

  constructor(root: HTMLElement, options: CanvasEditorOptions = {}) {
    if (!root) throw new Error("El elemento root HTML no existe");
    this.#root = root;
    this.#root.innerHTML = "";
    this.canvas = document.createElement("canvas");
    this.#root.append(this.canvas);

    const toolsComponent = new ToolsComponent();
    const beadPaletteComponent = new BeadPaletteComponent();
    const topPanelComponent = new TopPanelComponent();
    this.#root.append(toolsComponent);
    this.#root.append(beadPaletteComponent);
    this.#root.append(topPanelComponent);

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
    this.ctx.translate(-this.state.transform.x, -this.state.transform.y);
    this.ctx.rotate(this.state.transform.rotation);
    this.ctx.scale(this.state.transform.zoom, this.state.transform.zoom);
    if (this.#options.showGrid) {
      this.renderGrid();
    }

    for (const element of this.document.elements) {
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

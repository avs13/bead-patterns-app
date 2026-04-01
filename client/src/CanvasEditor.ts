import { DragHandler } from "./handlers/DragCanvasHandler";
import { PinchTransformHandler } from "./handlers/PinchTransformHandler";
import { wheelZoomHandler } from "./handlers/wheelZoomHandler";
import {
  type CanvasEditorOptions,
  type CanvasState,
  type DocumentState,
  Tool,
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
import { CursorHandler } from "./handlers/CursorHandler";
import { ImageElement } from "./elements/ImageElement";
import { ShortcutsHandler } from "./handlers/ShorcutsHandler";
import { ImageHandler } from "./components/ImageHandler";
import { ImageDropHandler } from "./handlers/ImageDropHandler";

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

  rectPreview: { x: number; y: number; width: number; height: number } | null =
    null;

  constructor(root: HTMLElement, options: CanvasEditorOptions = {}) {
    if (!root) throw new Error("El elemento root HTML no existe");
    this.#root = root;
    this.#root.classList.add("bg-[#f7f1e8]");
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
      CursorHandler,
      DragHandler,
      PinchTransformHandler,
      wheelZoomHandler,
      DrawBeadHandler,
      EraseBeadHandler,
      FillHandler,
      ShortcutsHandler,
      ImageHandler,
      ImageDropHandler,
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

    this.document.elements.forEach((element) => {
      if (element instanceof ImageElement) {
        element.draw(this.ctx);
      }
    });

    this.renderGizmos();

    this.ctx.restore();
    requestAnimationFrame(this.loop.bind(this));
  }

  private renderGizmos() {
    if (this.state.activeTool !== Tool.IMAGE) return;

    const images = this.document.elements.filter(
      (el): el is ImageElement => el instanceof ImageElement
    );

    for (const image of images) {
      const { x, y, width, height, rotation } = image;
      const handleSize = 8 / this.state.transform.zoom;
      const cx = x + width / 2;
      const cy = y + height / 2;

      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(rotation);

      const rx = -width / 2;
      const ry = -height / 2;

      this.ctx.strokeStyle = "#364AFF";
      this.ctx.lineWidth = 2 / this.state.transform.zoom;
      this.ctx.strokeRect(rx, ry, width, height);

      this.ctx.fillStyle = "white";
      const corners = [
        { cx: rx, cy: ry },
        { cx: rx + width, cy: ry },
        { cx: rx, cy: ry + height },
        { cx: rx + width, cy: ry + height },
      ];

      for (const { cx: hcx, cy: hcy } of corners) {
        this.ctx.beginPath();
        this.ctx.arc(hcx, hcy, handleSize / 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      }

      const rotHandleDist = 24 / this.state.transform.zoom;
      this.ctx.beginPath();
      this.ctx.moveTo(0, ry);
      this.ctx.lineTo(0, ry - rotHandleDist);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(0, ry - rotHandleDist, handleSize / 1.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.restore();
    }
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

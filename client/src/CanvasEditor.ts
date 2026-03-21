interface CanvasEditorOptions {
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
}

export class CanvasEditor {
  #root: HTMLElement;
  #canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  #options: Required<CanvasEditorOptions>;

  constructor(root: HTMLElement, options: CanvasEditorOptions = {}) {
    if (!root) throw new Error("El elemento root HTML no existe");
    this.#root = root;
    this.#root.innerHTML = "";
    this.#canvas = document.createElement("canvas");
    this.#root.append(this.#canvas);

    this.#options = {
      showGrid: options.showGrid ?? false,
      gridSize: options.gridSize ?? 20,
      gridColor: options.gridColor ?? "#6460bf",
    };

    this.ctx = this.#canvas.getContext("2d")!;
    this.setupCanvas();
    this.loop();
  }

  private setupCanvas() {
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));
  }

  private loop() {
    this.ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    if (this.#options.showGrid) {
      this.renderGrid();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  private resizeCanvas() {
    const rect = this.#root.getBoundingClientRect();

    this.#canvas.width = rect.width;
    this.#canvas.height = rect.height;
  }

  private renderGrid(): void {
    const { gridSize, gridColor } = this.#options;

    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.2;
    this.ctx.setLineDash([]);

    for (let x = 0; x <= this.#canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.#canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y <= this.#canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.#canvas.width, y);
      this.ctx.stroke();
    }
  }
}

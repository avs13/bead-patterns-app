import type { CanvasElement } from "../types";

export class LoomElement implements CanvasElement {
  readonly BEAD_WIDTH = 16;
  readonly BEAD_HEIGHT = 13;
  readonly SPACING = 2;
  readonly FRAME_WIDTH = 10;

  x: number;
  y: number;

  width: number = 0;
  height: number = 0;

  #columns: number;
  #rows: number;
  originX: number = 0;
  originY: number = 0;
  maxX: number = 0;
  maxY: number = 0;
  columnSpacing: number = 0;
  rowSpacing: number = 0;

  get columns() {
    return this.#columns;
  }

  set columns(val: number) {
    this.#columns = val;
    this.updateGeometry();
  }

  get rows() {
    return this.#rows;
  }

  set rows(val: number) {
    this.#rows = val;
    this.updateGeometry();
  }

  constructor(data: { x: number; y: number; columns: number; rows: number }) {
    this.x = data.x;
    this.y = data.y;
    this.#columns = data.columns;
    this.#rows = data.rows;
    this.updateGeometry();
  }

  private updateGeometry() {
    this.columnSpacing = this.BEAD_WIDTH + this.SPACING;
    this.rowSpacing = this.BEAD_HEIGHT + this.SPACING;
    this.originX = this.x + this.FRAME_WIDTH + 1;
    this.originY = this.y + this.SPACING;
    this.maxX =
      this.originX + this.#columns * this.columnSpacing - this.SPACING;
    this.maxY = this.originY + this.#rows * this.rowSpacing - this.SPACING;
    const beadAreaWidth =
      this.#columns * this.BEAD_WIDTH + (this.#columns - 1) * this.SPACING;
    const beadAreaHeight =
      this.#rows * this.BEAD_HEIGHT +
      (this.#rows - 1) * this.SPACING +
      this.SPACING * 2;
    this.width = beadAreaWidth + this.FRAME_WIDTH * 2 + this.SPACING;
    this.height = beadAreaHeight;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.drawBase(ctx);
    this.drawFrame(ctx);
    this.drawThreads(ctx);
    this.drawColumnGuides(ctx);
    this.drawThreadAnchors(ctx);
    ctx.restore();
  }

  private drawBase(ctx: CanvasRenderingContext2D) {
    const { innerX, innerY, innerW, innerH } = this.getInnerRect();
    ctx.fillStyle = "#b4875a";
    ctx.fillRect(innerX, innerY, innerW, innerH);
  }

  private drawFrame(ctx: CanvasRenderingContext2D) {
    const { innerY, innerH } = this.getInnerRect();
    ctx.fillStyle = "#8b5e38";
    ctx.fillRect(this.x, innerY, this.FRAME_WIDTH, innerH);
    ctx.fillRect(
      this.x + this.width - this.FRAME_WIDTH,
      innerY,
      this.FRAME_WIDTH,
      innerH,
    );
  }

  private drawThreads(ctx: CanvasRenderingContext2D) {
    const { innerY } = this.getInnerRect();
    const { threadCount, spacing, left, right } = this.getThreadGeometry();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    for (let i = 0; i < threadCount; i++) {
      const ty = innerY + this.SPACING + i * spacing - 2;
      ctx.beginPath();
      ctx.moveTo(left, ty + 1);
      ctx.lineTo(right, ty + 1);
      ctx.stroke();
    }
  }

  private drawThreadAnchors(ctx: CanvasRenderingContext2D) {
    const { innerY } = this.getInnerRect();
    const { threadCount, spacing, left, right } = this.getThreadGeometry();
    const markerRadius = 2.2;
    ctx.fillStyle = "#d4af37";
    ctx.strokeStyle = "#8a6b1f";
    ctx.lineWidth = 0.6;
    for (let i = 0; i < threadCount; i++) {
      const ty = innerY + this.SPACING + i * spacing - 1;
      ctx.beginPath();
      ctx.arc(left, ty, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(right, ty, markerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private drawColumnGuides(ctx: CanvasRenderingContext2D) {
    const { innerX, innerY, innerH } = this.getInnerRect();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 0.5;
    const columnSpacing = this.BEAD_WIDTH + this.SPACING;
    const top = innerY;
    const bottom = innerY + innerH;
    for (let c = 1; c < this.columns; c++) {
      const tx = innerX + c * columnSpacing - this.SPACING / 2;
      ctx.beginPath();
      ctx.moveTo(tx + 1, top);
      ctx.lineTo(tx + 1, bottom);
      ctx.stroke();
    }
  }

  private getInnerRect() {
    const innerX = this.x + this.FRAME_WIDTH;
    const innerY = this.y;
    const innerW = this.width - this.FRAME_WIDTH * 2;
    const innerH = this.height;
    return { innerX, innerY, innerW, innerH };
  }

  private getThreadGeometry() {
    const threadCount = this.rows + 1;
    const spacing = this.BEAD_HEIGHT + this.SPACING;
    const left = this.x + this.FRAME_WIDTH / 2;
    const right = this.x + this.width - this.FRAME_WIDTH / 2;
    return { threadCount, spacing, left, right };
  }
}

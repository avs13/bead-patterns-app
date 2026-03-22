import type { CanvasElement } from "./CanvasEditor";

export class BeadElement implements CanvasElement {
  readonly WIDTH = 16;
  readonly HEIGHT = 13;
  readonly CORNER_RATIO = 0.2;
  readonly CORNER_WALL_RATIO = 0.19;

  x: number;
  y: number;
  color: string;

  radius: number;
  wall: number;

  constructor(data: { x: number; y: number; color: string }) {
    this.x = data.x;
    this.y = data.y;
    this.color = data.color;

    const minSide = Math.min(this.WIDTH, this.HEIGHT);
    this.radius = minSide * this.CORNER_RATIO;
    this.wall = minSide * this.CORNER_WALL_RATIO;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    this.drawShadow(ctx);
    this.fillBase(ctx);
    this.fillHighlight(ctx);
    this.drawOutline(ctx);
    this.drawInnerStroke(ctx);

    ctx.restore();
  }

  drawShadow(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#000";
    this.drawRectangleRounded(
      ctx,
      this.x + 1,
      this.y + 1.2,
      this.WIDTH,
      this.HEIGHT,
      this.radius,
    );
    ctx.fill();
    ctx.restore();
  }

  drawOutline(ctx: CanvasRenderingContext2D) {
    this.drawRectangleRounded(
      ctx,
      this.x,
      this.y,
      this.WIDTH,
      this.HEIGHT,
      this.radius,
    );
    ctx.strokeStyle = this._darken(this.color, 0.3); // render.wall_color ?? "";
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 1.0;
    ctx.stroke();
  }

  private fillBase(ctx: CanvasRenderingContext2D) {
    this.drawRectangleRounded(
      ctx,
      this.x,
      this.y,
      this.WIDTH,
      this.HEIGHT,
      this.radius,
    );
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  private fillHighlight(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = 0.3;
    this.drawRectangleRounded(
      ctx,
      this.x + 1.5,
      this.y + 1,
      this.WIDTH - 3,
      this.HEIGHT * 0.38,
      1.5,
    );
    ctx.fillStyle = this._lighten(this.color, 0.55);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  private drawInnerStroke(ctx: CanvasRenderingContext2D) {
    const ri = Math.max(0.4, this.radius - this.wall * 0.5);
    this.drawRectangleRounded(
      ctx,
      this.x + this.wall,
      this.y + this.wall * 0.9,
      this.WIDTH - this.wall * 2,
      this.HEIGHT - this.wall * 1.8,
      ri,
    );

    ctx.strokeStyle = this._darken(this.color, 0.15);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  private _lighten(hex: string, amount: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (
      "#" +
      [r, g, b]
        .map((v) =>
          Math.min(255, Math.round(v + (255 - v) * amount))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }

  private _darken(hex: string, amount: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (
      "#" +
      [r, g, b]
        .map((v) =>
          Math.max(0, Math.round(v * (1 - amount)))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }

  private drawRectangleRounded(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}

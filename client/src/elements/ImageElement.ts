import type { CanvasElement } from "../types";

export class ImageElement implements CanvasElement {
  x: number;
  y: number;
  bitmap: ImageBitmap;
  scale: number;
  opacity: number = 0.6;
  rotation: number = 0;

  constructor(data: {
    x: number;
    y: number;
    bitmap: ImageBitmap;
    scale?: number;
    opacity?: number;
    rotation?: number;
  }) {
    this.x = data.x;
    this.y = data.y;
    this.bitmap = data.bitmap;
    this.scale = data.scale ?? 1;
    this.opacity = data.opacity ?? 0.6;
    this.rotation = data.rotation ?? 0;
  }

  get width() {
    return this.bitmap.width * this.scale;
  }

  get height() {
    return this.bitmap.height * this.scale;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = this.opacity;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    ctx.drawImage(
      this.bitmap,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.restore();
  }
}

import { LoomElement } from "../elements/LoomElement";
import type { CanvasElement } from "../types";

export function documentToThumbnailUrl(elements: CanvasElement[]): string {
  const loom = elements.find((el): el is LoomElement => el instanceof LoomElement);
  if (!loom) return "";

  const loomWidth = loom.width;
  const loomHeight = loom.height;
  
  if (loomWidth === 0 || loomHeight === 0) return "";

  const MAX_SIZE = 150;
  const scale = Math.min(MAX_SIZE / loomWidth, MAX_SIZE / loomHeight, 1);
  
  const canvas = document.createElement("canvas");
  canvas.width = loomWidth * scale;
  canvas.height = loomHeight * scale;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  
  ctx.scale(scale, scale);
  ctx.translate(-loom.x, -loom.y);
  
  for (const el of elements) {
    el.draw(ctx);
  }
  
  return canvas.toDataURL("image/webp", 0.8);
}

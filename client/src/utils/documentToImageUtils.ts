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

export function documentToImageUrl(
  elements: CanvasElement[],
  format: "png" | "webp" = "png",
  scale: number = 2
): string {
  const loom = elements.find(
    (el): el is LoomElement => el instanceof LoomElement
  );
  if (!loom) return "";

  const canvas = document.createElement("canvas");
  canvas.width = loom.width * scale;
  canvas.height = loom.height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.translate(-loom.x, -loom.y);

  for (const el of elements) {
    el.draw(ctx);
  }

  return canvas.toDataURL(`image/${format}`, 1.0);
}

export function exportImage(elements: CanvasElement[], fileName: string) {
  const dataUrl = documentToImageUrl(elements, "png");
  if (!dataUrl) return;

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${fileName}.png`;
  link.click();
}

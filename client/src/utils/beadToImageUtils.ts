import { BeadElement } from "../elements/BeadElement";

export function beadToImageUrl(color: string) {
  const scale = Math.max(2, Math.round(window.devicePixelRatio || 1));
  const inset = 1;
  const bead = new BeadElement({ x: inset, y: inset, color });
  const canvas = document.createElement("canvas");
  canvas.width = (bead.WIDTH + inset * 2) * scale;
  canvas.height = (bead.HEIGHT + inset * 2) * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(scale, scale);
  bead.draw(ctx);
  return canvas.toDataURL();
}

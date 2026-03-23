import type { CanvasElement, Vec2 } from "../types";
import { BeadElement } from "../BeadElement";
import { LoomElement } from "../LoomElement";

/**
 * Devuelve el primer LoomElement encontrado en el array de elementos.
 */
export const getLoom = (elements: CanvasElement[]): LoomElement | null =>
  elements.find(
    (element): element is LoomElement => element instanceof LoomElement,
  ) ?? null;

/**
 * Calcula la celda de un bead (col, row) y su posición en el canvas a partir de un punto y un loom.
 */
export const getBeadCellAt = (point: Vec2, loom: LoomElement) => {
  if (
    point.x < loom.originX ||
    point.y < loom.originY ||
    point.x > loom.maxX ||
    point.y > loom.maxY
  ) {
    return null;
  }

  const col = Math.floor((point.x - loom.originX) / loom.columnSpacing);
  const row = Math.floor((point.y - loom.originY) / loom.rowSpacing);

  if (col < 0 || row < 0 || col >= loom.columns || row >= loom.rows) {
    return null;
  }

  const beadX = loom.originX + col * loom.columnSpacing;
  const beadY = loom.originY + row * loom.rowSpacing;

  return {
    col,
    row,
    beadX,
    beadY,
  };
};

/**
 * Busca el índice de un bead en el array de elementos por su posición exacta.
 */
export const findBeadIndexAt = (
  elements: CanvasElement[],
  beadPoint: Vec2,
): number =>
  elements.findIndex(
    (element) =>
      element instanceof BeadElement &&
      element.x === beadPoint.x &&
      element.y === beadPoint.y,
  );

/**
 * Busca y devuelve el bead en la posición exacta
 */
export const findBeadAt = (elements: CanvasElement[], beadPoint: Vec2) =>
  elements.find(
    (element): element is BeadElement =>
      element instanceof BeadElement &&
      element.x === beadPoint.x &&
      element.y === beadPoint.y,
  );

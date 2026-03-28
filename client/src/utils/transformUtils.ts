import type { CanvasState, Vec2 } from "../types";

/**
 * Convierte coordenadas del puntero en la ventana (clientX/clientY)
 * a coordenadas locales del canvas segun el DOMRect.
 */
export const screenToCanvas = (point: Vec2, rect: DOMRect): Vec2 => ({
  x: point.x - rect.left,
  y: point.y - rect.top,
});

/**
 * Rota un punto alrededor del origen por el angulo dado (radianes).
 */
export const rotatePoint = (point: Vec2, angle: number): Vec2 => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
};

/**
 * Mapea un punto de canvas a coordenadas del mundo usando el estado actual.
 */
export const canvasToWorld = (
  point: Vec2,
  state: CanvasState["transform"],
): Vec2 => {
  const local = rotatePoint(
    { x: point.x + state.x, y: point.y + state.y },
    -state.rotation,
  );
  return {
    x: local.x / state.zoom,
    y: local.y / state.zoom,
  };
};

/**
 * Calcula la traslacion que mantiene un punto del mundo anclado
 * a un punto de canvas especifico segun el estado del canvas.
 */
export const translationForAnchor = (
  worldPoint: Vec2,
  screenPoint: Vec2,
  state: CanvasState["transform"],
): Vec2 => {
  const local = rotatePoint(
    { x: worldPoint.x * state.zoom, y: worldPoint.y * state.zoom },
    state.rotation,
  );
  return {
    x: local.x - screenPoint.x,
    y: local.y - screenPoint.y,
  };
};

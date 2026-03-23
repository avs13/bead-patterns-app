import type { Vec2 } from "../types";

/**
 * Calcula la distancia euclidiana entre dos puntos.
 */
export const distance = (a: Vec2, b: Vec2): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Devuelve el angulo (radianes) entre dos puntos respecto al eje X.
 */
export const angle = (a: Vec2, b: Vec2): number =>
  Math.atan2(b.y - a.y, b.x - a.x);

/**
 * Normaliza un angulo a un rango equivalente entre 0 y 2*PI.
 */
export const normalizeAngle = (angleValue: number): number => {
  const TWO_PI = Math.PI * 2;
  return ((angleValue % TWO_PI) + TWO_PI) % TWO_PI;
};

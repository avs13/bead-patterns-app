export interface ColorEntry {
  color: string;
  rgb: [number, number, number];
}

/**
 * Convierte un color HEX string a RGB.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Convierte valores RGB a HEX string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calcula la distancia euclidiana entre dos colores RGB.
 */
export function colorDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );
}

/**
 * Busca el color más similar en la paleta actual dentro de un umbral.
 */
export function findSimilarColor(
  palette: ColorEntry[],
  r: number,
  g: number,
  b: number,
  threshold: number = 20
): string | null {
  let bestDist = Infinity;
  let bestColor: string | null = null;

  for (const entry of palette) {
    const dist = colorDistance(entry.rgb, [r, g, b]);
    if (dist < bestDist) {
      bestDist = dist;
      bestColor = entry.color;
    }
  }

  return bestDist < threshold ? bestColor : null;
}

import { BeadElement } from "../elements/BeadElement";
import { ImageElement } from "../elements/ImageElement";
import { LoomElement } from "../elements/LoomElement";
import { batch, set } from "../libs/stateManager";
import {
  deleteFile,
  listFiles,
  loadFileContent,
  loadFileMeta,
  renameFile,
  saveFile,
  type SerializedElement,
} from "../storage/fileStorage";
import {
  HistoryAction,
  type CanvasElement,
  type DocumentState,
  type History,
  type BeadDrawDelta,
  Tool,
} from "../types";
import { documentToThumbnailUrl } from "../utils/documentToImageUtils";
import { findBeadIndexAt } from "../utils/loomUtils";
import { translationForAnchor, rotatePoint } from "../utils/transformUtils";
import {
  findSimilarColor,
  hexToRgb,
  rgbToHex,
  type ColorEntry,
} from "../utils/colorUtils";
import { documentStore, editorStore, filesStore, historyStore } from "./store";

export const convertImageToBeads = (image: ImageElement) => {
  const loom = documentStore.elements.find(
    (el) => el instanceof LoomElement
  ) as LoomElement;
  if (!loom) return;

  const temp = document.createElement("canvas");
  const ctx = temp.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  temp.width = image.bitmap.width;
  temp.height = image.bitmap.height;
  ctx.drawImage(image.bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, temp.width, temp.height);
  const data = imageData.data;

  const originalPalette = [...documentStore.beadPalette];
  const palette: ColorEntry[] = originalPalette.map((color) => ({
    color,
    rgb: hexToRgb(color),
  }));

  const threshold = 30;
  const beadDeltas: BeadDrawDelta[] = [];
  const newElements = [...documentStore.elements];

  for (let row = 0; row < loom.rows; row++) {
    for (let col = 0; col < loom.columns; col++) {
      const beadX = loom.originX + col * loom.columnSpacing;
      const beadY = loom.originY + row * loom.rowSpacing;

      const icx = image.x + image.width / 2;
      const icy = image.y + image.height / 2;

      const local = rotatePoint(
        {
          x: beadX + loom.BEAD_WIDTH / 2 - icx,
          y: beadY + loom.BEAD_HEIGHT / 2 - icy,
        },
        -image.rotation
      );

      const sampleX = Math.round(
        local.x / image.scale + image.bitmap.width / 2
      );
      const sampleY = Math.round(
        local.y / image.scale + image.bitmap.height / 2
      );

      if (
        sampleX < 0 ||
        sampleY < 0 ||
        sampleX >= temp.width ||
        sampleY >= temp.height
      ) {
        continue;
      }

      const idx = (sampleY * temp.width + sampleX) * 4;
      const alpha = data[idx + 3];

      if (alpha < 50) continue;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const mapped = findSimilarColor(palette, r, g, b, threshold);
      const color = mapped ?? rgbToHex(r, g, b);

      if (!mapped) {
        palette.push({ color, rgb: [r, g, b] });
      }

      const existingIdx = newElements.findIndex(
        (el) => el instanceof BeadElement && el.x === beadX && el.y === beadY
      );

      const prevColor =
        existingIdx !== -1
          ? (newElements[existingIdx] as BeadElement).color
          : null;

      if (prevColor !== color) {
        beadDeltas.push({ x: beadX, y: beadY, prevColor, newColor: color });

        if (existingIdx !== -1) {
          newElements[existingIdx] = new BeadElement({
            x: beadX,
            y: beadY,
            color,
          });
        } else {
          newElements.push(new BeadElement({ x: beadX, y: beadY, color }));
        }
      }
    }
  }

  const newPalette = palette.map((e) => e.color);

  historyPush({
    action: HistoryAction.IMAGE_CONVERT,
    state: {
      prevPalette: originalPalette,
      newPalette: newPalette,
      beadDeltas: beadDeltas,
    },
  });

  documentStore.beadPalette = newPalette;
  documentStore.elements = set(newElements);
};

export const deleteAllImages = () => {
  documentStore.elements = set(
    documentStore.elements.filter((el) => !(el instanceof ImageElement))
  );
};

export const importImage = async (
  position?: { x: number; y: number },
  fileToImport?: File
) => {
  let file: File | null = fileToImport || null;

  if (!file) {
    if ("showOpenFilePicker" in window) {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: "Imágenes",
            accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
          },
        ],
        multiple: false,
      });
      file = await fileHandle.getFile();
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      file = await new Promise((resolve) => {
        input.onchange = () => resolve(input.files?.[0] || null);
        input.click();
      });
    }
  }

  if (!file) return;

  const bitmap = await createImageBitmap(file);

  const loom = documentStore.elements.find(
    (el) => el instanceof LoomElement
  ) as LoomElement;

  const refWidth = loom ? loom.width : 800;
  const refHeight = loom ? loom.height : 800;

  let initialScale = 1;
  const scaleX = refWidth / bitmap.width;
  const scaleY = refHeight / bitmap.height;

  if (bitmap.width > refWidth || bitmap.height > refHeight) {
    initialScale = Math.min(scaleX, scaleY);
  }

  const pos = position || { x: 0, y: 0 };

  const newImage = new ImageElement({
    x: pos.x - (bitmap.width * initialScale) / 2,
    y: pos.y - (bitmap.height * initialScale) / 2,
    bitmap,
    scale: initialScale,
  });

  documentStore.elements.unshift(newImage);
  documentStore.elements = set([...documentStore.elements]);
  editorStore.activeTool = Tool.IMAGE;
};

export const createDocument = ({
  name,
  cols,
  rows,
}: {
  name: string;
  cols: number;
  rows: number;
}) => {
  batch(() => {
    const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const loom = new LoomElement({ x: 0, y: 0, columns: cols, rows: rows });
    documentStore.id = id;
    documentStore.name = name;
    documentStore.elements = set([loom]);
    documentStore.beadPalette = ["#3b82f6"];
    editorStore.activeBead = "#3b82f6";
    historyReset();
  });
};

export const saveDocument = async () => {
  if (!documentStore.id || !documentStore.name) return;
  const elementsSerialized = elementsToSerialized(documentStore);
  const thumbnail = documentToThumbnailUrl(documentStore.elements);

  await saveFile(
    {
      id: documentStore.id,
      name: documentStore.name,
      thumbnail,
    },
    {
      elements: elementsSerialized,
      beadPalette: [...documentStore.beadPalette],
    }
  );
  loadFilesStore();
};

export const openDocument = async (id: string) => {
  const meta = await loadFileMeta(id);
  const content = await loadFileContent(id);
  if (!content) return false;

  const elements = serializedToElements(content.elements);
  const palette = content.beadPalette ? content.beadPalette : ["#3b82f6"];

  batch(() => {
    documentStore.id = id;
    documentStore.name = meta?.name ?? "";
    documentStore.elements = set(elements);
    documentStore.beadPalette = palette;
    editorStore.activeBead = palette[0];
    historyReset();
  });
};

export const deleteDocument = async (id: string) => {
  await deleteFile(id);
  loadFilesStore();
};

export const renameDocument = async (id: string, newName: string) => {
  await renameFile(id, newName);

  if (documentStore.id === id) {
    documentStore.name = newName;
  }

  loadFilesStore();
};

export const cloneDocument = async (id: string) => {
  const meta = await loadFileMeta(id);
  const content = await loadFileContent(id);
  if (!content || !meta) return;

  const newId = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const newName = `${meta.name} (copia)`;

  await saveFile(
    {
      id: newId,
      name: newName,
      thumbnail: meta.thumbnail || "",
    },
    {
      elements: content.elements,
      beadPalette: content.beadPalette,
    }
  );

  loadFilesStore();
};

export const loadFilesStore = async () => {
  const files = await listFiles();
  filesStore.files = files;
};

export const historyReset = () => {
  historyStore.undoStack = [];
  historyStore.redoStack = [];
};

export const historyPush = (action: History) => {
  historyStore.undoStack.push(action);
  historyStore.redoStack = [];
};

export const historyUndo = () => {
  const state = historyStore.undoStack.pop();
  if (!state) return;
  historyStore.redoStack.push(state);

  batch(() => {
    if (state.action === HistoryAction.DRAW) {
      applyBeadDeltas(state.state, "undo");
      return;
    }

    if (state.action === HistoryAction.PALETTE_COLOR_CHANGE) {
      const { paletteIndex, oldColor, newColor, beadDeltas } = state.state;
      documentStore.beadPalette[paletteIndex] = oldColor;
      if (editorStore.activeBead === newColor) {
        editorStore.activeBead = oldColor;
      }
      applyBeadDeltas(beadDeltas, "undo");
      return;
    }

    if (state.action === HistoryAction.PALETTE_COLOR_REMOVE) {
      const { paletteIndex, color, beadDeltas } = state.state;
      documentStore.beadPalette.splice(paletteIndex, 0, color);
      applyBeadDeltas(beadDeltas, "undo");
      return;
    }

    if (state.action === HistoryAction.IMAGE_CONVERT) {
      const { prevPalette, beadDeltas } = state.state;
      documentStore.beadPalette = set(prevPalette);
      applyBeadDeltas(beadDeltas, "undo");
      return;
    }
  });
};

export const historyRedo = () => {
  const state = historyStore.redoStack.pop();
  if (!state) return;
  historyStore.undoStack.push(state);

  batch(() => {
    if (state.action === HistoryAction.DRAW) {
      applyBeadDeltas(state.state, "redo");
      return;
    }

    if (state.action === HistoryAction.PALETTE_COLOR_CHANGE) {
      const { paletteIndex, oldColor, newColor, beadDeltas } = state.state;
      documentStore.beadPalette[paletteIndex] = newColor;
      if (editorStore.activeBead === oldColor) {
        editorStore.activeBead = newColor;
      }
      applyBeadDeltas(beadDeltas, "redo");
      return;
    }

    if (state.action === HistoryAction.PALETTE_COLOR_REMOVE) {
      const { paletteIndex, color } = state.state;
      documentStore.beadPalette.splice(paletteIndex, 1);
      if (editorStore.activeBead === color) {
        editorStore.activeBead = documentStore.beadPalette[0] || "";
      }
      documentStore.elements = set(
        documentStore.elements.filter(
          (el) => !(el instanceof BeadElement && el.color === color)
        )
      );
      return;
    }

    if (state.action === HistoryAction.IMAGE_CONVERT) {
      const { newPalette, beadDeltas } = state.state;
      documentStore.beadPalette = set(newPalette);
      applyBeadDeltas(beadDeltas, "redo");
      return;
    }
  });
};

function applyBeadDeltas(deltas: BeadDrawDelta[], type: "undo" | "redo") {
  deltas.forEach((delta) => {
    const beadIndex = findBeadIndexAt(documentStore.elements, delta);
    const targetColor = type === "undo" ? delta.prevColor : delta.newColor;

    if (targetColor === null && beadIndex !== -1) {
      documentStore.elements.splice(beadIndex, 1);
      return;
    }

    if (targetColor === null) return;

    if (beadIndex !== -1) {
      (documentStore.elements[beadIndex] as BeadElement).color = targetColor;
      return;
    }

    documentStore.elements.push(
      new BeadElement({ x: delta.x, y: delta.y, color: targetColor })
    );
  });
}

export function applyCenteredTransform(width: number, height: number) {
  const loom = documentStore.elements.find(
    (el): el is LoomElement => el instanceof LoomElement
  );
  if (!loom) return;

  const transform = { x: 0, y: 0, zoom: 1, rotation: 0 };
  const loomCenter = {
    x: loom.originX + loom.width / 2,
    y: loom.originY + loom.height / 2,
  };
  const canvasCenter = { x: width / 2, y: height / 2 };

  if (height > width) {
    transform.rotation = Math.PI / 2;
    transform.zoom = (height / loom.width) * 0.8;
  } else {
    transform.zoom = (width / loom.width) * 0.7;
  }

  const translation = translationForAnchor(loomCenter, canvasCenter, transform);

  editorStore.transform.x = translation.x;
  editorStore.transform.y = translation.y;
  editorStore.transform.zoom = transform.zoom;
  editorStore.transform.rotation = transform.rotation;
}

export const elementsToSerialized = (
  state: DocumentState
): SerializedElement[] => {
  const result: SerializedElement[] = [];
  for (const el of state.elements) {
    if (el instanceof LoomElement) {
      result.push({
        type: "Loom",
        x: el.x,
        y: el.y,
        rows: el.rows,
        columns: el.columns,
      });
    } else if (el instanceof BeadElement) {
      result.push({ type: "Bead", x: el.x, y: el.y, color: el.color });
    }
  }
  return result;
};

export function serializedToElements(
  data: SerializedElement[]
): CanvasElement[] {
  const elements = data
    .map((el) => {
      if (el.type === "Loom")
        return new LoomElement({
          x: el.x,
          y: el.y,
          columns: el.columns,
          rows: el.rows,
        });
      if (el.type === "Bead")
        return new BeadElement({ x: el.x, y: el.y, color: el.color });
      return null;
    })
    .filter((el): el is LoomElement | BeadElement => !!el);
  return elements;
}

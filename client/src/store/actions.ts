import { BeadElement } from "../elements/BeadElement";
import { LoomElement } from "../elements/LoomElement";
import { batch, set } from "../libs/stateManager";
import { saveFile, type SerializedElement } from "../storage/fileStorage";
import type { DocumentState } from "../types";
import { translationForAnchor } from "../utils/transformUtils";
import { documentStore, editorStore } from "./store";

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
  });
};

export const saveDocument = async () => {
  if (!!documentStore.id || !!documentStore.name) {
  }
  const elementsSerialized = elementsToSerialized(documentStore);
  saveFile(
    {
      id: documentStore.id,
      name: documentStore.name,
    },
    {
      elements: elementsSerialized,
      beadPalette: [...documentStore.beadPalette],
    }
  );
};

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

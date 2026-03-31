import { BeadElement } from "../elements/BeadElement";
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
import type { CanvasElement, DocumentState } from "../types";
import { documentToThumbnailUrl } from "../utils/documentToImageUtils";
import { translationForAnchor } from "../utils/transformUtils";
import { documentStore, editorStore, filesStore } from "./store";

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

import { html } from "../dom";
import { effect } from "../libs/stateManager";
import {
  convertImageToBeads,
  deleteAllImages,
  importImage,
} from "../store/actions";
import { documentStore, editorStore } from "../store/store";
import { Tool } from "../types";
import { ImageElement } from "../elements/ImageElement";

const UploadIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <polyline points="17 8 12 3 7 8" />
  <line x1="12" y1="3" x2="12" y2="15" />
</svg>`;

const StampIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="5" y="15" width="14" height="4" rx="1" />
  <path d="M7 15V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8" />
  <path d="M12 5V3" />
</svg>`;

const TrashIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6m4-6v6" />
</svg>`;

export class ImageToolControlsComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div class="portrait:flex-row landscape:flex-col flex gap-2">
        <button
          id="btn-import-image"
          title="Subir Imagen"
          class="bg-amber-50/90 hover:bg-amber-100 text-slate-700 rounded-xl border-amber-100/50 items-center justify-center hidden w-10 h-10 p-2 transition border shadow-lg"
        >
          ${UploadIcon}
        </button>

        <button
          id="btn-stamp-image"
          title="Estampar en Telar"
          class="hover:bg-indigo-600 rounded-xl items-center justify-center hidden w-10 h-10 p-2 text-white transition bg-indigo-500 shadow-lg"
        >
          ${StampIcon}
        </button>
        <button
          id="btn-delete-images"
          title="Eliminar Todas las Imágenes"
          class="bg-rose-500 hover:bg-rose-600 rounded-xl items-center justify-center hidden w-10 h-10 p-2 text-white transition shadow-lg"
        >
          ${TrashIcon}
        </button>
      </div>
    `);

    const btnImport = this.querySelector("#btn-import-image")!;
    btnImport.addEventListener("click", () => importImage());

    const btnStamp = this.querySelector("#btn-stamp-image")!;
    btnStamp.addEventListener("click", () => {
      const img = documentStore.elements.find(
        (el) => el instanceof ImageElement
      ) as ImageElement;
      if (img) convertImageToBeads(img);
    });

    const btnDelete = this.querySelector("#btn-delete-images")!;
    btnDelete.addEventListener("click", () => deleteAllImages());

    effect(() => {
      const isImageTool = editorStore.activeTool === Tool.IMAGE;
      const hasImage = documentStore.elements.some(
        (el) => el instanceof ImageElement
      );

      this.classList.toggle("hidden", !isImageTool);
      btnImport.classList.toggle("hidden", !isImageTool);
      btnImport.classList.toggle("flex", isImageTool);

      btnStamp.classList.toggle("hidden", !(isImageTool && hasImage));
      btnStamp.classList.toggle("flex", isImageTool && hasImage);

      btnDelete.classList.toggle("hidden", !(isImageTool && hasImage));
      btnDelete.classList.toggle("flex", isImageTool && hasImage);
    });
  }
}

customElements.define("image-tool-controls", ImageToolControlsComponent);

import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { documentStore, editorStore } from "../store/store";
import { BeadSwatchComponent } from "./BeadSwatchComponent";
import { ColorPickerComponent } from "./ColorPickerComponent";

const PlusIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5v14" />
  <path d="M5 12h14" />
</svg>`;

export class BeadPaletteComponent extends HTMLElement {
  beadPaletteList!: HTMLDivElement;
  colorPickerComponent!: ColorPickerComponent;
  dialogComponent!: HTMLDialogElement;

  cleanupFns: Array<() => void> = [];

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.cleanupFns.forEach((fn) => fn());
  }

  render() {
    const pickerValue = editorStore.activeBead || "#000000";

    this.append(
      html` <div
        class="bg-amber-50/90 text-slate-800 rounded-xl top-1/2 right-4 fixed px-1 py-1 -translate-y-1/2 shadow-lg"
      >
        <div
          class="flex flex-col items-center gap-1"
          style="anchor-name: --anchor-add-bead"
        >
          <div
            class="flex gap-1 flex-nowrap max-h-[60vh] max-w-[70vw] flex-col overflow-y-auto touch-pan-y p-1"
            id="bead-palette-list"
          ></div>
          <button
            id="add-color-btn"
            class="w-11 h-11 hover:bg-amber-100 active:bg-amber-200 inline-flex items-center justify-center flex-none transition rounded-lg cursor-pointer"
            commandfor="color-picker"
            command="show-modal"
          >
            ${PlusIcon}
          </button>
          <dialog
            closedby="any"
            id="color-picker"
            class="backdrop:hidden fixed inset-auto mr-4 overflow-visible translate-y-10 bg-transparent border-0"
            style="position-anchor: --anchor-add-bead; bottom: anchor(bottom); right: anchor(left);"
          >
            <color-picker
              id="custom-color-picker"
              value="${pickerValue}"
            ></color-picker>
          </dialog>
        </div>
      </div>`
    );

    this.beadPaletteList =
      this.querySelector<HTMLDivElement>("#bead-palette-list")!;
    this.colorPickerComponent = this.querySelector("#custom-color-picker")!;
    this.dialogComponent = this.querySelector("dialog")!;

    if (
      !this.beadPaletteList ||
      !this.colorPickerComponent ||
      !this.dialogComponent
    ) {
      throw new Error(
        "No se pudieron encontrar los elementos necesarios en el DOM"
      );
    }

    this.cleanupFns.push(effect(this.renderPaletteList.bind(this)));

    this.colorPickerComponent.addEventListener(
      "color-change",
      this.onAddColor.bind(this)
    );
  }

  renderPaletteList() {
    const beadSwatches = documentStore.beadPalette.map((color) => {
      return new BeadSwatchComponent(color);
    });

    const container = this.querySelector("#bead-palette-list")!;
    container.innerHTML = "";
    container.append(...beadSwatches);
  }

  onAddColor() {
    const color = this.colorPickerComponent.value;
    if (!color) return;
    if (!documentStore.beadPalette.includes(color)) {
      documentStore.beadPalette = [...documentStore.beadPalette, color];
    }
    editorStore.activeBead = color;
    this.dialogComponent.close();
  }
}

customElements.define("bead-palette", BeadPaletteComponent);

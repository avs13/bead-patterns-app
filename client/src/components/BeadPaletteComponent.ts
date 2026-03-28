import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { documentStore, editorStore } from "../store/store";
import { beadToImageUrl } from "../utils/beadToImageUtils";

const PlusIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5v14" />
  <path d="M5 12h14" />
</svg>`;

export class BeadPaletteComponent extends HTMLElement {
  colorPicker!: HTMLInputElement;
  beadPaletteList!: HTMLDivElement;

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
        class="fixed bg-amber-50/90 text-slate-800 shadow-lg rounded-xl px-1 py-1 top-1/2 right-4 -translate-y-1/2"
      >
        <div class="flex flex-col items-center gap-1">
          <div
            class="flex gap-1 flex-nowrap max-h-[60vh] max-w-[70vw] flex-col overflow-y-auto touch-pan-y p-1"
            id="bead-palette-list"
          ></div>
          <label
            for="color-picker"
            class="w-11 h-11 inline-flex flex-none items-center justify-center rounded-lg transition hover:bg-amber-100 active:bg-amber-200"
          >
            ${PlusIcon}
          </label>
          <p></p>
          <input
            id="color-picker"
            type="color"
            value="${pickerValue}"
            class="hidden"
          />
        </div>
      </div>`,
    );

    this.colorPicker = this.querySelector<HTMLInputElement>("input")!;
    this.beadPaletteList =
      this.querySelector<HTMLDivElement>("#bead-palette-list")!;

    if (!this.colorPicker || !this.beadPaletteList) {
      throw new Error(
        "No se pudieron encontrar los elementos necesarios en el DOM",
      );
    }

    this.cleanupFns.push(effect(this.renderPaletteList.bind(this)));

    this.cleanupFns.push(
      effect(() => {
        this.colorPicker.value = editorStore.activeBead;
      }),
    );

    this.colorPicker.addEventListener("change", this.onAddColor.bind(this));
  }

  renderPaletteList() {
    const beadList = documentStore.beadPalette.map((color) => {
      const isActive = color === editorStore.activeBead;
      const activeClass = isActive ? "outline-2 outline-amber-400" : "";
      const dataUrl = beadToImageUrl(color);
      const button = html`<button
        data-color="${color}"
        class="w-9 inline-flex justify-center rounded-lg transition cursor-pointer ${activeClass}"
        title="${color}"
      >
        <img src="${dataUrl}" />
      </button>`;

      button.addEventListener("click", () => {
        editorStore.activeBead = color;
      });
      return button;
    });

    const container = this.querySelector("#bead-palette-list")!;
    container.innerHTML = "";
    container.append(...beadList);
  }

  onAddColor = (e: Event) => {
    const { target } = e;
    if (!(target instanceof HTMLInputElement)) return;
    const color = target.value;
    if (!color) return;
    if (!documentStore.beadPalette.includes(color)) {
      documentStore.beadPalette = [...documentStore.beadPalette, color];
    }
    editorStore.activeBead = color;
  };
}

customElements.define("bead-palette", BeadPaletteComponent);

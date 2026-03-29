import { html } from "../dom";
import { BeadElement } from "../elements/BeadElement";
import { set } from "../libs/stateManager";
import { documentStore, editorStore } from "../store/store";
import { beadToImageUrl } from "../utils/beadToImageUtils";
import type { ColorPickerComponent } from "./ColorPickerComponent";

const TrashIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 11v6"/>
  <path d="M14 11v6"/>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
  <path d="M3 6h18"/>
  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</svg>`;

const EditIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
</svg>`;

const PaletteIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z"/>
  <path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7"/>
  <path d="M 7 17h.01"/>
  <path d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8"/>
</svg>`;

export class BeadSwatchComponent extends HTMLElement {
  color: string;
  buttonElement!: HTMLButtonElement;
  buttonDeleteElement!: HTMLButtonElement;
  colorPickerComponent!: ColorPickerComponent;
  dialogComponent!: HTMLDialogElement;
  popoverElement!: HTMLDivElement;
  startTime: number = 0;

  constructor(color: string) {
    super();
    this.color = color;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const isActive = this.color === editorStore.activeBead;
    const activeClass = isActive ? "outline-2 outline-amber-400" : "";
    const dataUrl = beadToImageUrl(this.color);

    const colorId = this.color.slice(1);

    this.append(html`
      <button
        data-color="${this.color}"
        class="peer w-9 ${activeClass} inline-flex justify-center transition rounded-lg cursor-pointer"
        title="${this.color}"
        style="anchor-name: --anchor-${colorId}"
      >
        <img src="${dataUrl}" oncontextmenu="return false;" />
      </button>
      <div
        class="md:peer-hover:block md:hover:block z-50 p-0 bg-transparent"
        id="mypopover-${colorId}"
        popover
        style="position-anchor: --anchor-${colorId}; top: anchor(top); left: anchor(start); transform: translate(-100%,0);"
      >
        <div
          class="min-w-44 rounded-xl flex flex-col mr-4 overflow-hidden bg-white shadow"
        >
          <span
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700"
          >
            ${PaletteIcon} ${this.color}
          </span>

          <button
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
            commandfor="color-picker-${colorId}"
            command="show-modal"
          >
            ${EditIcon} Cambiar
            <input type="color" value="${this.color}" class="hidden" />
          </button>
          <button
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors delete-bead"
          >
            ${TrashIcon} Eliminar
          </button>
        </div>
      </div>

      <dialog
        closedby="any"
        id="color-picker-${colorId}"
        class="backdrop:hidden fixed inset-auto mr-4 overflow-visible translate-y-10 bg-transparent border-0"
        style="position-anchor: --anchor-add-bead; bottom: anchor(bottom); right: anchor(left);"
      >
        <color-picker
          id="custom-color-picker"
          value="${this.color}"
        ></color-picker>
      </dialog>
    `);

    this.buttonElement = this.querySelector("button")!;
    this.buttonDeleteElement = this.querySelector(".delete-bead")!;
    this.colorPickerComponent = this.querySelector("color-picker")!;
    this.dialogComponent = this.querySelector("dialog")!;
    this.popoverElement = this.querySelector("[popover]")!;

    this.buttonElement.addEventListener(
      "pointerdown",
      this.onPressStart.bind(this) as EventListener
    );
    this.buttonElement.addEventListener(
      "pointerup",
      this.onPressEnd.bind(this) as EventListener
    );

    this.buttonDeleteElement.addEventListener(
      "click",
      this.deleteBead.bind(this)
    );

    this.colorPickerComponent.addEventListener(
      "color-change",
      this.updateBeadColor.bind(this)
    );
  }

  onPressStart() {
    this.startTime = performance.now();
  }

  onPressEnd() {
    const endTime = performance.now();
    if (endTime - this.startTime > 500) {
      this.popoverElement.togglePopover();
    } else {
      editorStore.activeBead = this.color;
    }
  }

  deleteBead() {
    documentStore.beadPalette = documentStore.beadPalette.filter(
      (bead) => bead !== this.color
    );

    if (editorStore.activeBead === this.color) {
      if (documentStore.beadPalette.length === 0) {
        editorStore.activeBead = "";
      } else {
        editorStore.activeBead = documentStore.beadPalette[0];
      }
    }

    documentStore.elements = set(
      documentStore.elements.filter(
        (element) =>
          !(element instanceof BeadElement && element.color === this.color)
      )
    );
  }

  updateBeadColor() {
    const newColor = this.colorPickerComponent.value;
    const hasColor = documentStore.beadPalette.some(
      (color) => color === newColor
    );
    if (hasColor) return;

    const indexOf = documentStore.beadPalette.findIndex(
      (color) => color === this.color
    );

    documentStore.beadPalette[indexOf] = newColor;
    editorStore.activeBead = newColor;
    this.dialogComponent.close();

    (
      documentStore.elements.filter(
        (element) =>
          element instanceof BeadElement && element.color === this.color
      ) as BeadElement[]
    ).forEach((bead) => {
      bead.color = newColor;
    });
  }
}

customElements.define("bead-preview", BeadSwatchComponent);

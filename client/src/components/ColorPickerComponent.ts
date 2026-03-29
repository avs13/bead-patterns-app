import { html } from "../dom";

export class ColorPickerComponent extends HTMLElement {
  h: number = 0;
  s: number = 1;
  v: number = 1;

  svArea!: HTMLDivElement;
  svCursor!: HTMLDivElement;
  hueSlider!: HTMLInputElement;
  hexInput!: HTMLInputElement;
  colorPreview!: HTMLDivElement;
  swatchContainer!: HTMLDivElement;

  isDraggingSV = false;

  connectedCallback() {
    this.render();
    this.setupEvents();
    this.updateUIFromHSV();
  }

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "value" && oldValue !== newValue) {
      if (newValue) {
        this.setColor(newValue);
      }
    }
  }

  get value(): string {
    const [r, g, b] = hsvToRgb(this.h, this.s, this.v);
    return rgbToHex(r, g, b);
  }

  set value(val: string) {
    this.setAttribute("value", val);
  }

  setColor(hex: string) {
    const [h, s, v] = hexToHsv(hex);
    this.h = h;
    this.s = s;
    this.v = v;
    this.updateUIFromHSV();
  }

  render() {
    this.innerHTML = "";

    this.append(html`
      <div
        class="w-53 bg-amber-50 rounded-2xl p-3 border border-gray-200 shadow-2xl"
      >
        <div class="flex flex-col gap-2.5">
          <div
            class="rounded-xl cursor-crosshair touch-none h-28 relative w-full overflow-hidden shadow-inner select-none"
            id="sv-area"
            style="background-color: #ff0000;"
          >
            <div
              class="bg-linear-to-r from-white to-transparent absolute inset-0 pointer-events-none"
            ></div>
            <div
              class="bg-linear-to-t from-black to-transparent absolute inset-0 pointer-events-none"
            ></div>
            <div
              id="sv-cursor"
              class="absolute w-3 h-3 -mt-1.5 -ml-1.5 transition-transform duration-75 border-2 border-white rounded-full shadow-md pointer-events-none"
              style="top: 0%; left: 100%; box-shadow: 0 0 3px rgba(0,0,0,0.5);"
            ></div>
          </div>
          <div class="relative w-full h-3 rounded-full shadow-inner">
            <input
              type="range"
              id="hue-slider"
              min="0"
              max="360"
              value="0"
              class="touch-none absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              class="absolute inset-0 w-full h-full rounded-full pointer-events-none"
              style="background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);"
            ></div>
            <div
              class="top-1/2 absolute w-4 h-4 -mt-2 transition-transform bg-white border border-gray-200 rounded-full shadow-md pointer-events-none"
              id="hue-cursor"
              style="left: 0%; transform: translateX(-50%);"
            ></div>
          </div>

          <!-- Inputs & Preview -->
          <div class="flex items-center gap-2">
            <div
              id="color-preview"
              class="shrink-0 w-8 h-8 rounded-full shadow-inner"
              style="background-color: #ff0000;"
            ></div>
            <div
              class="bg-gray-50 grow flex items-center h-8 px-2 border border-gray-200 rounded-lg"
            >
              <span class="mr-1 text-xs font-medium text-gray-400">#</span>
              <input
                type="text"
                id="hex-input"
                value="ff0000"
                class="w-full text-xs font-semibold tracking-wide text-gray-700 uppercase bg-transparent outline-none"
                maxlength="6"
              />
            </div>
          </div>

          <button
            id="accept-button"
            class="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold py-1.5 text-sm rounded-xl transition-colors shadow-sm"
          >
            Aceptar
          </button>
        </div>
      </div>
    `);

    this.svArea = this.querySelector("#sv-area")!;
    this.svCursor = this.querySelector("#sv-cursor")!;
    this.hueSlider = this.querySelector("#hue-slider")!;
    this.hexInput = this.querySelector("#hex-input")!;
    this.colorPreview = this.querySelector("#color-preview")!;
    this.hueCursor = this.querySelector("#hue-cursor")!;
  }

  hueCursor!: HTMLDivElement;

  setupEvents() {
    const handleSVPt = (e: PointerEvent) => {
      e.preventDefault();
      const rect = this.svArea.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      this.s = x;
      this.v = 1 - y;
      this.updateUIFromHSV();
    };

    this.svArea.addEventListener("pointerdown", (e) => {
      this.isDraggingSV = true;
      this.svArea.setPointerCapture(e.pointerId);
      handleSVPt(e);
    });

    this.svArea.addEventListener("pointermove", (e) => {
      if (this.isDraggingSV) handleSVPt(e);
    });

    this.svArea.addEventListener("pointerup", (e) => {
      if (this.isDraggingSV) {
        this.isDraggingSV = false;
        this.svArea.releasePointerCapture(e.pointerId);
      }
    });

    this.hueSlider.addEventListener("input", () => {
      this.h = parseFloat(this.hueSlider.value) / 360;
      this.updateUIFromHSV();
    });

    this.hexInput.addEventListener("change", () => {
      const val = this.hexInput.value;
      if (/^[0-9A-Fa-f]{6}$/.test(val)) {
        this.setColor("#" + val);
      } else {
      }
    });

    this.querySelector("#accept-button")!.addEventListener("click", () => {
      this.dispatchColor();
    });
  }

  updateUIFromHSV() {
    if (!this.svArea) return;
    const hex = this.value;

    const [hr, hg, hb] = hsvToRgb(this.h, 1, 1);
    this.svArea.style.backgroundColor = rgbToHex(hr, hg, hb);

    this.svCursor.style.left = `${this.s * 100}%`;
    this.svCursor.style.top = `${(1 - this.v) * 100}%`;

    this.hueSlider.value = (this.h * 360).toString();
    this.hueCursor.style.left = `${this.h * 100}%`;

    this.colorPreview.style.backgroundColor = hex;
    this.hexInput.value = hex.replace("#", "");
  }

  dispatchColor() {
    this.dispatchEvent(
      new CustomEvent("color-change", {
        detail: { color: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0,
    g = 0,
    b = 0;
  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToHsv(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  if (hex.length !== 6) return [0, 1, 1]; // Default to red
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, v];
}

customElements.define("color-picker", ColorPickerComponent);

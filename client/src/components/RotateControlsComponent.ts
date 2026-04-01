import { html } from "../dom";
import { rotateWorld90Degrees } from "../store/actions";

const RotateIcon = /* html */ `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
  <path d="M21 3v5h-5"/>
</svg>`;

export class HistoryControlsComponent extends HTMLElement {
  undoBtn!: HTMLButtonElement;
  redoBtn!: HTMLButtonElement;

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div
        class="bg-amber-50/90 rounded-xl border-amber-100/50 flex items-center gap-1 p-1 border shadow-sm"
      >
        <button
          id="rotate-btn"
          title="Deshacer (Ctrl+Z)"
          class="text-slate-700 hover:bg-amber-100 active:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center p-2 transition-all rounded-lg"
        >
          ${RotateIcon}
        </button>
        <div class="w-px h-4 bg-amber-200/50 mx-0.5"></div>
      </div>
    `);

    this.undoBtn = this.querySelector("#rotate-btn")!;

    this.undoBtn.addEventListener("click", () => {
      console.log("click");
      const appRect = document.querySelector("#app")?.getBoundingClientRect();
      const width = appRect?.width || window.innerWidth;
      const height = appRect?.height || window.innerHeight;
      rotateWorld90Degrees(width, height);
    });
  }
}

customElements.define("rotate-controls", HistoryControlsComponent);

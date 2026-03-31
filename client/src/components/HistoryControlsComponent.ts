import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { historyRedo, historyUndo } from "../store/actions";
import { historyStore } from "../store/store";

const UndoIcon = /* html */ `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 7v6h6" />
  <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
</svg>`;

const RedoIcon = /* html */ `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 7v6h-6" />
  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
</svg>`;

export class HistoryControlsComponent extends HTMLElement {
  cleanupFns: Array<() => void> = [];
  undoBtn!: HTMLButtonElement;
  redoBtn!: HTMLButtonElement;

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.cleanupFns.forEach((fn) => fn());
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div class="flex items-center gap-1 bg-amber-50/90 p-1 rounded-xl shadow-sm border border-amber-100/50">
        <button
          id="undo-btn"
          title="Deshacer (Ctrl+Z)"
          class="p-2 text-slate-700 hover:bg-amber-100 active:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg flex items-center justify-center"
        >
          ${UndoIcon}
        </button>
        <div class="w-px h-4 bg-amber-200/50 mx-0.5"></div>
        <button
          id="redo-btn"
          title="Rehacer (Ctrl+Shift+Z / Ctrl+Y)"
          class="p-2 text-slate-700 hover:bg-amber-100 active:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg flex items-center justify-center"
        >
          ${RedoIcon}
        </button>
      </div>
    `);

    this.undoBtn = this.querySelector("#undo-btn")!;
    this.redoBtn = this.querySelector("#redo-btn")!;

    this.undoBtn.addEventListener("click", () => historyUndo());
    this.redoBtn.addEventListener("click", () => historyRedo());

    this.cleanupFns.push(
      effect(() => {
        this.undoBtn.disabled = historyStore.undoStack.length === 0;
        this.redoBtn.disabled = historyStore.redoStack.length === 0;
      })
    );
  }
}

customElements.define("history-controls", HistoryControlsComponent);

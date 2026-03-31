import { html } from "../dom";
import type { FileMeta } from "../storage/fileStorage";
import {
  applyCenteredTransform,
  deleteDocument,
  loadFilesStore,
  openDocument,
  cloneDocument,
} from "../store/actions";

const VerticalEllipsisIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="1"/>
  <circle cx="12" cy="5" r="1"/>
  <circle cx="12" cy="19" r="1"/>
</svg>`;

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

const CopyIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
</svg>`;

export class FilePreviewComponent extends HTMLElement {
  file: FileMeta;
  activeId: string;
  confirmDeletePopover!: HTMLElement;
  fileRowElement!: HTMLElement;
  deleteButton!: HTMLElement;
  cloneConfirmButton!: HTMLElement;
  confirmClonePopover!: HTMLElement;

  constructor(file: FileMeta, activeId: string) {
    super();
    this.file = file;
    this.activeId = activeId;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const isActive = this.activeId === this.file.id;
    const id = this.file.id;
    this.append(html`
      <div
        id="file-row-${id}"
        class="${isActive
          ? "bg-amber-100"
          : "hover:bg-amber-100/5"} border-amber-100 relative flex items-center gap-3 px-4 py-3 transition-colors border-b cursor-pointer"
      >
        <div
          class="shrink-0 bg-white/50 border-amber-200/50 flex items-center justify-center w-12 h-12 p-1 overflow-hidden border rounded"
        >
          <img
            src="${this.file.thumbnail}"
            class="drop-shadow-sm object-contain max-w-full max-h-full"
            alt="thumbnail"
          />
        </div>
        <div class="grow overflow-hidden">
          <p class="file-name text-sm font-medium text-gray-800 truncate">
            ${this.file.name}
          </p>
          <time class="text-xs text-gray-400"
            >${this.formatDate(this.file.createdAt)}</time
          >
        </div>
        <button
          class="btn-dots shrink-0 p-1.5 rounded-md text-gray-400 hover:bg-amber-200 hover:text-gray-700 active:bg-amber-300 transition-colors"
          popovertarget="mypopover-${this.file.id}"
          style="anchor-name: --anchor-${this.file.id}"
        >
          ${VerticalEllipsisIcon}
        </button>
      </div>
      <div
        class="min-w-44 rounded-xl shadow"
        id="mypopover-${this.file.id}"
        popover
        style="position-anchor: --anchor-${this.file
          .id}; top: anchor(bottom); left: anchor(start);"
      >
        <button
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
        >
          ${EditIcon} Renombrar
        </button>
        <button
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 active:bg-amber-100 transition-colors"
          commandfor="clone-file-${id}"
          command="toggle-popover"
        >
          ${CopyIcon} Duplicar
        </button>
        <button
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
          commandfor="delete-file-${id}"
          command="toggle-popover"
        >
          ${TrashIcon} Eliminar
        </button>

        <div
          id="clone-file-${id}"
          popover
          class="bg-amber-50/90 text-slate-800 rounded-xl shadow-xl backdrop:bg-neutral-900/50 relative p-6 mx-auto mt-40 max-w-sm w-[90vw]"
          open
        >
          <div class="text-center">
            <h3 class="mb-3 text-xl font-bold">
              ¿Deseas duplicar este archivo?
            </h3>
            <p class="text-slate-600 mb-8 font-medium">
              Esto creará una copia de ${this.file.name}.
            </p>
            <div class="flex justify-end gap-4">
              <button
                commandfor="clone-file-${id}"
                command="hide-popover"
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2 font-semibold transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                id="clone-confirm-btn-${id}"
                class="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 px-4 py-2 font-semibold text-white transition-colors rounded-lg shadow-sm"
              >
                Duplicar
              </button>
            </div>
          </div>
        </div>

        <div
          id="delete-file-${id}"
          popover
          class="bg-amber-50/90 text-slate-800 rounded-xl shadow-xl backdrop:bg-neutral-900/50 relative p-6 mx-auto mt-40 max-w-sm w-[90vw]"
          open
        >
          <div class="text-center">
            <h3 class="mb-3 text-xl font-bold">
              ¿Deseas eliminar este archivo?
            </h3>
            <p class="text-slate-600 mb-8 font-medium">
              Esto eliminará ${this.file.name}.
            </p>
            <div class="flex justify-end gap-4">
              <button
                commandfor="delete-file-${id}"
                command="hide-popover"
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2 font-semibold transition-colors shadow-sm"
              >
                Cancelar
              </button>
              <button
                id="delete-btn-${id}"
                class=" bg-amber-500 hover:bg-amber-600 active:bg-amber-700 px-4 py-2 font-semibold text-white transition-colors rounded-lg shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    `);

    this.deleteButton = this.querySelector(`#delete-btn-${id}`)!;
    this.confirmDeletePopover = this.querySelector(`#delete-file-${id}`)!;
    this.fileRowElement = this.querySelector(`#file-row-${id}`)!;
    this.cloneConfirmButton = this.querySelector(`#clone-confirm-btn-${id}`)!;
    this.confirmClonePopover = this.querySelector(`#clone-file-${id}`)!;

    this.deleteButton.addEventListener("click", this.onDelete.bind(this));
    this.fileRowElement.addEventListener("click", this.onOpen.bind(this));
    this.cloneConfirmButton.addEventListener("click", this.onClone.bind(this));
  }

  formatDate(ts: number): string {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "Hace un momento";
    if (m < 60) return `Hace ${m} min`;
    if (h < 24) return `Hace ${h}h`;
    return `Hace ${d} día${d > 1 ? "s" : ""}`;
  }

  onDelete() {
    this.confirmDeletePopover.hidePopover();
    deleteDocument(this.file.id).then(() => loadFilesStore());
  }

  onClone(e: Event) {
    e.stopPropagation();
    this.confirmClonePopover.hidePopover();
    const popover = this.querySelector(
      `#mypopover-${this.file.id}`
    ) as HTMLElement;
    if (popover) popover.hidePopover();
    cloneDocument(this.file.id);
  }

  async onOpen(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".btn-dots")) return;
    await openDocument(this.file.id);
    const appRect = document.querySelector("#app")?.getBoundingClientRect();
    const width = appRect?.width || window.innerWidth;
    const height = appRect?.height || window.innerHeight;
    applyCenteredTransform(width, height);
  }
}

customElements.define("file-preview", FilePreviewComponent);

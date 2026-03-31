import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { documentStore, uiStore } from "../store/store";
import "./SidebarLeftComponent";
import "./ModalNewFileComponent";
import "./HistoryControlsComponent";

const LeftPanelIcon = /* html */ `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="18" x="3" y="3" rx="2" />
  <path d="M9 3v18" />
  <path d="m16 15-3-3 3-3" />
</svg>`;

const PlusIcon = /* html */ `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
  </svg>`;

const SaveIcon = /* html */ `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
  <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
  <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
</svg>`;
export class TopPanelComponent extends HTMLElement {
  cleanupFns: Array<() => void> = [];

  buttonSidebarElement!: HTMLButtonElement;
  buttonNewElement!: HTMLButtonElement;
  buttonSaveFile!: HTMLButtonElement;
  buttonSaveLabel!: HTMLButtonElement;
  fileNameElement!: HTMLElement;

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.cleanupFns.forEach((fn) => fn());
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div class="top-4 left-4 fixed z-10 flex items-center gap-4">
        <button
          id="btn-sidebar-toggle"
          class="bg-amber-50/90 hover:bg-amber-100 active:bg-amber-200 p-2 transition rounded-lg shadow"
        >
          ${LeftPanelIcon}
        </button>
        <button
          class="bg-amber-500/90 hover:bg-amber-600/90 active:bg-amber-200 p-2 transition rounded-lg shadow"
          id="btn-new"
          commandfor="new-proyect-modal"
          command="show-modal"
        >
          ${PlusIcon}
        </button>

        <button
          id="btn-save"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50/90 shadow transition hover:bg-amber-100 active:bg-amber-200 text-sm font-medium"
        >
          ${SaveIcon}
          <span id="save-label">Guardar</span>
        </button>
        <history-controls class="landscape:flex portrait:hidden"></history-controls>
        <h1 id="doc-name" class="text-sm font-semibold"></h1>
        <modal-new-file></modal-new-file>
        <sidebar-left></sidebar-left>
      </div>
    `);

    this.buttonSidebarElement = this.querySelector("#btn-sidebar-toggle")!;
    this.buttonSaveFile = this.querySelector("#btn-save")!;
    this.buttonSaveLabel = this.querySelector("#save-label")!;
    this.buttonNewElement = this.querySelector("#btn-new")!;
    this.fileNameElement = this.querySelector("#doc-name")!;

    if (
      !this.buttonSidebarElement ||
      !this.buttonSaveFile ||
      !this.buttonSaveLabel ||
      !this.buttonNewElement ||
      !this.fileNameElement
    ) {
      throw new Error(
        "No se pudieron encontrar los elementos necesarios en el DOM"
      );
    }

    this.buttonSidebarElement.addEventListener("click", () => {
      uiStore.isSidebarOpen = !uiStore.isSidebarOpen;
    });

    this.buttonSaveFile.addEventListener("click", this.onSave.bind(this));

    this.cleanupFns.push(
      effect(() => {
        if (!documentStore.id) {
          this.buttonNewElement.classList.remove("hidden");
          this.buttonSaveFile.classList.add("hidden");
        } else {
          this.buttonNewElement.classList.add("hidden");
          this.buttonSaveFile.classList.remove("hidden");
        }
      })
    );

    this.cleanupFns.push(
      effect(() => {
        this.fileNameElement.textContent = documentStore.name
          ? documentStore.name
          : "";
      })
    );
  }

  onSave() {
    if (!documentStore.id || !documentStore.name) return;
    this.buttonSaveLabel.textContent = "Guardando...";
     saveDocument().finally(() => {
      this.buttonSaveLabel.textContent = "Guardar";
    });
  }
}

customElements.define("top-panel", TopPanelComponent);

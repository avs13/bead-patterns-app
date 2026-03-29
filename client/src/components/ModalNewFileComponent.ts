import { html } from "../dom";
import { LoomElement } from "../elements/LoomElement";
import { batch, set } from "../libs/stateManager";
import { documentStore, editorStore } from "../store/store";
//import { createNewDocument } from "../store/store";

export class ModalNewFileComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = "";
    this.append(
      html`<dialog
        class="bg-amber-50/90 text-slate-800 rounded-xl p-6 backdrop:bg-neutral-700/90 mx-auto mt-20 relative"
        id="new-proyect-modal"
        closedby="any"
      >
        <button
          class="absolute top-0 right-2 text-2xl"
          commandfor="new-proyect-modal"
          command="close"
        >
          ×
        </button>
        <form>
          <h2 class="text-xl font-semibold mb-4 text-center">
            Crear una nuevo proyecto
          </h2>

          <div class="grid grid-cols-2 gap-2 space-y-2">
            <label class="col-span-2 flex flex-col gap-1 font-medium">
              Nombre del proyecto
              <input
                type="string"
                id="input-name"
                class="h-9 rounded-md border border-amber-200 bg-white/80 px-2 text-[12px] text-slate-700"
                min="1"
              />
            </label>
            <label class="col-span-1 flex flex-col gap-1 font-medium"
              >Columnas
              <input
                type="number"
                id="input-cols"
                class="h-9 rounded-md border border-amber-200 bg-white/80 px-2 text-[12px] text-slate-700"
                value="40"
                min="1"
                max="100"
              />
            </label>
            <label class="col-span-1 flex flex-col gap-1 font-medium"
              >Filas
              <input
                type="number"
                id="input-rows"
                class="h-9 rounded-md border border-amber-200 bg-white/80 px-2 text-[12px] text-slate-700"
                value="12"
                min="1"
                max="100"
              />
            </label>
          </div>

          <div
            id="error-message"
            class="bg-red-100 text-red-700 rounded-lg p-2 mb-2 text-sm hidden"
          >
            El nombre del proyecto es requerido
          </div>

          <button
            type="submit"
            class="p-2 rounded-lg bg-amber-500/90 shadow-lg transition hover:bg-amber-600/90 active:bg-amber-200 w-full"
          >
            Crear
          </button>
        </form>
      </dialog>`,
    );

    const form = this.querySelector("form") as HTMLFormElement;
    form.addEventListener("submit", this.handleCreateProject.bind(this));
  }

  async handleCreateProject(event: Event) {
    event.preventDefault();
    const nameInput = this.querySelector("#input-name") as HTMLInputElement;
    const colsInput = this.querySelector("#input-cols") as HTMLInputElement;
    const rowsInput = this.querySelector("#input-rows") as HTMLInputElement;

    const name = nameInput.value.trim();
    const cols = parseInt(colsInput.value);
    const rows = parseInt(rowsInput.value);

    if (name.length <= 1) {
      return this.showError("El nombre del proyecto es requerido");
    }

    if (!cols || !rows) {
      return this.showError("Las columnas y filas deben ser números válidos");
    }

    batch(() => {
      const id = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      const loom = new LoomElement({ x: 0, y: 0, columns: cols, rows: rows });
      batch(() => {
        documentStore.id = id;
        documentStore.name = name;
        documentStore.elements = set([loom]);
        documentStore.beadPalette = ["#3b82f6"];
        editorStore.activeBead = "#3b82f6";
      });

      // TODO: implementar centrado del loom
    });

    const dialogElement = this.querySelector("dialog") as HTMLDialogElement;
    dialogElement.close();
  }

  showError(message: string) {
    const errorMessageElement = this.querySelector(
      "#error-message",
    ) as HTMLElement;
    errorMessageElement.classList.remove("hidden");
    errorMessageElement.textContent = message;
  }
}

customElements.define("modal-new-file", ModalNewFileComponent);

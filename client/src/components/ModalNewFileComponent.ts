import { html } from "../dom";
import { applyCenteredTransform, createDocument } from "../store/actions";

export class ModalNewFileComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = "";
    this.append(
      html`<dialog
        class="bg-amber-50/90 text-slate-800 rounded-xl backdrop:bg-neutral-700/90 relative p-6 mx-auto mt-20"
        id="new-proyect-modal"
        closedby="any"
      >
        <button
          class="right-2 absolute top-0 text-2xl"
          commandfor="new-proyect-modal"
          command="close"
        >
          ×
        </button>
        <form>
          <h2 class="mb-4 text-xl font-semibold text-center">
            Crear una nuevo proyecto
          </h2>

          <div class="grid grid-cols-2 gap-2 space-y-2">
            <label class="flex flex-col col-span-2 gap-1 font-medium">
              Nombre del proyecto
              <input
                type="string"
                id="input-name"
                class="h-9 rounded-md border border-amber-200 bg-white/80 px-2 text-[12px] text-slate-700"
                min="1"
              />
            </label>
            <label class="flex flex-col col-span-1 gap-1 font-medium"
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
            <label class="flex flex-col col-span-1 gap-1 font-medium"
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
            class="hidden p-2 mb-2 text-sm text-red-700 bg-red-100 rounded-lg"
          >
            El nombre del proyecto es requerido
          </div>

          <button
            type="submit"
            class="bg-amber-500/90 hover:bg-amber-600/90 active:bg-amber-200 w-full p-2 transition rounded-lg shadow-lg"
          >
            Crear
          </button>
        </form>
      </dialog>`
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

    createDocument({
      name,
      cols,
      rows,
    });
    
    const appRect = document.querySelector("#app")?.getBoundingClientRect();
    const width = appRect?.width || window.innerWidth;
    const height = appRect?.height || window.innerHeight;

    applyCenteredTransform(width, height);

    const dialogElement = this.querySelector("dialog") as HTMLDialogElement;
    dialogElement.close();
  }

  showError(message: string) {
    const errorMessageElement = this.querySelector(
      "#error-message"
    ) as HTMLElement;
    errorMessageElement.classList.remove("hidden");
    errorMessageElement.textContent = message;
  }
}

customElements.define("modal-new-file", ModalNewFileComponent);

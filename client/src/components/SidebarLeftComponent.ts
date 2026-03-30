import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { uiStore } from "../store/store";
import "./SidebarLeftComponent";

const NewIcon = /* html */ `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
</svg>`;

export class SidebarLeftComponent extends HTMLElement {
  backdropElement!: HTMLElement;
  sidebarElement!: HTMLElement;
  newProjectElement!: HTMLElement;

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div class="top-4 left-4 fixed z-10 flex items-center gap-4">
        <div
          class="bg-gray-700/50 fixed inset-0 z-10 transition-opacity duration-300 opacity-0 pointer-events-none"
          id="backdrop-sidebar"
        ></div>
        <sidebar
          class="bg-amber-50 fixed top-0 left-0 z-10 flex flex-col w-64 h-full transition-transform duration-300 -translate-x-full"
          id="sidebar"
        >
          <div class="border-slate-200 p-3 border-b">
            <span class="font-semibold">Proyectos</span>
          </div>

          <button
            class="text-sm flex text-slate-800 items-center gap-2.5 hover:bg-amber-100/50 active:bg-amber-100 py-2 my-1 mx-2 px-4 rounded-xl transition-colors"
            commandfor="new-proyect-modal"
            command="show-modal"
          >
            ${NewIcon} Nuevo Proyecto
          </button>
          <div class="grow overflow-y-auto" id="files-list-sidebar"></div>

          <div class="border-slate-200 px-4 py-3 border-t">
            <p class="text-slate-400 text-xs text-center">
              Powered by odbustillo
            </p>
          </div>
        </sidebar>
      </div>
    `);

    this.backdropElement = this.querySelector("#backdrop-sidebar")!;
    this.sidebarElement = this.querySelector("sidebar")!;
    this.newProjectElement = this.querySelector(
      "[commandfor='new-proyect-modal']"
    )!;

    this.backdropElement.addEventListener(
      "click",
      () => (uiStore.isSidebarOpen = false)
    );

    this.newProjectElement.addEventListener("click", () => {
      uiStore.isSidebarOpen = false;
    });

    effect(() => {
      uiStore.isSidebarOpen ? this.openSidebar() : this.closeSidebar();
    });
  }

  openSidebar() {
    this.backdropElement.classList.remove("opacity-0", "pointer-events-none");
    this.sidebarElement.classList.remove("-translate-x-full");
  }

  closeSidebar() {
    this.backdropElement.classList.add("opacity-0", "pointer-events-none");
    this.sidebarElement.classList.add("-translate-x-full");
  }
}

customElements.define("sidebar-left", SidebarLeftComponent);

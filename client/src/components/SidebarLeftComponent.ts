import { html } from "../dom";
import { effect } from "../libs/stateManager";
import { uiStore } from "../store/store";
import "./SidebarLeftComponent";

export class SidebarLeftComponent extends HTMLElement {
  backdropElement!: HTMLElement;
  sidebarElement!: HTMLElement;

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
          <div class="grow overflow-y-auto" id="files-list-sidebar"></div>

          <div class="border-slate-200 px-4 py-3 border-t">
            <p class="text-slate-400 text-xs text-center">
              Powered by odbustillo
            </p>
          </div>
        </sidebar>
      </div>
    `);

    // TODO: implementar mostrar los documentos

    this.backdropElement = this.querySelector("#backdrop-sidebar")!;
    this.sidebarElement = this.querySelector("sidebar")!;

    this.backdropElement.addEventListener(
      "click",
      () => (uiStore.isSidebarOpen = false),
    );

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

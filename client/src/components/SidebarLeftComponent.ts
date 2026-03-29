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
      <div class="z-10 fixed top-4 left-4 flex gap-4 items-center">
        <div
          class="z-10 fixed inset-0 bg-gray-700/50 transition-opacity duration-300 opacity-0 pointer-events-none"
          id="backdrop-sidebar"
        ></div>
        <sidebar
          class="flex flex-col z-10 fixed top-0 left-0 h-full w-64 bg-amber-50 transition-transform duration-300 -translate-x-full"
          id="sidebar"
        >
          <div class="p-3 border-b border-slate-200">
            <span class="font-semibold">Proyectos</span>
          </div>
          <div class="overflow-y-auto grow" id="files-list-sidebar"></div>

          <div class="px-4 py-3 border-t border-slate-200">
            <p class="text-xs text-slate-400 text-center">
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

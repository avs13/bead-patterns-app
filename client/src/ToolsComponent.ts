import { html } from "./dom";
import { Tool } from "./types";

const PencilIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
</svg>`;

const HandIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
  <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
  <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
  <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
</svg>`;

const EraserIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21" />
  <path d="m5.082 11.09 8.828 8.828" />
</svg>`;

const PaintBucketIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11 7 6 2" />
  <path d="M18.992 12H2.041" />
  <path d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595" />
  <path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33" />
</svg>`;

const SelectIcon = /* html */ `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
</svg>`;

const tools = [
  {
    tool: Tool.DRAW,
    icon: PencilIcon,
  },
  {
    tool: Tool.MOVE,
    icon: HandIcon,
  },
  {
    tool: Tool.SELECT,
    icon: SelectIcon,
  },
  {
    tool: Tool.ERASE,
    icon: EraserIcon,
  },
  {
    tool: Tool.FILL,
    icon: PaintBucketIcon,
  },
];

export class ToolsComponent extends HTMLElement {
  activeTool: Tool = Tool.SELECT;
  
  private handleToolChange = (event: Event) => {
    const detail = (event as CustomEvent<{ tool: Tool }>).detail;
    if (!detail?.tool || this.activeTool === detail.tool) return;
    this.activeTool = detail.tool;
    this.render();
  };

  connectedCallback() {
    window.addEventListener("toolchange", this.handleToolChange);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("toolchange", this.handleToolChange);
  }

  render() {
    this.innerHTML = "";
    this.append(html`
      <div
        class="fixed bg-amber-50/90 text-slate-800 shadow-lg rounded-xl px-2 py-2 portrait:bottom-4 portrait:left-1/2 portrait:-translate-x-1/2 landscape:top-1/2 landscape:left-4 landscape:-translate-y-1/2"
      >
        <ul class="flex gap-2 portrait:flex-row landscape:flex-col">
          ${tools
            .map((tool) => {
              const dataAttr = tool.tool ? `data-tool="${tool.tool}"` : "";
              const isActive = tool.tool === this.activeTool;
              const activeClass = isActive
                ? "bg-amber-100 shadow-sm"
                : "hover:bg-amber-100 active:bg-amber-200";
              return `<li ${dataAttr} class="w-10 h-10 flex items-center justify-center rounded-lg transition cursor-pointer ${activeClass}">
                <span class="text-slate-700">${tool.icon}</span>
              </li>`;
            })
            .join("")}
        </ul>
      </div>
    `);

    this.querySelectorAll("[data-tool]").forEach((item) => {
      item.addEventListener("click", () => {
        const toolValue = item.getAttribute("data-tool") as Tool | null;
        if (!toolValue) return;
        this.activeTool = toolValue;
        this.render();
        this.dispatchEvent(
          new CustomEvent("toolchange", {
            detail: { tool: toolValue },
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }
}

customElements.define("tools-component", ToolsComponent);

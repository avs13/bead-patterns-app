import { Action, Tool } from "../types";
import type { CanvasEditor } from "../CanvasEditor";
import { ImageElement } from "../elements/ImageElement";
import type { CanvasHandler } from "../handlers/CanvasHandler";
import { canvasToWorld, rotatePoint, screenToCanvas } from "../utils/transformUtils";

interface Vec2 {
  x: number;
  y: number;
}

export class ImageHandler implements CanvasHandler {
  canvasEditor: CanvasEditor;
  private activeImage: ImageElement | null = null;
  private dragOffset: Vec2 | null = null;
  
  private activeHandle: string | null = null;
  private initialScale: number = 1;
  private initialRotation: number = 0;
  private initialPos: Vec2 = { x: 0, y: 0 };
  private initialWorldPoint: Vec2 = { x: 0, y: 0 };

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    
    canvasEditor.canvas.addEventListener(
      "pointerdown",
      this.onPointerDown.bind(this)
    );
    canvasEditor.canvas.addEventListener(
      "pointermove",
      this.onPointerMove.bind(this)
    );
    window.addEventListener("pointerup", this.onPointerUp.bind(this));
  }

  private onPointerDown(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.NONE) return;
    if (this.canvasEditor.state.activeTool !== Tool.IMAGE) return;

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state.transform);
    
    const images = this.canvasEditor.document.elements.filter(
      (el): el is ImageElement => el instanceof ImageElement
    );

    for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        const handle = this.findHandleAt(img, worldPoint);
        
        if (handle) {
            this.canvasEditor.state.action = Action.IMAGE;
            this.activeImage = img;
            this.activeHandle = handle;
            this.initialScale = img.scale;
            this.initialRotation = img.rotation;
            this.initialPos = { x: img.x, y: img.y };
            this.initialWorldPoint = worldPoint;
            return;
        }
    }

    const hit = this.findImageAt(worldPoint);
    if (!hit) return;

    this.canvasEditor.state.action = Action.IMAGE;
    this.activeImage = hit;
    this.activeHandle = null; 
    this.dragOffset = {
      x: worldPoint.x - hit.x,
      y: worldPoint.y - hit.y,
    };
  }

  private onPointerMove(e: PointerEvent) {
    if (this.canvasEditor.state.action !== Action.IMAGE) return;
    if (!this.activeImage) return;

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const pos = screenToCanvas({ x: e.clientX, y: e.clientY }, rect);
    const worldPoint = canvasToWorld(pos, this.canvasEditor.state.transform);

    if (this.activeHandle === "rot") {
        this.rotateImage(worldPoint);
        return;
    }

    if (this.activeHandle) {
        this.resizeProportionally(worldPoint);
        return;
    }

    if (this.dragOffset) {
        this.activeImage.x = worldPoint.x - this.dragOffset.x;
        this.activeImage.y = worldPoint.y - this.dragOffset.y;
    }
  }

  private rotateImage(worldPoint: Vec2) {
    if (!this.activeImage) return;
    const cx = this.activeImage.x + this.activeImage.width / 2;
    const cy = this.activeImage.y + this.activeImage.height / 2;
    
    const angle = Math.atan2(worldPoint.y - cy, worldPoint.x - cx);
    if (!this.initialWorldPoint) return;
    const startAngle = Math.atan2(this.initialWorldPoint.y - cy, this.initialWorldPoint.x - cx);
    
    this.activeImage.rotation = this.initialRotation + (angle - startAngle);
  }

  private resizeProportionally(worldPoint: Vec2) {
    if (!this.activeImage || !this.activeHandle) return;

    const img = this.activeImage;
    const diff = { x: worldPoint.x - this.initialWorldPoint.x, y: worldPoint.y - this.initialWorldPoint.y };
    const localDiff = rotatePoint(diff, -img.rotation);
    const dx = localDiff.x;
    
    const origW = img.bitmap.width;
    const origH = img.bitmap.height;
    const initialWidth = origW * this.initialScale;

    let scaleFactor = 1;

    if (this.activeHandle === "br" || this.activeHandle === "tr") {
        const newW = initialWidth + dx;
        scaleFactor = newW / initialWidth;
    } else if (this.activeHandle === "tl" || this.activeHandle === "bl") {
        const newW = initialWidth - dx;
        scaleFactor = newW / initialWidth;
    }

    const nextScale = Math.max(0.01, this.initialScale * scaleFactor);
    img.scale = nextScale;
    const moveScale = (nextScale - this.initialScale) / 2;
    let offsetX = origW * moveScale;
    let offsetY = origH * moveScale;
    
    let centerMoveLocal = { x: 0, y: 0 };
    if (this.activeHandle === "br") centerMoveLocal = { x: 1, y: 1 };
    else if (this.activeHandle === "tl") centerMoveLocal = { x: -1, y: -1 };
    else if (this.activeHandle === "tr") centerMoveLocal = { x: 1, y: -1 };
    else if (this.activeHandle === "bl") centerMoveLocal = { x: -1, y: 1 };
    
    const centerMoveWorld = rotatePoint({ x: centerMoveLocal.x * offsetX, y: centerMoveLocal.y * offsetY }, img.rotation);
    img.x = this.initialPos.x + centerMoveWorld.x - (origW * (nextScale - this.initialScale))/2;
    img.y = this.initialPos.y + centerMoveWorld.y - (origH * (nextScale - this.initialScale))/2;
  }

  private onPointerUp() {
    if (this.canvasEditor.state.action !== Action.IMAGE) return;
    this.canvasEditor.state.action = Action.NONE;
    this.activeHandle = null;
    this.dragOffset = null;
    this.activeImage = null;
  }

  private findHandleAt(image: ImageElement, point: Vec2): string | null {
    const zoom = this.canvasEditor.state.transform.zoom;
    const handleSize = 10 / zoom;
    const { x, y, width, height, rotation } = image;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const local = rotatePoint({ x: point.x - cx, y: point.y - cy }, -rotation);
    const rx = -width / 2;
    const ry = -height / 2;

    const isNearPoint = (hx: number, hy: number, size = handleSize) => {
        return local.x >= hx - size/2 && local.x <= hx + size/2 &&
               local.y >= hy - size/2 && local.y <= hy + size/2;
    };

    if (isNearPoint(rx, ry)) return "tl";
    if (isNearPoint(rx + width, ry)) return "tr";
    if (isNearPoint(rx, ry + height)) return "bl";
    if (isNearPoint(rx + width, ry + height)) return "br";
    
    const rotDist = 24 / zoom;
    if (isNearPoint(0, ry - rotDist, handleSize * 1.5)) return "rot";
    
    return null;
  }

  private findImageAt(point: Vec2) {
    const images = this.canvasEditor.document.elements.filter(
      (element): element is ImageElement => element instanceof ImageElement
    );
    for (let i = images.length - 1; i >= 0; i -= 1) {
      const img = images[i];
      const cx = img.x + img.width / 2;
      const cy = img.y + img.height / 2;
      const local = rotatePoint({ x: point.x - cx, y: point.y - cy }, -img.rotation);
      if (
        local.x >= -img.width / 2 &&
        local.x <= img.width / 2 &&
        local.y >= -img.height / 2 &&
        local.y <= img.height / 2
      ) {
        return img;
      }
    }
    return null;
  }
}

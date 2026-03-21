import type { CanvasEditor, CanvasState } from "../CanvasEditor";
import type { CanvasHandler } from "./CanvasHandler";

interface Vec2 {
  x: number;
  y: number;
}

export class PinchTransformHandler implements CanvasHandler {
  startTouch1: Vec2 | null = null;
  startTouch2: Vec2 | null = null;
  startPinchAngle: number | null = null;
  startCanvasRotation : number| null = null;
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    canvasEditor.canvas.addEventListener("touchstart", this.onStart.bind(this));
    canvasEditor.canvas.addEventListener("touchmove", this.onMove.bind(this));
    canvasEditor.canvas.addEventListener("touchend", this.onEnd.bind(this));
  }

  onStart(e: TouchEvent) {
    if (e.touches.length !== 2) return;

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const t1 = e.touches[0];
    const t2 = e.touches[1];

    this.startTouch1 = this.toLocalPoint(t1, rect);
    this.startTouch2 = this.toLocalPoint(t2, rect);
    this.startPinchAngle = this.angle(this.startTouch1, this.startTouch2);
    this.startCanvasRotation = this.canvasEditor.state.rotation;
  }

  onMove(e: TouchEvent) {
    if (
      e.touches.length !== 2 ||
      !this.startTouch1 ||
      !this.startTouch2 ||
      this.startPinchAngle == null
      || this.startCanvasRotation == null
    ) {
      return;
    }

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const prevState = { ...this.canvasEditor.state };

    const newPos1 = this.toLocalPoint(t1, rect);
    const newPos2 = this.toLocalPoint(t2, rect);
    const initialDistance = this.distance(this.startTouch1, this.startTouch2);
    const currentDistance = this.distance(newPos1, newPos2);
    const midpoint = {
      x: (newPos1.x + newPos2.x) / 2,
      y: (newPos1.y + newPos2.y) / 2,
    };
    const anchorWorld = this.screenToWorld(midpoint, prevState);

    const scaleFactor = currentDistance / initialDistance;
    const nextScale = this.canvasEditor.state.zoom * scaleFactor;

    this.canvasEditor.state.zoom = nextScale;

    const snapThreshold = (5 * Math.PI) / 180; // ±5 grados de tolerancia

    const canvasAngle = this.normalize(
      this.startCanvasRotation +
        this.angle(newPos1, newPos2) -
        this.startPinchAngle,
    )!;

    const remainder = canvasAngle % (Math.PI / 2);
    if (remainder <= snapThreshold) {
      const rotation = Math.floor(canvasAngle / (Math.PI / 2)) * (Math.PI / 2);
      this.canvasEditor.state.rotation = rotation;
    } else if (remainder >= Math.PI / 2 - snapThreshold) {
      const rotation = Math.ceil(canvasAngle / (Math.PI / 2)) * (Math.PI / 2);
      this.canvasEditor.state.rotation = rotation;
    } else {
      this.canvasEditor.state.rotation = canvasAngle;
    }

    const nextTranslation = this.translationForAnchor(
      anchorWorld,
      midpoint,
      this.canvasEditor.state,
    );
    this.canvasEditor.state.x = nextTranslation.x;
    this.canvasEditor.state.y = nextTranslation.y;

    this.startTouch1 = newPos1;
    this.startTouch2 = newPos2;
  }

  onEnd() {
    this.startTouch1 = null;
    this.startTouch2 = null;
    this.startPinchAngle = null;
  }

  private toLocalPoint(touch: Touch, rect: DOMRect) {
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  private distance(a: Vec2, b: Vec2) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }

  private angle(a: Vec2, b: Vec2) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  
   private normalize(angle: number): number {
    const TWO_PI = Math.PI * 2;
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
   }
  
  private screenToWorld(
    point: Vec2,
    state: CanvasState = this.canvasEditor.state,
  ) {
    const local = this.rotatePoint(
      { x: point.x + state.x, y: point.y + state.y },
      -state.rotation,
    );
    return {
      x: local.x / state.zoom,
      y: local.y / state.zoom,
    };
  }

  private translationForAnchor(
    worldPoint: Vec2,
    screenPoint: Vec2,
    state: CanvasState,
  ) {
    const local = this.rotatePoint(
      { x: worldPoint.x * state.zoom, y: worldPoint.y * state.zoom },
      state.rotation,
    );
    return {
      x: local.x - screenPoint.x,
      y: local.y - screenPoint.y,
    };
  }

  private rotatePoint(point: Vec2, angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos,
    };
  }


 
}

import type { CanvasEditor } from "../CanvasEditor";
import { Action, Tool, type Vec2 } from "../types";
import type { CanvasHandler } from "./CanvasHandler";
import {
  canvasToWorld,
  screenToCanvas,
  translationForAnchor,
} from "../utils/transformUtils";
import { angle, distance, normalizeAngle } from "../utils/vectorUtils";

export class PinchTransformHandler implements CanvasHandler {
  startTouch1: Vec2 | null = null;
  startTouch2: Vec2 | null = null;
  startPinchAngle: number | null = null;
  startCanvasRotation: number | null = null;
  canvasEditor: CanvasEditor;

  constructor(canvasEditor: CanvasEditor) {
    this.canvasEditor = canvasEditor;
    canvasEditor.canvas.addEventListener("touchstart", this.onStart.bind(this));
    canvasEditor.canvas.addEventListener("touchmove", this.onMove.bind(this));
    canvasEditor.canvas.addEventListener("touchend", this.onEnd.bind(this));
  }

  onStart(e: TouchEvent) {
    if (e.touches.length !== 2) return;
    if (
      this.canvasEditor.state.activeTool !== Tool.MOVE ||
      this.canvasEditor.state.action !== Action.NONE
    )
      return;
    this.canvasEditor.state.action = Action.PINCH;
    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const t1 = e.touches[0];
    const t2 = e.touches[1];

    this.startTouch1 = screenToCanvas({ x: t1.clientX, y: t1.clientY }, rect);
    this.startTouch2 = screenToCanvas({ x: t2.clientX, y: t2.clientY }, rect);
    this.startPinchAngle = angle(this.startTouch1, this.startTouch2);
    this.startCanvasRotation = this.canvasEditor.state.transform.rotation;
  }

  onMove(e: TouchEvent) {
    if (
      e.touches.length !== 2 ||
      !this.startTouch1 ||
      !this.startTouch2 ||
      this.startPinchAngle == null ||
      this.startCanvasRotation == null
    ) {
      return;
    }
    if (this.canvasEditor.state.action !== Action.PINCH) return;

    const rect = this.canvasEditor.canvas.getBoundingClientRect();
    const t1 = e.touches[0];
    const t2 = e.touches[1];

    const prevState = { ...this.canvasEditor.state };

    const newPos1 = screenToCanvas({ x: t1.clientX, y: t1.clientY }, rect);
    const newPos2 = screenToCanvas({ x: t2.clientX, y: t2.clientY }, rect);
    const initialDistance = distance(this.startTouch1, this.startTouch2);
    const currentDistance = distance(newPos1, newPos2);
    const midpoint = {
      x: (newPos1.x + newPos2.x) / 2,
      y: (newPos1.y + newPos2.y) / 2,
    };
    const anchorWorld = canvasToWorld(midpoint, prevState.transform);

    const scaleFactor = currentDistance / initialDistance;
    const nextScale = this.canvasEditor.state.transform.zoom * scaleFactor;

    this.canvasEditor.state.transform.zoom = nextScale;

    const snapThreshold = (5 * Math.PI) / 180; // ±5 grados de tolerancia

    const canvasAngle = normalizeAngle(
      this.startCanvasRotation + angle(newPos1, newPos2) - this.startPinchAngle,
    );

    const remainder = canvasAngle % (Math.PI / 2);
    if (remainder <= snapThreshold) {
      const rotation = Math.floor(canvasAngle / (Math.PI / 2)) * (Math.PI / 2);
      this.canvasEditor.state.transform.rotation = rotation;
    } else if (remainder >= Math.PI / 2 - snapThreshold) {
      const rotation = Math.ceil(canvasAngle / (Math.PI / 2)) * (Math.PI / 2);
      this.canvasEditor.state.transform.rotation = rotation;
    } else {
      this.canvasEditor.state.transform.rotation = canvasAngle;
    }

    const nextTranslation = translationForAnchor(
      anchorWorld,
      midpoint,
      this.canvasEditor.state.transform,
    );
    this.canvasEditor.state.transform.x = nextTranslation.x;
    this.canvasEditor.state.transform.y = nextTranslation.y;

    this.startTouch1 = newPos1;
    this.startTouch2 = newPos2;
  }

  onEnd() {
    if (this.canvasEditor.state.action !== Action.PINCH) return;
    this.canvasEditor.state.action = Action.NONE;

    this.startTouch1 = null;
    this.startTouch2 = null;
    this.startPinchAngle = null;
  }
}

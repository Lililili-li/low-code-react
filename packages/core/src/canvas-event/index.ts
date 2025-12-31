import { ComponentSchema } from "@/types";

export default class CanvasEvent {
  updateCurrentCmp: (cmp: ComponentSchema) => void;

  constructor(updateCurrentCmp: (cmp: ComponentSchema) => void) {
    this.updateCurrentCmp = updateCurrentCmp;
  }

  lockComponent(currentCmp: ComponentSchema, value: boolean) {
    this.updateCurrentCmp({ ...currentCmp, lock: value });
  }

  hideComponent(currentCmp: ComponentSchema, value: boolean) {
    this.updateCurrentCmp({ ...currentCmp, visible: value });
  }
}
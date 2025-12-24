import { ChartBarVerticalMeta } from "./chart/bar-vertical/schema";

const materialCmp = {
  'chart-bar-vertical': ChartBarVerticalMeta,
} as const;

export type MaterialType = keyof typeof materialCmp;

export default materialCmp;

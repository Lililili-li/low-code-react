import { ChartBarVerticalMeta } from "./chart/bar-vertical/schema";
import { TextMeta } from "./typography/common/text/schema";
import { TextData1Meta } from "./typography/data/text1/schema";

const materialCmp = {
  'chart-bar-vertical': ChartBarVerticalMeta,
  'text': TextMeta,
  'text-data-1': TextData1Meta
} as const;

export type MaterialType = keyof typeof materialCmp;

export default materialCmp;

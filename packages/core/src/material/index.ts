import { ChartBarVerticalMeta } from "./chart/bar-vertical/schema";
import { EChartsOption } from "echarts";
import { FC } from "react";
import { ComponentSchema } from "../types";

interface MaterialMeta {
  component: FC<{ option?: EChartsOption }>; // 组件渲染实例
  propsPanel: FC<{ bindVariable?: (props: { name: number }) => React.ReactNode, schema?: ComponentSchema, updateSchema?: (updates: Partial<ComponentSchema>) => void }>; // 组件属性设置面板
  schema: ComponentSchema;
}

const materialCmp: Record<string, MaterialMeta> = {
  'chart-bar-vertical': ChartBarVerticalMeta,
};

export default materialCmp;

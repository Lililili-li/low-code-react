import { CSSProperties } from "react";
export interface ComponentSchema {
  id: string;                    // 组件唯一标识
  name: string;                  // 组件名称
  // props?: ChartPropsSchema;      // 组件属性
  props?: {};      // 组件属性
  events?: EventBind[];          // 事件绑定
  style?: CSSProperties;         // 样式
  visible: boolean;              // 是否隐藏
  lock: boolean;                 // 是否锁定
  className?: string;            // 样式类名
}

export interface EventBind {
  name: string;
  handler: () => void;
}


export interface PageSchema {
  width: number;
  height: number;
  id?: string;
  name?: string;
  background: {
    useType: '1' | '2',
    color: string,
    image: string,
  },
  adapterType: '1' | '2' | '3' | '4' | '5',
  filter?: {
    open?: boolean,
    contrast?: number,
    saturation?: number,
    brightness?: number,
    opacity?: number,
  },
  globalHeaders: string,
  globalCss: string,
  components: ComponentSchema[];
}

import { CSSProperties } from "react";

export interface ComponentSchema {
  id: string;                    // 组件唯一标识
  type: string;                  // 组件类型 (Button, Input, Container...)
  props: Record<string, any>;    // 组件属性
  children?: ComponentSchema[];  // 子组件
  events?: EventBind[];       // 事件绑定
  style?: CSSProperties;         // 样式
  hidden?: boolean;              // 是否隐藏
}

export interface EventBind {
  name: string;
  handler: () => void;
}

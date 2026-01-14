import { CSSProperties } from "react";

export interface ExtendedCSSProperties extends CSSProperties {
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  skewX?: number;
  skewY?: number;
  scale?: number;
}

export interface AnimationConfig {
  enable?: boolean;
  name?: string;
  duration?: number;
  delay?: number;
  iterationCount?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  speed?: '' | 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export type VisibleConfig = {
  type: 'JsExpression' | 'normal',
  value: string | boolean
}

export interface ComponentSchema {
  id: string;                    // 组件唯一标识
  type?: string;                  // 组件类型
  group?: boolean                // 是否为分组
  name: string;                  // 组件名称
  props?: {};                    // 组件属性
  events?: EventBind[];          // 事件绑定
  style?: ExtendedCSSProperties; // 样式
  visibleProp: VisibleConfig;              // 是否隐藏
  lock: boolean;                 // 是否锁定
  animation?: AnimationConfig
  className: string;            // 样式类名
  children?: ComponentSchema[]   // 分组下的组件
  state: Record<string, any>
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
  state: Record<string, any>
}

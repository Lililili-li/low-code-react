import { ComponentSchema } from "@/types";
import ReactComponent from ".";
import ReactComponentProps from './Props'

export interface ReactCodePropsSchema extends ComponentSchema {
  props: {
    option: Record<string, any>
  }
}


export const ReactCodeMeta = {
  component: ReactComponent,
  propsPanel: ReactComponentProps,
  schema: {
    style: {
      width: 500,
      height: 300,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      skewX: 0,
      skewY: 0,
      scale: 1,
    },
    visibleProp: {
      type: 'normal',
      value: true,
    },
    lock: false,
    animation: undefined,
    props: {
      option: {
        code: `const demo = () => (
          <div>demo</div>
        )`
      }
    },
    className: ''
  } as Pick<ReactCodePropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}
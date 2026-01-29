import { ComponentSchema } from '@/types';
import TextProps from './Props'
import Text from './index'

export interface TimeTextPropsSchema extends ComponentSchema {
  props: {
    option?: {
      format: string;
      font: {
        fontSize: number,
        color: string,
        fontWeight: string,
      },
    };
  },
}

export const defaultOption = {
  format: 'YYYY-MM-DD  HH:mm:ss',
  font: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'normal',
  },
}

export const TimeTextMeta = {
  component: Text,
  propsPanel: TextProps,
  schema: {
    style: {
      width: 250,
      height: 50,
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
      option: defaultOption,
    },
    className: '',
  } as Pick<TimeTextPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}
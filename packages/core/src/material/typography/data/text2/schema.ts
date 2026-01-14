import { ComponentSchema } from '@/types';
import TextProps from './Props'
import Text from './index'

export interface TextPropsSchema extends ComponentSchema {
  props: {
    option?: {
      text: string;
      font: {
        fontSize: number,
        color: string,
        fontWeight: string,
        fontFamily: string,
        lineHeight: number,
        opacity: number,
        textAlign: string,
      },
      isEllipsis: boolean
    };
    dataType?: '1' | '2'; // 1: 静态数据, 2: 动态数据
    variable?: string
  },
  state: Record<string, any>
}

export const defaultOption = {
  text: 'Hello World',
  font: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'normal',
    fontFamily: 'Arial',
    lineHeight: 2,
    opacity: 1,
    textAlign: 'center',
  },
  isEllipsis: false
}

export const TextMeta = {
  component: Text,
  propsPanel: TextProps,
  schema: {
    style: {
      width: 100,
      height: 40,
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
      dataType: '1',
      variable: ''
    },
  } as Pick<TextPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation'>
}
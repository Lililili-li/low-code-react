import { ComponentSchema } from '@/types';
import TextProps from './Props'
import Text from './index'

export interface TextPropsSchema extends ComponentSchema {
  props: {
    option?: {
      text: string;
      title: string
      titleFont: {
        fontSize: number,
        color: string,
        fontWeight: string,
        fontFamily: string,
        lineHeight: number,
        opacity: number,
        textAlign: string,
      },
      textFont: {
        isMonyFormat: boolean,
        decimals: string,
        fontSize: number,
        color: string,
        fontWeight: string,
      },
      unit: {
        content: string,
        fontSize: number,
        color: string,
        fontWeight: string,
      }
    };
    dataType?: '1' | '2'; // 1: 静态数据, 2: 动态数据
    variable?: string
  },
  state: Record<string, any>
}

export const defaultOption = {
  text: '1000',
  title: '总人数',
  titleFont: {
    fontSize: 40,
    color: '#a29bfe',
    fontWeight: 'bold',
    fontFamily: 'Arial',
    lineHeight: 2,
    opacity: 1,
    textAlign: 'center',
  },
  textFont: {
    fontSize: 35,
    color: '#a29bfe',
    fontWeight: 'bold',
    isMonyFormat: false, // 金钱格式，分割
    decimals: '0', // 金钱格式，小数位
  },
  unit: {
    content: '',
    fontSize: 24,
    color: '#a29bfe',
    fontWeight: 'bold',
  }
}

export const TextData1Meta = {
  component: Text,
  propsPanel: TextProps,
  schema: {
    style: {
      width: 444,
      height: 294,
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
    className: '',
  } as Pick<TextPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}
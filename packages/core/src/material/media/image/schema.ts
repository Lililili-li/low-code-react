import { ComponentSchema } from '@/types';
import ImageProps from './Props'
import Image from './index'

export interface ImagePropsSchema extends ComponentSchema {
  props: {
    option?: {
      url: string;
      open: boolean
      fitCover: string,
      animationName: 'clockwise' | 'anticlockwise' | 'breath' | 'scale' | 'visible' | string,
      time: string
      duration: string
    };
    dataType?: '1' | '2'; // 1: 静态数据, 2: 动态数据
    variable?: string
  },
  state: Record<string, any>
}

export const defaultOption = {
  url: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/photo.png',
  open: false,
  fitCover: 'cover',
  animationName: 'clockwise',
  time: '-1',
  duration: '3',
}

export const ImageMeta = {
  component: Image,
  propsPanel: ImageProps,
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
      option: defaultOption,
      dataType: '1',
      variable: ''
    },
    className: '',
  } as Pick<ImagePropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}
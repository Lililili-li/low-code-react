import { ComponentSchema } from '@/types';
import VideoProps from './Props'
import Video from './index'

export interface VideoPropsSchema extends ComponentSchema {
  props: {
    option?: {
      url: string;
      autoPlay: boolean
      loop: boolean
      muted: boolean
      controls: boolean
      fitCover: string,
     
    };
    dataType?: '1' | '2'; // 1: 静态数据, 2: 动态数据
    variable?: string
  },
  state: Record<string, any>
}

export const defaultOption = {
  url: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/10%E6%89%80%E5%A4%A7%E5%B1%8F%E8%83%8C%E6%99%AF%E8%A7%86%E9%A2%91.mp4',
  autoPlay: false,
  loop: false,
  muted: true,
  controls: false,
  fitCover: 'cover',
}

export const VideoMeta = {
  component: Video,
  propsPanel: VideoProps,
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
  } as Pick<VideoPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: []
}
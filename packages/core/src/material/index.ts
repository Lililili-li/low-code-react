import { ChartBarHorizontalMeta } from "./chart/bar-horizontal/schema";
import { ChartBarVerticalMeta } from "./chart/bar-vertical/schema";
import { ImageMeta } from "./media/image/schema";
import { TextMeta } from "./typography/common/text/schema";
import { TextData1Meta } from "./typography/data/text1/schema";

export const materialCmp = {
  'chart-bar-vertical': ChartBarVerticalMeta,
  'chart-bar-horizontal': ChartBarHorizontalMeta,
  'text': TextMeta,
  'text-data-1': TextData1Meta,
  'image': ImageMeta
} as const;

export type MaterialType = keyof typeof materialCmp;

export const materialCategories = [
  {
    id: '1',
    name: '图表',
    icon: 'chart-pie',
  },
  {
    id: '2',
    name: '文本',
    icon: 'Type',
  },
  {
    id: '3',
    name: '媒体',
    icon: 'TvMinimalPlay',
  },
  {
    id: '4',
    name: '指标',
    icon: 'LayoutGrid',
  }
]

export const materialCmpList = [
  {
    id: 'chart-bar-vertical',
    category_id: '1',
    name: '渐变柱状图',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/bar-vertical.png'
  },
  {
    id: 'chart-bar-horizontal',
    category_id: '1',
    name: '横向柱状图',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/bar-horizontal.png'
  },
  {
    id: 'text',
    category_id: '2',
    name: '文本框',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/text_static.png'
  },
  {
    id: 'text-data-1',
    category_id: '2',
    name: '数据文本',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/text-data-1.png'
  },
  {
    id: 'image',
    category_id: '3',
    name: '图片',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/photo.png'
  },
  {
    id: 'video',
    category_id: '3',
    name: '视频',
    cover: 'https://hhxy511.oss-cn-beijing.aliyuncs.com/uploads/video.png'
  }
]

export default materialCmp;

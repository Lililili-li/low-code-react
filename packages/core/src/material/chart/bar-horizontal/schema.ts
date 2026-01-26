import * as echarts from 'echarts';
import BarHorizontalProps from "./Props";
import type { EChartsOption } from 'echarts';
import { ComponentSchema } from '@/types';
import BarHorizontal from './index';

const sourceData = [
  { province: "安徽省", value: 239 },
  { province: "河南省", value: 181 },
  { province: "浙江省", value: 154 },
  { province: "湖北省", value: 144 },
  { province: "贵州省", value: 135 },
  { province: "江西省", value: 117 },
  { province: "江苏省", value: 74 },
  { province: "四川省", value: 72 },
  { province: "云南省", value: 67 },
  { province: "湖南省", value: 55 },
];

const maxValue = Math.max(...sourceData.map(d => d.value));

export const dataset = {
  dimensions: ['province', 'value', 'maxValue'],
  source: sourceData.map(item => ({
    ...item,
    maxValue
  }))
}

export const defaultOption: EChartsOption = {
  dataset,
  grid: {
    left: '2%',
    right: '2%',
    bottom: '0',
    top: '5%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'none'
    },
    formatter: (params: any) => {
      return params[0].name + ' : ' + params[0].value
    }
  },
  xAxis: {
    show: false,
    type: 'value'
  },
  yAxis: {
    type: 'category',
    inverse: true,
    axisLabel: {
      show: true,
      color: '#fff'
    },
    splitLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
  },
  series: [{
    name: '值',
    type: 'bar',
    zlevel: 1,
    encode: {
      x: 'value',
      y: 'province'
    },
    itemStyle: {
      borderRadius: 30,
      color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
        offset: 0,
        color: 'rgb(57,89,255,1)'
      }, {
        offset: 1,
        color: 'rgb(46,200,207,1)'
      }]),
    },
    barWidth: 10,
  },
  {
    name: '背景',
    type: 'bar',
    barWidth: 10,
    barGap: '-100%',
    encode: {
      x: 'maxValue',
      y: 'province'
    },
    itemStyle: {
      color: 'rgba(24,31,68,1)',
      borderRadius: 30,
    },
  },
  ]
}

export interface ChartPropsSchema extends ComponentSchema {
  props: {
    option?: EChartsOption;
    dataType?: '1' | '2' | '3'; // 1: 静态数据, 2: 动态数据, 3: 原始数据
    data?: any[]
  }
}

export const ChartBarHorizontalMeta = {
  component: BarHorizontal,
  propsPanel: BarHorizontalProps,
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
      dataType: '3'
    },
    className: ''
  } as Pick<ChartPropsSchema, 'style' | 'visibleProp' | 'lock' | 'props' | 'animation' | 'className'>,
  events: [
    {
      type: 'chartClick',
      label: '图表点击事件',
    }
  ]
}
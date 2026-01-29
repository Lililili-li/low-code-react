import * as echarts from 'echarts';
import LineProps from "./Props";
import type { EChartsOption } from 'echarts';
import { ComponentSchema } from '@/types';
import Line from './index';

export const dataset = {
  dimensions: ['time', 'value1', 'value2', 'value3'],
  source: [
    { time: '1月', value1: 6, value2: 4, value3: 3 },
    { time: '2月', value1: 8, value2: 6, value3: 5 },
    { time: '3月', value1: 5, value2: 4, value3: 6 },
    { time: '4月', value1: 8, value2: 6, value3: 5 },
    { time: '5月', value1: 9, value2: 5, value3: 7 },
    { time: '6月', value1: 5, value2: 7, value3: 5 },
    { time: '7月', value1: 7, value2: 3, value3: 6 },
    { time: '8月', value1: 9, value2: 5, value3: 7 },
    { time: '9月', value1: 5, value2: 7, value3: 4 },
    { time: '10月', value1: 7, value2: 4, value3: 8 },
    { time: '11月', value1: 10, value2: 7, value3: 6 },
    { time: '12月', value1: 9, value2: 6, value3: 7 },
  ]
}

const fontColor = '#30eee9'

export const defaultOption: EChartsOption = {
  dataset,
  grid: {
    left: '5%',
    right: '10%',
    top: '20%',
    bottom: '15%',
    containLabel: true
  },
  tooltip: {
    show: true,
    trigger: 'item'
  },
  legend: {
    show: true,
    left: 'center',
    top: '35',
    icon: 'stack',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
      color: '#1bb4f6'
    },
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      axisLabel: {
        color: fontColor
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#397cbc',
          width: 10
        }
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: '#195384'
        }
      },
      position: 'bottom'
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '信息量',
      min: 0,
      axisLabel: {
        formatter: '{value}',
        color: '#2ad1d2'
      },
      axisLine: {
        lineStyle: {
          color: '#27b4c2'
        }
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#11366e'
        }
      },
      position: 'left'
    },
    {
      show: false,
      type: 'value',
      name: '浏览量',
      min: 0,
      axisLabel: {
        formatter: '{value} 人',
        color: '#186afe'
      },
      axisLine: {
        lineStyle: {
          color: '#186afe',
        }
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#11366e'
        }
      },
      position: 'right'
    }
  ],
  series: [
    {
      name: '已采纳',
      type: 'line',
      stack: '总量',
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#0092f6',
      },
      lineStyle: {
        color: "#0092f6",
        width: 1
      },
      areaStyle: {
        //color: '#94C9EC'
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
          offset: 0,
          color: 'rgba(7,44,90,0.3)'
        }, {
          offset: 1,
          color: 'rgba(0,146,246,0.9)'
        }]),
      },
      markPoint: {
        itemStyle: {
          color: 'red'
        }
      },
      encode: {
        x: 'time',
        y: 'value1'
      }
    },
    {
      name: '已发布',
      type: 'line',
      stack: '总量',
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#00d4c7',
      },
      lineStyle: {
        color: "#00d4c7",
        width: 1
      },
      areaStyle: {
        //color: '#94C9EC'
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
          offset: 0,
          color: 'rgba(7,44,90,0.3)'
        }, {
          offset: 1,
          color: 'rgba(0,212,199,0.9)'
        }]),
      },
      encode: {
        x: 'time',
        y: 'value2'
      }
    },
    {
      name: '浏览量',
      type: 'line',
      stack: '总量',
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#aecb56',
      },
      lineStyle: {
        color: "#aecb56",
        width: 1
      },
      areaStyle: {
        //color: '#94C9EC'
        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
          offset: 0,
          color: 'rgba(7,44,90,0.3)'
        }, {
          offset: 1,
          color: 'rgba(114,144,89,0.9)'
        }]),
      },
      encode: {
        x: 'time',
        y: 'value3'
      }
    }
  ]
}

export interface ChartPropsSchema extends ComponentSchema {
  props: {
    option?: EChartsOption;
    dataType?: '1' | '2' | '3'; // 1: 静态数据, 2: 动态数据, 3: 原始数据
    data?: string
  }
}

export const ChartLineMeta = {
  component: Line,
  propsPanel: LineProps,
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
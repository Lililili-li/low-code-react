import * as echarts from 'echarts';
import BarVertical from "./index";
import BarVerticalProps from "./Props";
import type { EChartsOption } from 'echarts';
import { ComponentSchema } from '@/types';

export const dataset = {
  dimensions: ['time', 'input', 'output'],
  source: [
    { time: '7:00', input: 4.9, output: 2.9 },
    { time: '8:00', input: 7.3, output: 5.0 },
    { time: '9:00', input: 9.2, output: 4.4 },
    { time: '10:00', input: 5.6, output: 2.7 },
    { time: '11:00', input: 7.7, output: 5.7 },
    { time: '12:00', input: 5.6, output: 4.6 },
    { time: '13:00', input: 4.2, output: 1.2 },
    { time: '14:00', input: 3.6, output: 2.7 },
    { time: '15:00', input: 6.0, output: 4.8 },
    { time: '16:00', input: 6.4, output: 6.0 },
  ]
}

export const defaultOption: EChartsOption = {
  dataset,
  tooltip: { //提示框组件
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      label: {
        backgroundColor: '#333'
      }
    },
    backgroundColor: '#333',
    textStyle: {
      color: '#fff',
      fontWeight: 'normal',
      fontFamily: '微软雅黑',
      fontSize: 12,
    }
  },
  grid: {
    left: '1%',
    right: '4%',
    bottom: '6%',
    top: 30,
    containLabel: true,
  },
  legend: {//图例组件，颜色和名字
    right: 10,
    top: 0,
    itemGap: 16,
    itemWidth: 18,
    itemHeight: 10,
    textStyle: {
      color: '#a8aab0',
      fontWeight: 'normal',
      fontFamily: '微软雅黑',
      fontSize: 12,
    }
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: true,//坐标轴两边留白
      axisLabel: { //坐标轴刻度标签的相关设置。
        interval: 0,//设置为 1，表示『隔一个标签显示一个标签』
        margin: 15,
        color: '#078ceb',
        fontWeight: 'normal',
        fontFamily: '微软雅黑',
        fontSize: 12,
      },
      axisTick: {//坐标轴刻度相关设置。
        show: false,
      },
      axisLine: {//坐标轴轴线相关设置
        lineStyle: {
          color: '#fff',
          opacity: 0.2
        }
      },
      splitLine: { //坐标轴在 grid 区域中的分隔线。
        show: false,
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      splitNumber: 5,
      axisLabel: {
        color: '#a8aab0',
        fontWeight: 'normal',
        fontFamily: '微软雅黑',
        fontSize: 12,
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#fff'],
          opacity: 0.06
        }
      }

    }
  ],
  series: [
    {
      name: '流入',
      type: 'bar',
      barWidth: 10,
      barGap: 0,//柱间距离
      label: {//图形上的文本标签
        show: true,
        position: 'top',
        color: '#a8aab0',
        fontWeight: 'normal',
        fontFamily: '微软雅黑',
        fontSize: 12,
      },
      itemStyle: {//图形样式
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 1, color: 'rgba(127, 128, 225, 0.7)'
        }, {
          offset: 0.9, color: 'rgba(72, 73, 181, 0.7)'
        }, {
          offset: 0.31, color: 'rgba(0, 208, 208, 0.7)'
        }, {
          offset: 0.15, color: 'rgba(0, 208, 208, 0.7)'
        }, {
          offset: 0, color: 'rgba(104, 253, 255, 0.7)'
        }], false),
      },
    },
    {
      name: '流出',
      type: 'bar',
      barWidth: 10,
      barGap: 0.2,//柱间距离
      label: {//图形上的文本标签
        show: true,
        position: 'top',
        color: '#a8aab0',
        fontWeight: 'normal',
        fontFamily: '微软雅黑',
        fontSize: 12,
      },
      itemStyle: {//图形样式
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 1, color: 'rgba(127, 128, 225, 0.7)'
        }, {
          offset: 0.9, color: 'rgba(72, 73, 181, 0.7)'
        }, {
          offset: 0.25, color: 'rgba(226, 99, 74, 0.7)'
        }, {
          offset: 0, color: 'rgba(253, 200, 106, 0.7)'
        }], false),
      },
    }
  ]
}

export interface ChartPropsSchema extends ComponentSchema {
  props: {
    option?: EChartsOption;
    dataType?: '1' | '2' | '3'; // 1: 静态数据, 2: 动态数据, 3: 原始数据
    data?: any[]
  }
}

export const ChartBarVerticalMeta = {
  component: BarVertical,
  propsPanel: BarVerticalProps,
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
    visible: true,
    lock: false,
    animate: false,
    props: {
      option: defaultOption,
      dataType: '3'
    },
  } as Pick<ChartPropsSchema, 'style' | 'visible' | 'lock' | 'props' | 'animate'>
}
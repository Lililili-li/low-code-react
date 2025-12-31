import { FC } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartPropsSchema } from './schema';

const BarVertical: FC<ChartPropsSchema> = ({ props, style }) => {
  const transformParts = [
    `rotateX(${style?.rotateX ?? 0}deg)`,
    `rotateY(${style?.rotateY ?? 0}deg)`,
    `rotateZ(${style?.rotateZ ?? 0}deg)`,
    `skewX(${style?.skewX ?? 0}deg)`,
    `skewY(${style?.skewY ?? 0}deg)`,
    `scale(${style?.scale ?? 1})`,
  ];
  return (
    <ReactECharts option={props.option} style={{ width: style?.width, height: style?.height, transform: transformParts.join(' ') }} />
  );
};

export default BarVertical;

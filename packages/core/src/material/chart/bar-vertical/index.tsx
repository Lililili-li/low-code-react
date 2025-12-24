import { FC } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartPropsSchema } from './schema';

const BarVertical: FC<ChartPropsSchema> = ({ props, style }) => {
  return (
    <ReactECharts option={props.option} style={{ width: style?.width, height: style?.height }} />
  );
};

export default BarVertical;

import { FC } from 'react';
import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { defaultOption } from './schema';

export interface BarVerticalProps {
  option?: EChartsOption;
}

const BarVertical: FC<BarVerticalProps> = ({ option = defaultOption }) => {

  return <div className="h-full w-full">
    <ReactECharts option={option}/>
  </div>;
};

export default BarVertical;

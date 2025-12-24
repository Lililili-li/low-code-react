import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { EChartsOption, GridOption } from 'echarts/types/dist/shared';

interface GridProps {
  option: EChartsOption
  updateOption: (key: string, option: GridOption) => void;
}

const GridProps = ({ option, updateOption }: GridProps) => {
  // grid配置
  const originGridOption = Array.isArray(option.grid) ? option.grid[0] : option.grid;
  const gridOption: GridOption = {
    left: '10%',
    top: 60,
    right: '10%',
    bottom: 60,
    ...originGridOption,
  };
  return (
    <>
      <div className="flex gap-4 items-center">
        <div className="flex flex-1 gap-2">
          <Label className="shrink-0">上</Label>
          <Input
            placeholder="顶部距离"
            className="flex-1"
            defaultValue={gridOption.top}
            onEnterSearch={(value) => {
              gridOption.top = value;
              updateOption('grid', gridOption);
            }}
          />
        </div>
        <div className="flex flex-1 gap-2">
          <Label className="shrink-0">下</Label>
          <Input
            placeholder="底部距离"
            className="flex-1"
            defaultValue={gridOption.bottom}
            onEnterSearch={(value) => {
              gridOption.bottom = value;
              updateOption('grid', gridOption);
            }}
          />
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex flex-1 gap-2">
          <Label className="shrink-0">左</Label>
          <Input
            placeholder="左边距离"
            className="flex-1"
            defaultValue={gridOption.left}
            onEnterSearch={(value) => {
              gridOption.left = value;
              updateOption('grid', gridOption);
            }}
          />
        </div>
        <div className="flex flex-1 gap-2">
          <Label className="shrink-0">右</Label>
          <Input
            placeholder="右边距离"
            className="flex-1"
            defaultValue={gridOption.right}
            onEnterSearch={(value) => {
              gridOption.right = value;
              updateOption('grid', gridOption);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default GridProps;

import { LegendComponentOption, EChartsOption } from 'echarts/types/dist/shared';
import { Label } from '@repo/ui/components/label';
import { Switch } from '@repo/ui/components/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@repo/ui/components/select';
import { Input } from '@repo/ui/components/input';
import ColorPicker from '@repo/ui/components/color-picker';
import { LayoutOrient } from 'echarts/types/src/util/types.js';

interface LegendProps {
  option: EChartsOption;
  updateOption: (key: string, option: LegendComponentOption) => void;
}

const LegendProps = ({ option, updateOption }: LegendProps) => {
  // legend配置
  const originLegendOption = Array.isArray(option.legend) ? option.legend[0] : option.legend;
  const legendOption = {
    show: true,
    type: 'plain',
    left: 'auto',
    top: 'auto',
    itemHeight: 0,
    itemWidth: 0,
    icon: 'roundRect',
    orient: 'horizontal',
    textStyle: {
      color: '#333',
      fontSize: 12,
      ...originLegendOption?.textStyle,
    },
    ...originLegendOption,
  } as LegendComponentOption;
  return (
    <>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">是否显示</Label>
        <Switch
          defaultChecked={legendOption.show}
          onCheckedChange={(value) => {
            legendOption.show = value;
            updateOption('legend', legendOption);
          }}
        />
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">图例类型</Label>
        <Select
          defaultValue={legendOption.type}
          onValueChange={(value) => {
            legendOption.type = value;
            updateOption('legend', legendOption);
          }}
        >
          <SelectTrigger size="sm" className="w-50">
            <div className="flex items-center gap-2 justify-between relative">
              <SelectValue placeholder="请选择数据类型" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="plain">正常</SelectItem>
              <SelectItem value="scroll">滚动</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">字体大小</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            type="number"
            defaultValue={legendOption.textStyle?.fontSize}
            onEnterSearch={(value) => {
              legendOption.textStyle!.fontSize = value;
              updateOption('legend', legendOption);
            }}
            className="text-center"
          />
          px
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">字体颜色</Label>
        <div className="flex items-center gap-4 w-50">
          <ColorPicker
            value={legendOption.textStyle?.color}
            onChange={(value) => {
              legendOption.textStyle!.color = value;
              updateOption('legend', legendOption);
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">形状</Label>
        <Select
          defaultValue={legendOption.icon}
          onValueChange={(value) => {
            legendOption.icon = value;
            updateOption('legend', legendOption);
          }}
        >
          <SelectTrigger size="sm" className="w-50">
            <div className="flex items-center gap-2 justify-between relative">
              <SelectValue placeholder="请选择数据类型" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="circle">圆形</SelectItem>
              <SelectItem value="rect">矩形</SelectItem>
              <SelectItem value="roundRect">圆角矩形</SelectItem>
              <SelectItem value="triangle">三角形</SelectItem>
              <SelectItem value="diamond">菱形</SelectItem>
              <SelectItem value="pin">钉形</SelectItem>
              <SelectItem value="arrow">箭头形</SelectItem>
              <SelectItem value="none">不显示</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">布局</Label>
        <Select
          defaultValue={legendOption.orient}
          onValueChange={(value) => {
            legendOption.orient = value as LayoutOrient;
            updateOption('legend', legendOption);
          }}
        >
          <SelectTrigger size="sm" className="w-50">
            <div className="flex items-center gap-2 justify-between relative">
              <SelectValue placeholder="请选择布局" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="vertical">竖排</SelectItem>
              <SelectItem value="horizontal">横排</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default LegendProps;

import { TooltipOption } from 'echarts/types/dist/shared';
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
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { Input } from '@repo/ui/components/input';
import ColorPicker from '@repo/ui/components/color-picker';
import { Textarea } from '@repo/ui/components/textarea';
import { isString } from '@repo/shared';
import { EChartsCoreOption } from 'echarts/types/src/echarts.all.js';

interface TooltipProps {
  option: EChartsCoreOption;
  updateOption: (key: string, option: TooltipOption) => void;
}

const TooltipProps = ({ option, updateOption }: TooltipProps) => {
  // tooltip配置
  const originTooltipOption = Array.isArray(option.tooltip) ? option.tooltip[0] : option.tooltip;
  const tooltipOption = {
    show: true,
    trigger: 'item' as TooltipOption['trigger'],
    backgroundColor: '#333',
    formatter: '',
    textStyle: {
      fontSize: 12,
      color: '#fff',
      ...originTooltipOption?.textStyle,
    },
    ...originTooltipOption,
  } as TooltipOption;

  return (
    <>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">是否显示</Label>
        <Switch
          defaultChecked={tooltipOption.show}
          onCheckedChange={(value) => {
            tooltipOption.show = value;
            updateOption('tooltip', tooltipOption);
          }}
        />
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">触发方式</Label>
        <Select
          defaultValue={tooltipOption.trigger}
          onValueChange={(value) => {
            tooltipOption.trigger = value as TooltipOption['trigger'];
            updateOption('tooltip', tooltipOption);
          }}
        >
          <SelectTrigger size="sm" className="w-50">
            <div className="flex items-center gap-2 justify-between relative">
              <SelectValue placeholder="请选择数据类型" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="item">数据项</SelectItem>
              <SelectItem value="axis">坐标轴</SelectItem>
              <SelectItem value="none">不触发</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">字体大小</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            type="number"
            defaultValue={tooltipOption.textStyle?.fontSize}
            onEnterSearch={(value) => {
              tooltipOption.textStyle!.fontSize = value;
              updateOption('tooltip', tooltipOption);
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
            value={tooltipOption.textStyle?.color}
            onChange={(value) => {
              tooltipOption.textStyle!.color = value;
              updateOption('tooltip', tooltipOption);
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">背景颜色</Label>
        <div className="flex items-center gap-4 w-50">
          <ColorPicker
            value={tooltipOption.backgroundColor}
            onChange={(value) => {
              tooltipOption.backgroundColor = value;
              updateOption('tooltip', tooltipOption);
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label className="shrink-0 w-[25%]">格式化</Label>
          <RadioGroup
            orientation="horizontal"
            defaultValue={isString(tooltipOption.formatter) ? 'string' : 'function'}
            className="flex-1 flex"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="string" id="string-open" />
              <Label htmlFor="string-open">字符串拼接</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="function" id="function-open" />
              <Label htmlFor="function-open">回调函数</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex-1">
          <Textarea
            defaultValue={tooltipOption.formatter as string}
            onChange={(e) => {
              tooltipOption.formatter = e.target.value;
              updateOption('tooltip', tooltipOption);
            }}
          ></Textarea>
        </div>
      </div>
    </>
  );
};

export default TooltipProps;

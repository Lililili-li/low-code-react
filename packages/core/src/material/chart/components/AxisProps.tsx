import ColorPicker from '@repo/ui/components/color-picker';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@repo/ui/components/select';
import { Switch } from '@repo/ui/components/switch';
import { EChartsOption } from 'echarts/types/dist/shared';
import { useState } from 'react';

interface AxisProps {
  axis: EChartsOption['xAxis'] | EChartsOption['yAxis'];
  axisType: 'xAxis' | 'yAxis';
  updateOption: (key: string, option: any) => void;
}
const AxisProps = ({ axis, axisType, updateOption }: AxisProps) => {
  const isMultiple = Array.isArray(axis);

  const [currentIndex, setCurrentIndex] = useState(0);

  const renderAxisOption = (isMultiple ? axis : [axis]) as any[];

  const handleAxisUpdate = (key: string, value: any) => {
    const newAxisOption = renderAxisOption.map((axis, idx) =>
      idx === currentIndex ? { ...axis, [key]: value } : axis,
    );
    updateOption(axisType, isMultiple ? newAxisOption : newAxisOption[0]);
  };

  const handleAxisLabelUpdate = (key: string, value: any) => {
    const currentAxis = renderAxisOption[currentIndex];
    const newAxisLabel = { ...currentAxis?.axisLabel, [key]: value };
    handleAxisUpdate('axisLabel', newAxisLabel);
  };

  const handleAxisLineUpdate = (key: string, value: any) => {
    const currentAxis = renderAxisOption[currentIndex];
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      const newAxisLine = {
        ...currentAxis?.axisLine,
        [parent]: { ...currentAxis?.axisLine?.[parent], [child]: value },
      };
      handleAxisUpdate('axisLine', newAxisLine);
    } else {
      const newAxisLine = { ...currentAxis?.axisLine, [key]: value };
      handleAxisUpdate('axisLine', newAxisLine);
    }
  };

  const handleAxisTickUpdate = (key: string, value: any) => {
    const currentAxis = renderAxisOption[currentIndex];
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      const newAxisTick = {
        ...currentAxis?.axisTick,
        [parent]: { ...currentAxis?.axisTick?.[parent], [child]: value },
      };
      handleAxisUpdate('axisTick', newAxisTick);
    } else {
      const newAxisTick = { ...currentAxis?.axisTick, [key]: value };
      handleAxisUpdate('axisTick', newAxisTick);
    }
  };

  const handleSplitLineUpdate = (key: string, value: any) => {
    const currentAxis = renderAxisOption[currentIndex];
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      const newSplitLine = {
        ...currentAxis?.splitLine,
        [parent]: { ...currentAxis?.splitLine?.[parent], [child]: value },
      };
      handleAxisUpdate('splitLine', newSplitLine);
    } else {
      const newSplitLine = { ...currentAxis?.splitLine, [key]: value };
      handleAxisUpdate('splitLine', newSplitLine);
    }
  };

  return (
    <>
      {Array.isArray(axis) && axis.length > 0 && (
        <div className="flex gap-2">
          <Select
            value={currentIndex.toString()}
            onValueChange={(value) => {
              setCurrentIndex(Number(value));
            }}
          >
            <SelectTrigger size="sm" className="w-full">
              <div className="flex items-center gap-2 justify-between relative">
                <SelectValue placeholder="请选择位置" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {axis.map((item, index) => (
                  <SelectItem value={index.toString()} key={index}>
                    {item.name || '坐标轴' + (index + 1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2">
        <Label className="shrink-0 w-[28%]">是否显示</Label>
        <Switch
          checked={renderAxisOption[currentIndex]?.show ?? true}
          onCheckedChange={(value) => handleAxisUpdate('show', value)}
        />
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[28%]">单位名称</Label>
        <Input
          value={renderAxisOption[currentIndex]?.name}
          onChange={(e) => {
            handleAxisUpdate('name', e.target.value);
          }}
          placeholder="请输入单位名称"
        />
      </div>
      <div className="flex gap-2 items-start">
        <Label className="shrink-0 w-[28%]">标签样式</Label>
        <div className="flex-1  ">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">显示</Label>
              <div className="h-8 flex items-center">
                <Switch
                  checked={renderAxisOption[currentIndex]?.axisLabel?.show}
                  onCheckedChange={(value) => handleAxisLabelUpdate('show', value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">大小</Label>
              <Input
                value={renderAxisOption[currentIndex]?.axisLabel?.fontSize || 12}
                onChange={(e) => {
                  handleAxisLabelUpdate('fontSize', e.target.value);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full mt-2">
            <Label className="shrink-0">颜色</Label>
            <ColorPicker
              value={renderAxisOption[currentIndex]?.axisLabel?.color || ''}
              onChange={(value) => handleAxisLabelUpdate('color', value)}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <Label className="shrink-0 w-[28%]">轴线样式</Label>
        <div className="flex-1  ">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">显示</Label>
              <div className="h-8 flex items-center">
                <Switch
                  checked={renderAxisOption[currentIndex]?.axisLine?.show}
                  onCheckedChange={(value) => handleAxisLineUpdate('show', value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">粗细</Label>
              <Input
                value={renderAxisOption[currentIndex]?.axisLine?.lineStyle?.width || 1}
                onChange={(e) => {
                  handleAxisLineUpdate('lineStyle.width', e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Label className="shrink-0">颜色</Label>
            <ColorPicker
              value={renderAxisOption[currentIndex]?.axisLine?.lineStyle?.color || ''}
              onChange={(value) => handleAxisLineUpdate('lineStyle.color', value)}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <Label className="shrink-0 w-[28%]">刻度样式</Label>
        <div className="flex-1  ">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">显示</Label>
              <div className="h-8 flex items-center">
                <Switch
                  checked={renderAxisOption[currentIndex]?.axisTick?.show}
                  onCheckedChange={(value) => handleAxisTickUpdate('show', value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">长度</Label>
              <Input
                value={renderAxisOption[currentIndex]?.axisTick?.length || 5}
                onChange={(e) => {
                  handleAxisTickUpdate('length', e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-start">
        <Label className="shrink-0 w-[28%]">分割线样式</Label>
        <div className="flex-1  ">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">显示</Label>
              <div className="h-8 flex items-center">
                <Switch
                  checked={renderAxisOption[currentIndex]?.splitLine?.show}
                  onCheckedChange={(value) => handleSplitLineUpdate('show', value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="shrink-0">粗细</Label>
              <Input
                value={renderAxisOption[currentIndex]?.splitLine?.lineStyle?.width || 1}
                onChange={(e) => {
                  handleSplitLineUpdate('lineStyle.width', e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Label className="shrink-0">类型</Label>
            <Select
              value={renderAxisOption[currentIndex]?.splitLine?.lineStyle?.type || 'solid'}
              onValueChange={(value) => {
                handleSplitLineUpdate('lineStyle.type', value);
              }}
            >
              <SelectTrigger size="sm" className="w-full">
                <div className="flex items-center gap-2 justify-between relative">
                  <SelectValue placeholder="请选择分割线类型" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="solid">实线</SelectItem>
                  <SelectItem value="dashed">虚线</SelectItem>
                  <SelectItem value="dotted">点线</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Label className="shrink-0">颜色</Label>
            <ColorPicker
              value={renderAxisOption[currentIndex]?.splitLine?.lineStyle?.color || ''}
              onChange={(value) => handleSplitLineUpdate('lineStyle.color', value)}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[28%]">位置</Label>
        <Select
          value={
            renderAxisOption[currentIndex]?.position
          }
          onValueChange={(value) => {
            handleAxisUpdate('position', value);
          }}
        >
          <SelectTrigger size="sm" className="w-50">
            <div className="flex items-center gap-2 justify-between relative">
              <SelectValue placeholder="请选择位置" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {axisType === 'xAxis' ? (
                <>
                  <SelectItem value="top">顶部</SelectItem>
                  <SelectItem value="bottom">底部</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="left">左侧</SelectItem>
                  <SelectItem value="right">右侧</SelectItem>
                </>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default AxisProps;

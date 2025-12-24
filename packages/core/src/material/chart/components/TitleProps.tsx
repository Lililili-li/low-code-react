import { EChartsOption, TitleOption } from 'echarts/types/dist/shared';
import { Switch } from '@repo/ui/components/switch';
import { Input } from '@repo/ui/components/input';
import ColorPicker from '@repo/ui/components/color-picker';
import { Label } from '@repo/ui/components/label';

interface TitleProps {
  option: EChartsOption;
  updateOption: (key: string, option: TitleOption) => void;
}

const TitleProps = ({ option, updateOption }: TitleProps) => {
  // title配置
  const originTitleOption = Array.isArray(option.title) ? option.title[0] : option.title;
  const titleOption: TitleOption = {
    show: false,
    text: '',
    left: 'center',
    top: '10%',
    ...originTitleOption,
    textStyle: {
      fontSize: 18,
      color: '#333',
      ...originTitleOption?.textStyle,
    },
  };
  return (
    <>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">是否显示</Label>
        <Switch
          defaultChecked={titleOption.show}
          onCheckedChange={(value) => {
            titleOption.show = value;
            updateOption('title', titleOption);
          }}
        />
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">标题内容</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            defaultValue={titleOption.text}
            className="text-center"
            onEnterSearch={(value) => {
              titleOption.text = value;
              updateOption('title', titleOption);
            }}
            placeholder="请输入标题内容"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">字体大小</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            type="number"
            className="text-center"
            focusSearch
            defaultValue={titleOption.textStyle?.fontSize}
            onEnterSearch={(value) => {
              titleOption.textStyle!.fontSize = value;
              updateOption('title', titleOption);
            }}
          />
          px
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">字体颜色</Label>
        <div className="flex items-center gap-4 w-50">
          <ColorPicker
            value={titleOption.textStyle?.color}
            onChange={(value) => {
              console.log(value);
              titleOption.textStyle!.color = value;
              updateOption('title', titleOption);
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">X轴位置</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            defaultValue={titleOption.left}
            className="text-center"
            onEnterSearch={(value) => {
              titleOption.left = value;
              updateOption('title', titleOption);
            }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Label className="shrink-0 w-[25%]">Y轴位置</Label>
        <div className="flex items-center gap-4 w-50">
          <Input
            className="text-center"
            defaultValue={titleOption.top}
            onEnterSearch={(value) => {
              titleOption.top = value;
              updateOption('title', titleOption);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TitleProps;

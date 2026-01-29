import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { defaultOption, ImagePropsSchema } from './schema';
import { Switch } from '@repo/ui/components/switch';
import { Textarea } from '@repo/ui/components/textarea';
import FileUpload from '../components/FileUpload';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';

const Props = ({
  schema,
  updateSchema,
}: {
  bindVariable?: ({
    key,
    onChange,
    onClear,
  }: {
    key: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }) => React.ReactNode;
  schema: ImagePropsSchema;
  updateSchema: (updates: Partial<ImagePropsSchema>) => void;
}) => {
  const { props } = schema || { option: {}, dataType: '1', variable: '' };

  const option = props?.option || defaultOption;
  console.log(option);
  
  const updateOptions = (key: string, value: any) => {
    return updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: {
          ...option,
          [key]: value,
        },
      },
    });
  };

  return (
    <div className="props-panel flex flex-col gap-2 px-2 w-full mt-2">
      <div className="upload h-[200px]">
        <FileUpload value={option.url} onChange={(value) => updateOptions('url', value)} type="image" />
      </div>
      <div className="url flex gap-2 w-full">
        <Textarea
          placeholder="请输入图片地址"
          value={option.url}
          onChange={(e) => {
            updateOptions('url', e.target.value);
          }}
          className='max-h-[120px]'
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]">开启动画</Label>
        <div className="select flex-1 flex">
          <Switch checked={option.open} onCheckedChange={(value) => updateOptions('open', value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]">适配方式</Label>
        <div className="select flex-1 flex">
          <Select
            value={option?.fitCover}
            onValueChange={(value) => updateOptions('fitCover', value)}
          >
            <SelectTrigger size="sm" className="flex-1">
              <div className="flex items-center gap-2 justify-between flex-1 relative">
                <SelectValue placeholder="请选择适配方式"></SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'cover'}>cover</SelectItem>
                <SelectItem value={'contain'}>contain</SelectItem>
                <SelectItem value={'fill'}>fill</SelectItem>
                <SelectItem value={'none'}>none</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]">动画名称</Label>
        <div className="select flex-1 flex">
          <Select
            value={option?.animationName}
            onValueChange={(value) => updateOptions('animationName', value)}
          >
            <SelectTrigger size="sm" className="flex-1">
              <div className="flex items-center gap-2 justify-between flex-1 relative">
                <SelectValue placeholder="请选择动画"></SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'clockwise'}>顺时针旋转</SelectItem>
                <SelectItem value={'anticlockwise'}>逆时针旋转</SelectItem>
                <SelectItem value={'breath'}>呼吸</SelectItem>
                <SelectItem value={'scale'}>缩放</SelectItem>
                <SelectItem value={'visible'}>显隐</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]">动画时长</Label>
        <div className="select flex-1 flex">
          <InputGroup>
            <InputGroupInput
              value={option?.duration}
              onChange={(e) => updateOptions('duration', e.target.value)}
            />
            <InputGroupAddon align="inline-end">秒</InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]">动画次数</Label>
        <div className="select flex-1 flex flex-col">
          <InputGroup>
            <InputGroupInput
              value={option?.time}
              onChange={(e) => updateOptions('time', e.target.value)}
            />
            <InputGroupAddon align="inline-end">次</InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label className="shrink-0 w-[25%]"></Label>
        <div className="select flex-1 flex flex-col">
          <small className="text-sm leading-none font-medium mt-1 text-orange-500">-1次为无限循环</small>
        </div>
      </div>
    </div>
  );
};

export default Props;

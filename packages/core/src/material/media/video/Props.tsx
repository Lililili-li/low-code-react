import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { defaultOption, VideoPropsSchema } from './schema';
import { Switch } from '@repo/ui/components/switch';
import { Textarea } from '@repo/ui/components/textarea';
import FileUpload from '../components/FileUpload';

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
  schema: VideoPropsSchema;
  updateSchema: (updates: Partial<VideoPropsSchema>) => void;
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
    <div className="props-panel flex flex-col gap-3 px-2 w-full mt-2">
      <div className="upload h-[200px]">
        <FileUpload value={option.url} onChange={(value) => updateOptions('url', value)} type="video" />
      </div>
      <div className="url flex gap-2 w-full">
        <Textarea
          placeholder="请输入视频地址"
          value={option.url}
          onChange={(e) => {
            updateOptions('url', e.target.value);
          }}
          className='max-h-[120px]'
        />
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Label className="shrink-0 w-[25%]">自动播放</Label>
        <div className="select flex-1 flex">
          <Switch checked={option.autoPlay} onCheckedChange={(value) => updateOptions('autoPlay', value)} />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Label className="shrink-0 w-[25%]">控制器</Label>
        <div className="select flex-1 flex">
          <Switch checked={option.controls} onCheckedChange={(value) => updateOptions('controls', value)} />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Label className="shrink-0 w-[25%]">循环播放</Label>
        <div className="select flex-1 flex">
          <Switch checked={option.loop} onCheckedChange={(value) => updateOptions('loop', value)} />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Label className="shrink-0 w-[25%]">开启声音</Label>
        <div className="select flex-1 flex">
          <Switch checked={!option.muted} onCheckedChange={(value) => updateOptions('muted', !value)} />
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
    </div>
  );
};

export default Props;

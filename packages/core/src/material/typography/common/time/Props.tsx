import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Empty } from '@repo/ui/components/empty';
import { defaultOption, TimeTextPropsSchema } from './schema';
import ColorPicker from '@repo/ui/components/color-picker';

const fontWeightOptions = [
  {
    label: 'normal',
    value: 'normal',
  },
  {
    label: 'bold',
    value: 'bold',
  },
  {
    label: 'bolder',
    value: 'bolder',
  },
  {
    label: 'lighter',
    value: 'lighter',
  },
];

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
  schema: TimeTextPropsSchema;
  updateSchema: (updates: Partial<TimeTextPropsSchema>) => void;
}) => {
  const { props } = schema || { option: {}, dataType: '1', variable: '' };

  const option = props?.option || defaultOption;

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

  const updateFontOptions = (key: string, value: any) => {
    return updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: {
          ...option,
          font: {
            ...option.font,
            [key]: value,
          },
        },
      },
    });
  };

  return (
    <div className="props-panel flex flex-col gap-2">
      <Accordion type="multiple" className="w-full" defaultValue={['1']}>
        <AccordionItem value="1">
          <AccordionTrigger>基础设置</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex-col flex gap-2 justify-between">
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">自定义格式</Label>
                <Input
                  value={option?.format}
                  type="text"
                  onChange={(e) => updateOptions('format', e.target.value)}
                  placeholder="自定义格式"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体大小</Label>
                <Input
                  value={option?.font.fontSize}
                  type="number"
                  onChange={(e) => updateFontOptions('fontSize', Number(e.target.value))}
                  placeholder="字体大小"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体颜色</Label>
                <ColorPicker
                  value={option?.font.color}
                  onChange={(value) => updateFontOptions('color', value)}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="shrink-0 w-[25%]">字体粗细</Label>
                <div className="select flex-1 flex">
                  <Select
                    value={option?.font?.fontWeight}
                    onValueChange={(value) => updateFontOptions('fontWeight', value)}
                  >
                    <SelectTrigger size="sm" className="flex-1">
                      <div className="flex items-center gap-2 justify-between flex-1 relative">
                        <SelectValue placeholder="请选择字体粗细"></SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {fontWeightOptions.length > 0 ? (
                          fontWeightOptions.map((item) => {
                            return (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <Empty className="py-8" />
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Props;

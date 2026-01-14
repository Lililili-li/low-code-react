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
import { defaultOption, TextPropsSchema } from './schema';
import ColorPicker from '@repo/ui/components/color-picker';
import { Switch } from '@repo/ui/components/switch';

const alignOptions = [
  {
    label: '左对齐',
    value: 'left',
  },
  {
    label: '居中',
    value: 'center',
  },
  {
    label: '右对齐',
    value: 'right',
  },
];

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
  bindVariable,
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
  schema: TextPropsSchema;
  updateSchema: (updates: Partial<TextPropsSchema>) => void;
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
          font: option?.font!,
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
          text: option.text,
          isEllipsis: option.isEllipsis,
        },
      },
    });
  };

  return (
    <div className="props-panel flex flex-col gap-2">
      <div className="item flex justify-between gap-2 items-center px-2 mt-4">
        <div className="shrink-0 w-[25%]">
          <Label>文本内容</Label>
        </div>
        <div className="flex-1 flex gap-2">
          {props.dataType === '1' ? (
            <Input value={option?.text} onChange={(e) => updateOptions('text', e.target.value)} />
          ) : (
            <div>已绑定{props.variable}</div>
          )}
          {bindVariable?.({
            key: props.variable!,
            onChange: (value) => {
              updateSchema({
                ...schema,
                props: {
                  ...schema?.props,
                  variable: value,
                  dataType: '2',
                },
              })
            },
            onClear: () => {
              updateSchema({
                ...schema,
                props: {
                  ...schema?.props,
                  variable: '',
                  dataType: '1',
                },
              })
            },
          })}
        </div>
      </div>
      <Accordion type="multiple" className="w-full" defaultValue={['1']}>
        <AccordionItem value="1">
          <AccordionTrigger>基础设置</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex-col flex gap-2 justify-between">
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
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体行高</Label>
                <Input
                  value={option?.font.lineHeight}
                  type="number"
                  onChange={(e) => updateFontOptions('lineHeight', Number(e.target.value))}
                  placeholder="字体行高"
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
              <div className="flex items-center gap-2">
                <Label className="shrink-0 w-[25%]">对齐方式</Label>
                <div className="select flex-1 flex">
                  <Select
                    value={option?.font?.textAlign}
                    onValueChange={(value) => updateFontOptions('textAlign', value)}
                  >
                    <SelectTrigger size="sm" className="flex-1">
                      <div className="flex items-center gap-2 justify-between flex-1 relative">
                        <SelectValue placeholder="请选择对齐方式"></SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {alignOptions.length > 0 ? (
                          alignOptions.map((item) => {
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
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">省略号</Label>
                <div className="flex-1">
                  <Switch
                    checked={option.isEllipsis}
                    onCheckedChange={(value) => updateOptions('isEllipsis', value)}
                  />
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

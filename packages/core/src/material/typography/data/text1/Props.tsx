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
          [key]: value,
        },
      },
    });
  };

  const updateFontOptions = (key: string, value: any, isTextFont: boolean = false) => {
    return updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: {
          ...option,
          titleFont: !isTextFont
            ? {
                ...option.titleFont,
                [key]: value,
              }
            : option.titleFont,
          textFont: isTextFont
            ? {
                ...option.textFont,
                [key]: value,
              }
            : option.textFont,
        },
      },
    });
  };
  const updateUnitOptions = (key: string, value: any) => {
    return updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: {
          ...option,
          unit: {
            ...option.unit,
            [key]: value,
          },
        },
      },
    });
  };

  return (
    <div className="props-panel flex flex-col gap-2">
      <Accordion type="multiple" className="w-full" defaultValue={[]}>
        <AccordionItem value="1">
          <AccordionTrigger>内容设置</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex-col flex gap-2 justify-between">
              <div className="flex gap-2 items-center">
                <div className="shrink-0 w-[25%]">
                  <Label>文本内容</Label>
                </div>
                <div className="flex-1 flex gap-2">
                  {props.dataType === '1' ? (
                    <Input
                      value={option?.text}
                      onChange={(e) => updateOptions('text', e.target.value)}
                    />
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
                      });
                    },
                    onClear: () => {
                      updateSchema({
                        ...schema,
                        props: {
                          ...schema?.props,
                          variable: '',
                          dataType: '1',
                        },
                      });
                    },
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体大小</Label>
                <Input
                  value={option?.textFont.fontSize}
                  type="number"
                  onChange={(e) => updateFontOptions('fontSize', Number(e.target.value), true)}
                  placeholder="字体大小"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体颜色</Label>
                <ColorPicker
                  value={option?.textFont.color}
                  onChange={(value) => updateFontOptions('color', value, true)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="shrink-0 w-[25%]">字体粗细</Label>
                <div className="select flex-1 flex">
                  <Select
                    value={option?.textFont?.fontWeight}
                    onValueChange={(value) => updateFontOptions('fontWeight', value, true)}
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
              <div className="flex gap-2 h-[32px] items-center">
                <Label className="shrink-0 w-[25%]">金钱格式</Label>
                <Switch
                  checked={option?.textFont.isMonyFormat}
                  onCheckedChange={(value) => updateFontOptions('isMonyFormat', value, true)}
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">保留小数</Label>
                <Input
                  value={option?.textFont.decimals}
                  type="number"
                  onChange={(e) => updateFontOptions('decimals', Number(e.target.value), true)}
                  placeholder="保留小数"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>标题设置</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex-col flex gap-2 justify-between">
              <div className="flex gap-2 items-center">
                <div className="shrink-0 w-[25%]">
                  <Label>标题内容</Label>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={option?.title}
                    onChange={(e) => updateOptions('title', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体大小</Label>
                <Input
                  value={option?.titleFont.fontSize}
                  type="number"
                  onChange={(e) => updateFontOptions('fontSize', Number(e.target.value))}
                  placeholder="字体大小"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体颜色</Label>
                <ColorPicker
                  value={option?.titleFont.color}
                  onChange={(value) => updateFontOptions('color', value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体行高</Label>
                <Input
                  value={option?.titleFont.lineHeight}
                  type="number"
                  onChange={(e) => updateFontOptions('lineHeight', Number(e.target.value))}
                  placeholder="字体行高"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="shrink-0 w-[25%]">字体粗细</Label>
                <div className="select flex-1 flex">
                  <Select
                    value={option?.titleFont?.fontWeight}
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
        <AccordionItem value="3">
          <AccordionTrigger>单位设置</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex-col flex gap-2 justify-between">
              <div className="flex gap-2 items-center">
                <div className="shrink-0 w-[25%]">
                  <Label>单位内容</Label>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={option?.unit.content}
                    onChange={(e) => updateUnitOptions('content', e.target.value)}
                    placeholder="单位展示的文本"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体大小</Label>
                <Input
                  value={option?.unit.fontSize}
                  type="number"
                  onChange={(e) => updateUnitOptions('fontSize', Number(e.target.value))}
                  placeholder="字体大小"
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">字体颜色</Label>
                <ColorPicker
                  value={option?.unit.color}
                  onChange={(value) => updateUnitOptions('color', value)}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="shrink-0 w-[25%]">字体粗细</Label>
                <div className="select flex-1 flex">
                  <Select
                    value={option?.unit?.fontWeight}
                    onValueChange={(value) => updateUnitOptions('fontWeight', value)}
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

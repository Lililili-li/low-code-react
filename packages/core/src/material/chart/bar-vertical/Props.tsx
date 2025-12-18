import { Empty } from '@repo/ui/components/empty';
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@repo/ui/components/select';
import { useState } from 'react';
import { Switch } from '@repo/ui/components/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { Input } from '@repo/ui/components/input';
import { Slider } from '@repo/ui/components/slider';
import ColorPicker from '@repo/ui/components/color-picker';
import { ComponentSchema } from '@/types';
import {
  BarSeriesOption,
  GridOption,
  LegendComponentOption,
  LegendOption,
  TitleOption,
} from 'echarts/types/dist/shared';
import { Separator } from '@repo/ui/components/separator';
import { ZRFontWeight } from 'echarts/types/src/util/types.js';

const dataTypeOptions = [
  {
    label: '静态数据',
    value: '1',
  },
  {
    label: '动态数据',
    value: '2',
  },
];

const Props = ({
  bindVariable,
  schema,
  updateSchema,
}: {
  bindVariable?: ({ name }: { name: number }) => React.ReactNode;
  schema?: ComponentSchema;
  updateSchema?: (updates: Partial<ComponentSchema>) => void;
}) => {
  const [activeDataType, setActiveDataType] = useState('1');
  const { props, visible, lock } = schema || {};

  const option = props?.option || {};

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

  // series配置

  const originSeriesOption = (
    Array.isArray(option.series) ? option.series : [option.series]
  ) as BarSeriesOption[]; // 默认就是

  const seriesOption: BarSeriesOption[] = originSeriesOption.map((item) => ({
    ...item,
    name: item?.name || '',
    barWidth: item.barWidth || 20,
    itemStyle: {
      borderRadius: 0,
      ...item.itemStyle,
    },
    label: {
      show: true,
      color: '#fff',
      fontSize: 12,
      fontWeight: 'normal',
      ...item?.label,
    },
  }));

  const isStack = seriesOption.some((series) => series?.stack === 'stack');

  // grid配置
  const originGridOption = Array.isArray(option.grid) ? option.grid[0] : option.grid;
  const gridOption: GridOption = {
    left: '10%',
    top: 60,
    right: '10%',
    bottom: 60,
    ...originGridOption,
  };

  // legend配置
  const originLegendOption = Array.isArray(option.legend) ? option.legend[0] : option.legend;
  const legendOption = {
    show: true,
    type: 'plain',
    left: '',
    top: '',
    itemHeight: 0,
    itemWidth: 0,
    icon: 'react',
    orient: 'horizontal',
    textStyle: {
      color: '#333',
      fontSize: 12,
      ...originLegendOption?.textStyle,
    },
    ...originLegendOption,
  };

  const updateOption = (key: string, options: any) => {
    updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: { ...option, [key]: options },
      },
    });
  };

  return (
    <div className="props-panel flex flex-col gap-4">
      <div className="item flex justify-between gap-2 items-center w-full">
        <div className="shrink-0 w-[25%]">
          <Label>数据类型</Label>
        </div>
        <Select value={activeDataType} onValueChange={(value) => setActiveDataType(value)}>
          <SelectTrigger size="sm" className="flex-1">
            <div className="flex items-center gap-2 justify-between flex-1 relative">
              <SelectValue placeholder="请选择数据类型">
                {activeDataType
                  ? dataTypeOptions.find((item) => item.value === activeDataType)?.label
                  : undefined}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTypeOptions.length > 0 ? (
                dataTypeOptions.map((item) => {
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
        {bindVariable?.({ name: 1 })}
      </div>
      <div className="item flex justify-between gap-2 items-center">
        <div className="shrink-0 w-[25%]">
          <Label>是否渲染</Label>
        </div>
        <div className="flex-1 items-center flex">
          <Switch
            defaultChecked={visible}
            onCheckedChange={(value) => {
              if (updateSchema) {
                updateSchema({ ...schema, visible: value });
              }
            }}
          />
        </div>
        {bindVariable?.({ name: 2 })}
      </div>
      <div className="item flex justify-between gap-2 items-center">
        <div className="shrink-0 w-[25%]">
          <Label>是否锁定</Label>
        </div>
        <div className="flex-1 items-center flex">
          <Switch
            defaultChecked={lock}
            onCheckedChange={(value) => {
              if (updateSchema) {
                updateSchema({ ...schema, lock: value });
              }
            }}
          />
        </div>
      </div>
      <div className="item">
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>柱体设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">启用堆积</Label>
                <Switch
                  id="stack"
                  defaultChecked={isStack}
                  onCheckedChange={(value) => {
                    seriesOption.forEach((item) => {
                      if (value) {
                        item['stack'] = 'stack';
                      } else {
                        item['stack'] = '';
                      }
                    });
                    updateOption?.('series', seriesOption);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">柱体宽度</Label>
                <div className="flex items-center gap-4 w-50">
                  <Slider
                    defaultValue={[seriesOption[0].barWidth as number]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      seriesOption.forEach((item) => {
                        item.barWidth = value[0];
                      });
                      updateOption?.('series', seriesOption);
                    }}
                  />
                  <span>{seriesOption[0].barWidth as number}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">柱体圆角</Label>
                <div className="flex items-center gap-4 w-50">
                  <Slider
                    defaultValue={[seriesOption[0].itemStyle?.borderRadius as number]}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      seriesOption.forEach((item) => {
                        item.itemStyle!.borderRadius = value[0];
                      });
                      updateOption?.('series', seriesOption);
                    }}
                  />
                  <span>{seriesOption[0].itemStyle?.borderRadius as number}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>系列设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              {seriesOption.map((item, index) => {
                return (
                  <div key={index}>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Label className="shrink-0 w-[25%]">是否显示</Label>
                        <Switch
                          defaultChecked={item.label?.show}
                          onCheckedChange={(value) => {
                            seriesOption[index].label!.show = value;
                            updateOption('series', seriesOption);
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Label className="shrink-0 w-[25%]">标签{index + 1}</Label>
                        <div className="flex items-center gap-4 w-50">
                          <Input
                            defaultValue={item.name}
                            className="text-center"
                            onEnterSearch={(value) => {
                              seriesOption[index].name = value;
                              updateOption('series', seriesOption);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Label className="shrink-0 w-[25%]">字体大小</Label>
                        <div className="flex items-center gap-4 w-50">
                          <Input
                            type="number"
                            defaultValue={item.label?.fontSize}
                            className="text-center"
                            onEnterSearch={(value) => {
                              seriesOption[index].label!.fontSize = value;
                              updateOption('series', seriesOption);
                            }}
                          />
                          px
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Label className="shrink-0 w-[25%]">字体颜色</Label>
                        <div className="flex items-center gap-4 w-50">
                          <ColorPicker
                            value={item.label?.color}
                            onChange={(value) => {
                              seriesOption[index].label!.color = value;
                              updateOption('series', seriesOption);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Label className="shrink-0 w-[25%]">字体粗细</Label>
                        <div className="flex items-center gap-4">
                          <Select
                            value={item.label?.fontWeight as string}
                            onValueChange={(value) => {
                              seriesOption[index].label!.fontWeight = value as ZRFontWeight;
                              updateOption('series', seriesOption);
                            }}
                          >
                            <SelectTrigger size="sm" className="w-50">
                              <div className="flex items-center gap-2 justify-between relative">
                                <SelectValue placeholder="请选择数据类型"></SelectValue>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="normal">正常</SelectItem>
                                <SelectItem value="bold">粗体</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    {index < seriesOption.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>标题设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>图例设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
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
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">X轴</Label>
                  <div className="flex items-center gap-4 flex-1">
                    <Input defaultValue="12" className="text-center" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">Y轴</Label>
                  <div className="flex items-center gap-4 flex-1">
                    <Input defaultValue="12" className="text-center" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">宽</Label>
                  <div className="flex items-center gap-4 flex-1">
                    <Input type="number" defaultValue="12" className="text-center" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">高</Label>
                  <div className="flex items-center gap-4 flex-1">
                    <Input type="number" defaultValue="12" className="text-center" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Label className="shrink-0 w-[25%]">形状</Label>
                <Select value="circle">
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
                <Select value="vertical">
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>布局</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Props;

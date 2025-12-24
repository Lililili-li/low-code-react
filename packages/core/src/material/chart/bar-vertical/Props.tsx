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
import { BarSeriesOption, DatasetOption, EChartsOption } from 'echarts/types/dist/shared';
import type { ZRFontWeight } from 'echarts/types/src/util/types.js';
import { Button } from '@repo/ui/components/button';
import { CirclePlus, Settings, Trash2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { useState } from 'react';
import { ChartPropsSchema, dataset } from './schema';
import GridProps from '../components/GridProps';
import OptionProps from '../components/OptionProps';
import TooltipProps from '../components/TooltipProps';
import LegendProps from '../components/LegendProps';
import TitleProps from '../components/TitleProps';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@repo/ui/components/dialog';
import { cloneDeep } from 'lodash-es';

const dataTypeOptions = [
  {
    label: '静态数据',
    value: '1',
  },
  {
    label: '动态数据',
    value: '2',
  },
  {
    label: '原始数据',
    value: '3',
  },
];

// 静态数据，只需要更新source，options直接干掉source选项。 原始数据不需要处理
// 动态数据需要处理数据绑定和请求配置
// 数据绑定和请求配置在其他地方处理，这里只处理source
// 通过dataset.source更新图表数据

const Props = ({
  bindVariable,
  schema,
  updateSchema,
}: {
  bindVariable?: ({ name }: { name: number }) => React.ReactNode;
  schema?: ChartPropsSchema;
  updateSchema?: (updates: Partial<ChartPropsSchema>) => void;
}) => {
  const { props, visible, lock } = schema || {};

  const option = props?.option || {};
  const dataType = props?.dataType || ('1' as '1' | '2' | '3');

  const datasetOption = {
    dimensions: [...((option?.dataset as DatasetOption)?.dimensions || [])],
    source: (option?.dataset as DatasetOption)?.source || [],
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
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);

  const updateOption = (key: string, options: any) => {
    updateSchema?.({
      ...schema,
      props: {
        ...schema?.props,
        option: { ...option, [key]: options },
      },
    });
  };

  const originDataset = cloneDeep(dataset);

  return (
    <div className="props-panel flex flex-col gap-4">
      <div className="item flex justify-between gap-2 items-center w-full">
        <div className="shrink-0 w-[25%]">
          <Label>数据类型</Label>
        </div>
        <Select
          value={dataType}
          onValueChange={(value) => {
            updateSchema?.({
              ...schema,
              props: {
                ...schema?.props,
                dataType: value as '1' | '2' | '3',
              },
            });
          }}
        >
          <SelectTrigger size="sm" className="flex-1">
            <div className="flex items-center gap-2 justify-between flex-1 relative">
              <SelectValue placeholder="请选择数据类型"></SelectValue>
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
        {dataType === '2' && bindVariable?.({ name: 1 })}
        {dataType === '1' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Settings className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px] p-4">
              <DialogHeader>
                <DialogTitle>静态数据</DialogTitle>
                <DialogDescription>静态数据编辑用作展示图形数据</DialogDescription>
              </DialogHeader>
              <MonacoEditor
                value={JSON.stringify(originDataset, null, 2)}
                onChange={(value) => {
                  try {
                    const dataSource = JSON.parse(value);
                    updateOption('dataset', { ...option.dataset, source: dataSource });
                  } catch (error) {
                    console.error(error, 'Invalid JSON Schema');
                  }
                }}
                language="json"
                height={'600px'}
                wordWrap="off"
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    取消
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" size="sm">
                    保存
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
          <AccordionItem value="series">
            <AccordionTrigger>系列设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <div className="flex-col flex gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <div className="select flex-1">
                    <Select
                      value={currentSeriesIndex.toString()}
                      onValueChange={(value) => {
                        setCurrentSeriesIndex(Number(value));
                      }}
                    >
                      <SelectTrigger size="sm" className="w-full">
                        <div className="flex items-center gap-2 justify-between relative">
                          <SelectValue placeholder="请选择系列"></SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {seriesOption.map((item, index) => {
                            return (
                              <SelectItem key={item.name} value={index.toString()}>
                                系列{index + 1}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="btn">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <CirclePlus />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>添加系列</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>删除系列</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">图例名称</Label>
                  <Input
                    value={seriesOption[currentSeriesIndex].name}
                    onChange={(e) => {
                      seriesOption[currentSeriesIndex].name = e.target.value;
                      updateOption('series', seriesOption);
                    }}
                    placeholder="请输入图例名称"
                  />
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">取值字段</Label>
                  <Input
                    value={datasetOption.dimensions[currentSeriesIndex + 1] as string}
                    onChange={(e) => {
                      datasetOption.dimensions[currentSeriesIndex + 1] = e.target.value;
                      updateOption('dataset', datasetOption);
                    }}
                    placeholder="请输入取值字段"
                  />
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">标签显示</Label>
                  <Switch
                    defaultChecked={seriesOption[currentSeriesIndex].label?.show}
                    onCheckedChange={(value) => {
                      seriesOption[currentSeriesIndex].label!.show = value;
                      updateOption('series', seriesOption);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">字体大小</Label>
                  <div className="flex items-center gap-4 w-50">
                    <Input
                      type="number"
                      defaultValue={seriesOption[currentSeriesIndex].label?.fontSize}
                      className="text-center"
                      onEnterSearch={(value) => {
                        seriesOption[currentSeriesIndex].label!.fontSize = value;
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
                      value={seriesOption[currentSeriesIndex].label?.color}
                      onChange={(value) => {
                        seriesOption[currentSeriesIndex].label!.color = value;
                        updateOption('series', seriesOption);
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Label className="shrink-0 w-[25%]">字体粗细</Label>
                  <div className="flex items-center gap-4">
                    <Select
                      value={seriesOption[currentSeriesIndex].label?.fontWeight as string}
                      onValueChange={(value) => {
                        seriesOption[currentSeriesIndex].label!.fontWeight = value as ZRFontWeight;
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="bar">
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
          <AccordionItem value="title">
            <AccordionTrigger>标题设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <TitleProps option={option as EChartsOption} updateOption={updateOption} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="legend">
            <AccordionTrigger>图例设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <LegendProps option={option as EChartsOption} updateOption={updateOption} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tooltip">
            <AccordionTrigger>提示设置</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <TooltipProps option={option as EChartsOption} updateOption={updateOption} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="grid">
            <AccordionTrigger>布局</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <GridProps option={option as EChartsOption} updateOption={updateOption} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="custom">
            <AccordionTrigger>自定义配置(合并到option)</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 relative">
              <OptionProps schema={schema} updateSchema={updateSchema} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Props;

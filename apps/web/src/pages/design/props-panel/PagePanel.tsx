import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import Select from '@/components/Select';
import { Label } from '@repo/ui/components/label';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import { Columns2, Palette, PlusCircle, Settings, StickyNote } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { Cut24Filled, ScaleFill24Regular, ScaleFit24Regular } from '@ricons/fluent';
import { Button } from '@repo/ui/components/button';
import { Switch } from '@repo/ui/components/switch';
import { Slider } from '@repo/ui/components/slider';
import Upload, { UploadFile } from '@/components/Upload';
import ColorPicker from '@repo/ui/components/color-picker';
import { Input } from '@repo/ui/components/input';
import PageConfig from './components/page-config';
import commonApi from '@/api/common';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import { useDesignStore } from '@/store/modules/design';

const bgApply = [
  {
    label: '应用图片',
    value: '1',
  },
  {
    label: '应用颜色',
    value: '2',
  },
];

const themes = [
  {
    id: 1,
    label: '明亮',
    value: [
      'rgba(73, 146, 255, 1)',
      'rgba(124, 255, 178, 1)',
      'rgb(253, 221, 96)',
      'rgb(255, 110, 118)',
      'rgb(88, 217, 249)',
      'rgb(5, 192, 145)',
    ],
  },
  {
    id: 2,
    label: '暗淡',
    value: [
      'rgb(84, 112, 198)',
      'rgb(145, 204, 117)',
      'rgb(250, 200, 88)',
      'rgb(238, 102, 102)',
      'rgb(115, 192, 222)',
      'rgb(59, 162, 114)',
    ],
  },
  {
    id: 6,
    label: '复古',
    value: [
      'rgb(216, 124, 124)',
      'rgb(184, 148, 120)',
      'rgb(205, 185, 150)',
      'rgb(160, 120, 100)',
      'rgb(130, 100, 80)',
      'rgb(100, 80, 60)',
    ],
  },
  {
    id: 7,
    label: '粉青',
    value: [
      'rgb(252, 151, 175)',
      'rgb(135, 247, 207)',
      'rgb(173, 220, 217)',
      'rgb(114, 204, 255)',
      'rgb(220, 180, 140)',
      'rgb(212, 164, 235)',
    ],
  },
  {
    id: 3,
    label: '马卡龙',
    value: [
      'rgb(46, 199, 201)',
      'rgb(182, 162, 222)',
      'rgb(90, 177, 239)',
      'rgb(255, 185, 128)',
      'rgb(216, 122, 128)',
      'rgb(141, 152, 179)',
    ],
  },
  {
    id: 4,
    label: '深色',
    value: [
      'rgb(193, 46, 52)',
      'rgb(230, 182, 0)',
      'rgb(253, 221, 96)',
      'rgb(0, 152, 217)',
      'rgb(0, 94, 170)',
      'rgb(51, 156, 168)',
    ],
  },
  {
    id: 5,
    label: '罗马红',
    value: [
      'rgb(224, 31, 84)',
      'rgb(94, 78, 165)',
      'rgb(245, 232, 200)',
      'rgb(184, 210, 199)',
      'rgb(198, 179, 142)',
      'rgb(164, 216, 194)',
    ],
  },
];

const applicationCover = '//heartmm.xyz/static/cover.png';

const PagePanel = () => {
  const { pageSchema, setPageSchema } = useDesignStore();

  const getThemeLine = useCallback((theme: { value: string[]; label: string }) => {
    const str = `linear-gradient(to right,${theme.value.join(',')})`;
    return str;
  }, []);

  const [uploadType, setUploadType] = useState('1'); // 1为背景图片上传，2为直接输入地址
  const [files, setFiles] = useState<UploadFile[]>([]);
  console.log();

  return (
    <div className="page-panel-container min-w-[300px]">
      <Tabs defaultValue="config">
        <TabsList className="justify-center w-full rounded-none">
          <TabsTrigger value="config">
            <Settings className="size-3.5" />
            <span>配置</span>
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="size-3.5" />
            <span>主题</span>
          </TabsTrigger>
        </TabsList>
        <div className="p-2 pt-0">
          <TabsContent value="config" className="mt-2">
            <Label>页面尺寸</Label>
            <div className="rect flex items-center gap-2 mt-3">
              <InputGroup className="h-[32px]">
                <InputGroupInput
                  placeholder="请输入宽度"
                  type="number"
                  min={0}
                  defaultValue={pageSchema.width}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPageSchema({ ...pageSchema, width: Number(e.currentTarget.value) });
                    }
                  }}
                />
                <InputGroupAddon>宽度</InputGroupAddon>
              </InputGroup>
              <InputGroup className="h-[32px]">
                <InputGroupInput
                  placeholder="请输入高度"
                  type="number"
                  min={0}
                  defaultValue={pageSchema.height}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setPageSchema({ ...pageSchema, height: Number(e.currentTarget.value) });
                    }
                  }}
                />
                <InputGroupAddon>高度</InputGroupAddon>
              </InputGroup>
            </div>
            <div className="background mt-4">
              <Label>页面背景</Label>
              <div className="flex justify-between items-center my-3 ">
                <Select
                  value={pageSchema.background.useType}
                  options={bgApply}
                  placeholder="请选择背景"
                  onChange={(value) =>
                    setPageSchema({
                      ...pageSchema,
                      background: { ...pageSchema.background, useType: value as '1' | '2' },
                    })
                  }
                  className="flex-1 h-[32px]"
                />
              </div>
              {pageSchema.background.useType === '1' ? (
                <>
                  <RadioGroup
                    value={uploadType}
                    onValueChange={(value) => setUploadType(value)}
                    orientation="horizontal"
                    className="flex flex-row mb-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="1" id="r1" />
                      <Label htmlFor="r1">上传文件</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="2" id="r2" />
                      <Label htmlFor="r2">输入url地址</Label>
                    </div>
                  </RadioGroup>
                  {uploadType === '1' ? (
                    <Upload
                      value={files}
                      onChange={(value) => {
                        setFiles(value);
                        if (!Boolean(value.length)) {
                          setPageSchema({
                            ...pageSchema,
                            background: {
                              ...pageSchema.background,
                              image: '',
                            },
                          });
                        }
                      }}
                      maxCount={1}
                      onUpload={async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await commonApi.uploadFile(formData);
                        setPageSchema({
                          ...pageSchema,
                          background: {
                            ...pageSchema.background,
                            image: import.meta.env.VITE_FILE_URL + '/' + response?.path,
                          },
                        });
                        return (import.meta.env.VITE_FILE_URL + '/' + response?.path) as string;
                      }}
                      description={
                        <div className="text-xs text-muted-foreground mt-1">
                          支持png / jpg / jpeg / gif 等类型图片
                        </div>
                      }
                    />
                  ) : (
                    <Input
                      placeholder="请输入Url地址"
                      value={pageSchema.background.image}
                      onChange={(e) =>
                        setPageSchema({
                          ...pageSchema,
                          background: { ...pageSchema.background, image: e.target.value },
                        })
                      }
                    />
                  )}
                </>
              ) : (
                <ColorPicker
                  value={pageSchema.background.color}
                  onChange={(value) =>
                    setPageSchema({
                      ...pageSchema,
                      background: { ...pageSchema.background, color: value },
                    })
                  }
                />
              )}
            </div>
            <div className="adapter mt-4">
              <Label>适配方式</Label>
              <div className="mt-3">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={pageSchema.adapterType}
                  onValueChange={(value) =>
                    setPageSchema({
                      ...pageSchema,
                      adapterType: value as '1' | '2' | '3' | '4' | '5',
                    })
                  }
                >
                  <Tooltip>
                    <ToggleGroupItem value="1" aria-label="Toggle italic" asChild>
                      <TooltipTrigger>
                        <ScaleFill24Regular className="size-5" />
                      </TooltipTrigger>
                    </ToggleGroupItem>
                    <TooltipContent>
                      <p>自适应比例</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <ToggleGroupItem value="2" aria-label="Toggle italic" asChild>
                      <TooltipTrigger>
                        <Columns2 className="size-4" />
                      </TooltipTrigger>
                    </ToggleGroupItem>
                    <TooltipContent>
                      <p>铺满屏幕</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <ToggleGroupItem value="3" aria-label="Toggle italic" asChild>
                      <TooltipTrigger>
                        <ScaleFit24Regular className="size-5" />
                      </TooltipTrigger>
                    </ToggleGroupItem>
                    <TooltipContent>
                      <p>宽度铺满，高度自适应</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <ToggleGroupItem value="4" aria-label="Toggle italic" asChild>
                      <TooltipTrigger>
                        <ScaleFit24Regular className="rotate-90 transform size-5" />
                      </TooltipTrigger>
                    </ToggleGroupItem>
                    <TooltipContent>
                      <p>高度铺满，宽度自适应</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <ToggleGroupItem value="5" aria-label="Toggle italic" asChild>
                      <TooltipTrigger>
                        <StickyNote className="size-4" />
                      </TooltipTrigger>
                    </ToggleGroupItem>
                    <TooltipContent>
                      <p>原始宽高</p>
                    </TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              </div>
            </div>
            <div className="picture mt-4">
              <Label>应用封面</Label>
              <div className="mt-3">
                <Button variant="outline" size="sm">
                  <Cut24Filled />
                  <span>截取画板</span>
                </Button>
                {applicationCover && (
                  <div className="picture-preview mt-3">
                    <img src={applicationCover} alt="" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <PageConfig pageSchema={pageSchema} setPageSchema={setPageSchema} />
            </div>
          </TabsContent>
          <TabsContent value="theme">
            <div className="theme-list mt-2">
              <Button variant="outline" className="w-full">
                <PlusCircle></PlusCircle>添加主题
              </Button>
              {themes.map((theme) => (
                <div
                  className="flex items-center gap-2 mt-4 border p-3 rounded-[6px] cursor-pointer relative overflow-hidden"
                  key={theme.id}
                >
                  <Label className="min-w-[15%] max-w-[30%] cursor-pointer">{theme.label}</Label>
                  <div className="flex items-center gap-2 flex-1 justify-around">
                    {theme.value.map((color) => (
                      <div
                        key={color}
                        className="w-4.5 h-4.5 rounded-sm"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                  <div
                    className="bottom-line h-[2px] w-full absolute bottom-0 left-0"
                    style={{ background: getThemeLine(theme) }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="filter mt-5">
              <Label className="flex items-center gap-4 justify-between ">
                <span>页面滤镜</span>
                <Switch
                  value={pageSchema.filter?.open ? 'on' : 'off'}
                  onCheckedChange={(value) =>
                    setPageSchema({
                      ...pageSchema,
                      filter: { ...pageSchema.filter, open: value },
                    })
                  }
                />
              </Label>
              {pageSchema.filter?.open && (
                <div className={`filter-options mt-3 flex flex-col gap-2 text-sm font-medium`}>
                  <div className="flex items-center gap-8">
                    <span className="w-[60px]">对比度</span>
                    <div className="flex items-center gap-4 flex-1">
                      <Slider
                        className="flex-1"
                        value={[pageSchema.filter?.contrast || 0]}
                        onValueChange={(value) =>
                          setPageSchema({
                            ...pageSchema,
                            filter: { ...pageSchema.filter, contrast: value[0] },
                          })
                        }
                      />
                      <span>{pageSchema.filter?.contrast}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="w-[60px]">饱和度</span>
                    <div className="flex items-center gap-4 flex-1">
                      <Slider
                        className="flex-1"
                        value={[pageSchema.filter?.saturation || 0]}
                        onValueChange={(value) =>
                          setPageSchema({
                            ...pageSchema,
                            filter: { ...pageSchema.filter, saturation: value[0] },
                          })
                        }
                      />
                      <span>{pageSchema.filter?.saturation}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="w-[60px]">亮度</span>
                    <div className="flex items-center gap-4 flex-1">
                      <Slider
                        className="flex-1"
                        value={[pageSchema.filter?.brightness || 0]}
                        onValueChange={(value) =>
                          setPageSchema({
                            ...pageSchema,
                            filter: { ...pageSchema.filter, brightness: value[0] },
                          })
                        }
                      />
                      <span>{pageSchema.filter?.brightness}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="w-[60px]">透明度</span>
                    <div className="flex items-center gap-4 flex-1">
                      <Slider
                        className="flex-1"
                        value={[pageSchema.filter?.opacity || 0]}
                        onValueChange={(value) => {
                          setPageSchema({
                            ...pageSchema,
                            filter: { ...pageSchema.filter, opacity: value[0] },
                          });
                        }}
                      />
                      <span>{pageSchema.filter?.opacity}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PagePanel;

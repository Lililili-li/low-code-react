import { useCallback, useEffect, useId, useState } from 'react';
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
import { useDesignStore } from '@/store/design';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { useShallow } from 'zustand/react/shallow';
import { parseQuery } from '@/composable/use-query';
import applicationApi from '@/api/application';
import { useRequest } from 'ahooks';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router';

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
  const { pageSchema, updatePageSchema } = useDesignStore(
    useShallow((state) => ({
      pageSchema: state.pageSchema,
      updatePageSchema: state.updatePageSchema,
    })),
  );

  const getThemeLine = useCallback((theme: { value: string[]; label: string }) => {
    const str = `linear-gradient(to right,${theme.value.join(',')})`;
    return str;
  }, []);

  const [uploadType, setUploadType] = useState('1'); // 1为背景图片上传，2为直接输入地址
  const [files, setFiles] = useState<UploadFile[]>([]);
  const id = useId();
  useEffect(() => {
    if (pageSchema.background.useType === '1') {
      if (!pageSchema.background.image) return;
      setFiles([{ url: pageSchema.background.image, uid: id }]);
    }
  }, [pageSchema.background]);

  const queryParams = parseQuery<{applicationId: string, id: string}>();

  const navigate = useNavigate();

  const { data: application, runAsync: getApplication } = useRequest(
    () => {
      return applicationApi.getApplicationById(Number(queryParams?.applicationId));
    },

    {
      onError: (error) => {
        if (isAxiosError(error) && error.response?.status === 403) {
          navigate('/forbidden');
        }
      },
      refreshDeps: [queryParams?.applicationId],
    },
  );

  const { runAsync: updateApplicationCover } = useRequest(
    (path: string) =>
      applicationApi.updateApplication(
        {
          cover: path,
        },
        Number(queryParams?.applicationId),
      ),
    {
      manual: true,
    },
  );

  const uploadCover = async () => {
    let tempContainer: HTMLDivElement | null = null;
    try {
      toast.loading('正在生成封面...');

      // 创建临时容器
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.zIndex = '-1';
      tempContainer.style.width = `${pageSchema.width}px`;
      tempContainer.style.height = `${pageSchema.height}px`;
      tempContainer.style.backgroundColor = pageSchema.background.color.includes('oklch') ? '#f0f0f0' : pageSchema.background.color;
      
      // 如果有背景图片，设置背景
      if (pageSchema.background.useType === '1' && pageSchema.background.image) {
        tempContainer.style.backgroundImage = `url(${pageSchema.background.image})`;
        tempContainer.style.backgroundSize = 'cover';
        tempContainer.style.backgroundPosition = 'center';
        tempContainer.style.backgroundRepeat = 'no-repeat';
      }

      // 获取原始组件并复制
      const shadowHost = document.getElementById('shadow-host');
      const shadowRoot = shadowHost?.shadowRoot;
      
      if (shadowRoot) {
        const canvasContent = shadowRoot.querySelector('#canvas-content');
        if (canvasContent) {
          // 复制所有组件
          const components = canvasContent.querySelectorAll('.canvas-render-container');
          components.forEach(comp => {
            const compClone = comp.cloneNode(true) as HTMLElement;
            // 移除控制元素
            compClone.querySelectorAll('.cmp-mask, .move-corner, .move-rect, .helper-line').forEach(el => el.remove());
            tempContainer?.appendChild(compClone);
          });
        }
      }

      // 添加到页面
      document.body.appendChild(tempContainer);
      
      // 等待渲染
      await new Promise(resolve => setTimeout(resolve, 500));

      // 直接使用 html-to-image 截图整个容器
      console.log('开始使用 html-to-image 截图...');
      const dataUrl = await toPng(tempContainer, {
        width: pageSchema.width,
        height: pageSchema.height,
        quality: 0.8,
        pixelRatio: 1
      });
      
      console.log('html-to-image 截图完成');

      // 转换为 Blob
      const blob = await fetch(dataUrl).then(res => res.blob());
      console.log('生成图片大小:', blob.size, 'bytes');

      // 上传到服务器
      const formData = new FormData();
      formData.append('file', blob, `application-cover-${queryParams?.id}.png`);
      
      const uploadResult = await commonApi.uploadFile(formData);
      await updateApplicationCover(uploadResult.path);
      
      toast.success('封面更新成功');
      getApplication()
    } catch (error) {
      console.error('封面上传失败:', error);
      toast.error('封面上传失败，请重试');
    } finally {
      // 清理临时容器
      if (tempContainer && document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      toast.dismiss();
    }
  };

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
                  value={pageSchema.width}
                  onChange={(e) => {
                    updatePageSchema('width', Number(e.currentTarget.value));
                  }}
                />
                <InputGroupAddon>宽度</InputGroupAddon>
              </InputGroup>
              <InputGroup className="h-[32px]">
                <InputGroupInput
                  placeholder="请输入高度"
                  type="number"
                  min={0}
                  value={pageSchema.height}
                  onChange={(e) => {
                    updatePageSchema('height', Number(e.currentTarget.value));
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
                    updatePageSchema('background', {
                      ...pageSchema.background,
                      useType: value as '1' | '2',
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
                          updatePageSchema('background', {
                            ...pageSchema.background,
                            image: '',
                          });
                        }
                      }}
                      maxCount={1}
                      onUpload={async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await commonApi.uploadFile(formData);
                        updatePageSchema('background', {
                          ...pageSchema.background,
                          image: response?.path,
                        });
                        return response?.path as string;
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
                        updatePageSchema('background', {
                          ...pageSchema.background,
                          image: e.target.value,
                        })
                      }
                    />
                  )}
                </>
              ) : (
                <ColorPicker
                  value={pageSchema.background.color}
                  onChange={(value) =>
                    updatePageSchema('background', {
                      ...pageSchema.background,
                      color: value,
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
                    updatePageSchema('adapterType', value as '1' | '2' | '3' | '4' | '5')
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
                <Button variant="outline" size="sm" onClick={uploadCover}>
                  <Cut24Filled />
                  <span>截取画板</span>
                </Button>
                {(application?.cover || applicationCover) && (
                  <div className="picture-preview mt-3">
                    <img src={application?.cover || applicationCover} alt="" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <PageConfig pageSchema={pageSchema} updatePageSchema={updatePageSchema} />
            </div>
          </TabsContent>
          <TabsContent value="theme">
            <div className="theme-list">
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
            <Accordion value="filter" type="single" className="mt-2">
              <AccordionItem value="filter">
                <AccordionTrigger>页面滤镜</AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-center gap-8">
                    <span className="w-[60px]">是否开启</span>
                    <div className="flex items-center gap-4 flex-1">
                      <Switch
                        checked={pageSchema.filter?.open}
                        onCheckedChange={(value) =>
                          updatePageSchema('filter', {
                            ...pageSchema.filter,
                            open: value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={`filter-options mt-3 flex flex-col gap-2 text-sm font-medium`}>
                    <div className="flex items-center gap-8">
                      <span className="w-[60px]">对比度</span>
                      <div className="flex items-center gap-4 flex-1">
                        <Slider
                          className="flex-1"
                          value={[pageSchema.filter?.contrast || 0]}
                          onValueChange={(value) =>
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              contrast: value[0],
                            })
                          }
                          max={400}
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
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              saturation: value[0],
                            })
                          }
                          max={400}
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
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              brightness: value[0],
                            })
                          }
                          max={400}
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
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              opacity: value[0],
                            });
                          }}
                          max={100}
                        />
                        <span>{pageSchema.filter?.opacity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="w-[60px]">色相</span>
                      <div className="flex items-center gap-4 flex-1">
                        <Slider
                          className="flex-1"
                          value={[pageSchema.filter?.hueRotate || 0]}
                          onValueChange={(value) => {
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              hueRotate: value[0],
                            });
                          }}
                          max={360}
                        />
                        <span>{pageSchema.filter?.hueRotate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="w-[60px]">灰度</span>
                      <div className="flex items-center gap-4 flex-1">
                        <Slider
                          className="flex-1"
                          value={[pageSchema.filter?.grayscale || 0]}
                          onValueChange={(value) => {
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              grayscale: value[0],
                            });
                          }}
                          max={360}
                        />
                        <span>{pageSchema.filter?.grayscale}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="w-[60px]">反转</span>
                      <div className="flex items-center gap-4 flex-1">
                        <Slider
                          className="flex-1"
                          value={[pageSchema.filter?.invert || 0]}
                          onValueChange={(value) => {
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              invert: value[0],
                            });
                          }}
                          max={100}
                        />
                        <span>{pageSchema.filter?.invert}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <span className="w-[60px]">模糊</span>
                      <div className="flex items-center gap-4 flex-1">
                        <Slider
                          className="flex-1"
                          value={[pageSchema.filter?.blur || 0]}
                          onValueChange={(value) => {
                            updatePageSchema('filter', {
                              ...pageSchema.filter,
                              blur: value[0],
                            });
                          }}
                          max={10}
                        />
                        <span>{pageSchema.filter?.blur}</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PagePanel;

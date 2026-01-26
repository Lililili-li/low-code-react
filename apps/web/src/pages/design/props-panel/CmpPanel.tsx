import materialCmp, { MaterialType } from '@repo/core/material';
import { Input } from '@repo/ui/components/input';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import EventConfig from './components/event-config';
import StyleConfig from './components/style-config';
import BindVariableDialog from '../variable-panel/components/BindVariableDialog';
import Empty from '@/components/Empty';
import {
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  FlipHorizontal,
  Palette,
  Settings,
  Wrench,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalSpaceAround,
  AlignHorizontalJustifyEnd,
  FlipVertical,
  Film,
} from 'lucide-react';
import { Label } from '@repo/ui/components/label';
import { Switch } from '@repo/ui/components/switch';
import { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { Button } from '@repo/ui/components/button';
import { useComponentOperations } from '@/composable/use-component-operations';
import AnimateConfig from './components/animate-config';
import { ComponentSchema } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';

export interface ConfigProps {
  component: ComponentSchema;
  updateComponent: (component: Partial<ComponentSchema>) => void;
}

const CmpPanel = () => {
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const updateCurrentCmp = useDesignComponentsStore((state) => state.updateCurrentCmp);
  const currentCmp = useDesignComponentsStore((state) =>
    state.components.find((item) => item.id === currentCmpId),
  );

  const PropsCmp = materialCmp[currentCmp?.type as MaterialType]?.propsPanel;

  const cmpSelectEvents = materialCmp[currentCmp?.type as MaterialType]?.events || []; // 组件的内置事件

  const visibleProp = currentCmp?.visibleProp;
  const lock = currentCmp?.lock;

  const { updatePosition, transformComponent, lockComponent } = useComponentOperations();

  const [activeTab, setActiveTab] = useState('props');
  return (
    <div className="cmp-panel-container min-w-[300px] h-full">
      <Tabs className="h-full gap-0" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="props">
            <Settings className="size-3.5" />
            <span>属性</span>
          </TabsTrigger>
          {!currentCmp?.group && (
            <TabsTrigger value="event">
              <Wrench className="size-3.5" />
              <span>交互</span>
            </TabsTrigger>
          )}
          {!currentCmp?.group && (
            <TabsTrigger value="animate">
              <Film className="size-3.5" />
              <span>动画</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="style">
            <Palette className="size-3.5" />
            <span>样式</span>
          </TabsTrigger>
        </TabsList>
        <div className="p-2">
          <Input
            placeholder="请输入组件名称"
            value={currentCmp?.name}
            className="text-center h-[32px]"
            onChange={(e) => updateCurrentCmp({ name: e.target.value })}
          />
        </div>
        <ScrollArea className="flex-1 min-h-0 p-2 pt-0">
          {activeTab === 'props' && (
            <div className="flex flex-col gap-2 ">
              <div className="item flex justify-between gap-2 items-center px-2">
                <div className="shrink-0 w-[25%]">
                  <Label>是否渲染</Label>
                </div>
                <div className="flex-1 items-center flex">
                  {visibleProp?.type === 'JsExpression' ? (
                    <div className="text-[14px] text-[#5858f4]">已绑定:{visibleProp.value}</div>
                  ) : (
                    <Switch
                      checked={visibleProp?.value as boolean}
                      onCheckedChange={(value) => {
                        updateCurrentCmp({
                          ...currentCmp,
                          visibleProp: { type: 'normal', value: value },
                        });
                      }}
                    />
                  )}
                </div>
                <BindVariableDialog
                  id={visibleProp?.type === 'JsExpression' ? (visibleProp.value as string) : ''}
                  onChange={(value) =>
                    updateCurrentCmp({
                      ...currentCmp,
                      visibleProp: { type: 'JsExpression', value },
                    })
                  }
                  onClear={() =>
                    updateCurrentCmp({
                      ...currentCmp,
                      visibleProp: { type: 'normal', value: true },
                    })
                  }
                />
              </div>
              <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
                <div className="shrink-0 w-[25%]">
                  <Label>是否锁定</Label>
                </div>
                <div className="flex-1 items-center flex">
                  <Switch checked={lock} onCheckedChange={() => lockComponent(currentCmp!)} />
                </div>
              </div>
              <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
                <div className="shrink-0 w-[25%]">
                  <Label>水平对齐</Label>
                </div>
                <div className="flex-1 items-center flex gap-2">
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('horizontal', 'start', currentCmp!)}
                      >
                        <AlignHorizontalJustifyStart className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>左对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('horizontal', 'center', currentCmp!)}
                      >
                        <AlignHorizontalSpaceAround className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>居中对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('horizontal', 'end', currentCmp!)}
                      >
                        <AlignHorizontalJustifyEnd className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>右对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => transformComponent('horizontal', currentCmp!)}
                      >
                        <FlipHorizontal className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>水平翻转</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
                <div className="shrink-0 w-[25%]">
                  <Label>垂直对齐</Label>
                </div>
                <div className="flex-1 items-center flex gap-2">
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('vertical', 'start', currentCmp!)}
                      >
                        <AlignVerticalJustifyStart className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>顶部对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('vertical', 'center', currentCmp!)}
                      >
                        <AlignVerticalSpaceAround className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>居中对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePosition('vertical', 'end', currentCmp!)}
                      >
                        <AlignVerticalJustifyEnd className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>底部对齐</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="h-[32px]" asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => transformComponent('vertical', currentCmp!)}
                      >
                        <FlipVertical className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>垂直翻转</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
                <div className="shrink-0 w-[25%]">
                  <Label>css类名</Label>
                </div>
                <div className="flex-1 items-center flex gap-2">
                  <Input
                    placeholder="请输入css类名"
                    defaultValue={currentCmp?.className}
                    onEnterSearch={(value) => updateCurrentCmp({ ...currentCmp, className: value })}
                  />
                </div>
              </div>
            </div>
          )}
          <TabsContent value="props">
            {PropsCmp && (
              <PropsCmp
                bindVariable={({ key, onChange, onClear }) => (
                  <BindVariableDialog id={key} onChange={onChange} onClear={onClear} />
                )}
                schema={currentCmp as any}
                updateSchema={updateCurrentCmp}
              />
            )}
          </TabsContent>
          <TabsContent value="event">
            {currentCmp && <EventConfig selectEvents={cmpSelectEvents} />}
          </TabsContent>
          <TabsContent value="animate">
            {currentCmp && (
              <AnimateConfig component={currentCmp!} updateComponent={updateCurrentCmp} />
            )}
          </TabsContent>
          <TabsContent value="style">
            {currentCmp && (
              <StyleConfig component={currentCmp!} updateComponent={updateCurrentCmp} />
            )}
          </TabsContent>

          {!PropsCmp && !currentCmp?.group && <Empty description="请选择组件" />}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default CmpPanel;

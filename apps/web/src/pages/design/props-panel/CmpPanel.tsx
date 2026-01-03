import materialCmp, { MaterialType } from '@repo/core/material';
import { Input } from '@repo/ui/components/input';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import EventConfig from './components/event-config';
import StyleConfig from './components/style-config';
import BindVariable from '../variable-panel/components/BindVariable';
import { useDesignStore } from '@/store/modules/design';
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

export interface ConfigProps {
  component: ComponentSchema;
  updateComponent: (component: Partial<ComponentSchema>) => void;
}

const CmpPanel = () => {
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);
  const currentCmp = useDesignStore((state) => state.pageSchema.components.find(item => item.id === currentCmpId));
  const PropsCmp = materialCmp[currentCmp!.type as MaterialType]?.propsPanel;

  const visible = currentCmp?.visible;
  const lock = currentCmp?.lock;

  const { updatePosition, transformComponent } = useComponentOperations(updateCurrentCmp);

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
        {activeTab === 'props' && (
          <div className="flex flex-col gap-2 pl-2">
            <div className="item flex justify-between gap-2 items-center px-2">
              <div className="shrink-0 w-[25%]">
                <Label>是否渲染</Label>
              </div>
              <div className="flex-1 items-center flex">
                <Switch
                  checked={visible}
                  onCheckedChange={(value) => {
                    updateCurrentCmp({ ...currentCmp, visible: value });
                  }}
                />
              </div>
              <BindVariable name={2} />
            </div>
            <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
              <div className="shrink-0 w-[25%]">
                <Label>是否锁定</Label>
              </div>
              <div className="flex-1 items-center flex">
                <Switch
                  checked={lock}
                  onCheckedChange={(value) => {
                    updateCurrentCmp({ ...currentCmp, lock: value });
                  }}
                />
              </div>
            </div>
            <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
              <div className="shrink-0 w-[25%]">
                <Label>水平对齐</Label>
              </div>
              <div className="flex-1 items-center flex gap-2">
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => updatePosition('horizontal', 'start', currentCmp!)}>
                      <AlignHorizontalJustifyStart className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>左对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => updatePosition('horizontal', 'center', currentCmp!)}>
                      <AlignHorizontalSpaceAround className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>居中对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => updatePosition('horizontal', 'end', currentCmp!)}>
                      <AlignHorizontalJustifyEnd className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>右对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => transformComponent('horizontal', currentCmp!)}>
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
                    <Button size="sm" variant="outline" onClick={() => updatePosition('vertical', 'start', currentCmp!)}>
                      <AlignVerticalJustifyStart className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>顶部对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => updatePosition('vertical', 'center', currentCmp!)}>
                      <AlignVerticalSpaceAround className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>居中对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => updatePosition('vertical', 'end', currentCmp!)}>
                      <AlignVerticalJustifyEnd className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>底部对齐</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="h-[32px]" asChild>
                    <Button size="sm" variant="outline" onClick={() => transformComponent('vertical', currentCmp!)}>
                      <FlipVertical className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>垂直翻转</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 p-2 pt-0">
          <TabsContent value="props">
            {PropsCmp && (
              <PropsCmp
                bindVariable={({ name }) => <BindVariable name={name} />}
                schema={currentCmp as any}
                updateSchema={updateCurrentCmp}
              />
            )}
          </TabsContent>
          <TabsContent value="event">{currentCmp && <EventConfig />}</TabsContent>
          <TabsContent value="animate">{currentCmp && <AnimateConfig component={currentCmp!} updateComponent={updateCurrentCmp}/>}</TabsContent>
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

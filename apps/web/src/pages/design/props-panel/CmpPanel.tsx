import materialCmp from '@repo/core/material';
import { Input } from '@repo/ui/components/input';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import EventConfig from './components/event-config/EventConfig';
import BindVariable from '../variable-panel/components/BindVariable';
import { useDesignStore } from '@/store/modules/design';
import Empty from '@/components/Empty';
import { Palette, Settings, Wrench } from 'lucide-react';

const CmpPanel = () => {
  const currentCmpId = useDesignStore(state => state.currentCmpId);
  const updateCurrentCmp = useDesignStore(state => state.updateCurrentCmp);
  const currentCmp = useDesignStore(state => state.pageSchema.components.find(c => c.id === currentCmpId));
  const PropsCmp = materialCmp[currentCmp!.type]?.propsPanel;

  return (
    <div className="cmp-panel-container min-w-[300px] h-full">
      <Tabs defaultValue="props" className="h-full gap-0">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="props">
            <Settings className='size-3.5'/>
            <span>属性</span>
          </TabsTrigger>
          {/* <TabsTrigger value="data">数据</TabsTrigger> */}
          <TabsTrigger value="event">
            <Wrench className='size-3.5'/>
            <span>交互</span>
          </TabsTrigger>
          <TabsTrigger value="style">
            <Palette className='size-3.5'/>
            <span>样式</span>
          </TabsTrigger>
        </TabsList>
        <div className='p-2'>
          <Input
            placeholder="请输入组件名称"
            defaultValue={currentCmp?.name}
            className="text-center h-[32px]"
            onChange={(e) => updateCurrentCmp({ name: e.target.value })}
          />
        </div>
        <ScrollArea className="flex-1 min-h-0 p-2 pt-0">
          {PropsCmp ? (
            <>
              <TabsContent value="props">
                <PropsCmp
                  bindVariable={({ name }) => <BindVariable name={name} />}
                  schema={currentCmp}
                  updateSchema={updateCurrentCmp}
                />
              </TabsContent>
              <TabsContent value="event">
                <EventConfig />
              </TabsContent>
            </>
          ) : (
            <Empty description="请选择组件" />
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default CmpPanel;

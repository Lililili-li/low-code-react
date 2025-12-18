import materialCmp from '@repo/core/material';
import { Input } from '@repo/ui/components/input';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import DataConfig from './components/DataConfig';
import BindVariable from '../variable-panel/components/BindVariable';
import { useDesignStore } from '@/store/modules/design';
import Empty from '@/components/Empty';

const CmpPanel = () => {
  const { currentCmp, updateCurrentCmp } = useDesignStore();

  const PropsCmp = materialCmp[currentCmp.id]?.propsPanel;

  return (
    <div className="cmp-panel-container min-w-[300px] h-full">
      <Tabs defaultValue="props" className="h-full gap-0">
        <TabsList className="w-full rounded-none">
          <TabsTrigger value="props">属性</TabsTrigger>
          {/* <TabsTrigger value="data">数据</TabsTrigger> */}
          <TabsTrigger value="event">事件</TabsTrigger>
          <TabsTrigger value="style">样式</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1 min-h-0 p-2">
          {PropsCmp ? (
            <>
              <Input
                placeholder="请输入组件名称"
                defaultValue={currentCmp.name}
                className="text-center h-[32px] mb-4"
                onChange={(e) => updateCurrentCmp({ name: e.target.value })}
              />
              <TabsContent value="props">
                <PropsCmp
                  bindVariable={({ name }) => <BindVariable name={name} />}
                  schema={currentCmp}
                  updateSchema={updateCurrentCmp}
                />
              </TabsContent>
              <TabsContent value="event">
                <DataConfig />
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

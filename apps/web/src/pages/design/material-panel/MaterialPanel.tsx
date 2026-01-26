import { useMemo, useState } from 'react';
import DynamicIcon from '@/components/DynamicIcon';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import TabMenu from '@/components/TabMenu';
import { materialCategories, materialCmpList } from '@repo/core/material';

const MaterialPanel = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>('1');

  const [cmpName, setCmpName] = useState('');

  const filteredCmpList = useMemo(() => {
    return materialCmpList?.filter(
      (item) => item.name.indexOf(cmpName) !== -1 && item.category_id === activeCategory,
    );
  }, [cmpName, activeCategory]);

  return (
    <div className="material-panel w-full h-full flex">
      <div className="cmp-first-list shrink-0 w-[95px] border-r h-full flex flex-col gap-2">
        <TabMenu
          items={
            materialCategories?.map((c) => ({
              label: (
                <div className="flex items-center gap-2">
                  <DynamicIcon name={c.icon} className="size-4.5" />
                  <span>{c.name}</span>
                </div>
              ),
              value: c.id.toString(),
            })) || []
          }
          activeId={activeCategory!}
          onSelect={(value) => setActiveCategory(value.toString())}
          itemClassName="justify-center py-3 rounded-none border-b"
        />
      </div>
      <div className="cmp-list py-2 flex-1 flex flex-col gap-2">
        <div className="filter-wrap flex justify-center">
          <InputGroup className="w-[90%] h-[32px]">
            <InputGroupInput
              placeholder="请输入组件名称"
              defaultValue={cmpName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCmpName((e.target as any).value);
                }
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <ScrollArea className="h-[calc(100vh-50px-56px)] overflow-auto">
          <div className="w-full flex flex-col gap-2 items-center">
            {filteredCmpList?.map((item) => (
                <div
                  key={item.id}
                  className="cmp-item cursor-pointer flex flex-col items-center gap-2 px-3 py-2 w-[90%] bg-[#f2f3f5] dark:bg-[#252529] rounded-sm relative"
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({
                        id: item.id.toString(),
                        name: item.name,
                      }),
                    );
                  }}
                  draggable
                >
                  <img
                    src={item.cover}
                    alt=""
                    className="rounded-sm hover:scale-105 transition-all cursor-move min-w-[150px] h-[100px]"
                  />
                  <div className="header text-center w-full">
                    <span className="text-sm dark:text-gray-300">{item.name}</span>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MaterialPanel;

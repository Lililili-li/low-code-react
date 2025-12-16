import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import componentApi from '@/api/component';
import DynamicIcon from '@/components/DynamicIcon';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { Toggle } from '@repo/ui/components/toggle';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';

const MaterialPanel = () => {
  const { data: categories } = useRequest(() => componentApi.getComponentCategories(), {
    onSuccess: (data) => {
      setActiveCategory(data[0].id.toString());
      const children = data[0].children;
      if (children?.length > 0) {
        setActiveSubCategory(children[0].id.toString());
      }
    },
  });

  const [activeCategory, setActiveCategory] = useState<string | null>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('');

  const { data: components, runAsync: getComponentByCategory } = useRequest(() =>
    componentApi.getComponentByCategory(Number(activeSubCategory || 0)),
  );

  useEffect(() => {
    getComponentByCategory();
  }, [activeSubCategory]);
  const subCategories =
    categories?.find((item) => item.id.toString() === activeCategory)?.children || [];

  const [cmpName, setCmpName] = useState('');

  return (
    <div className="material-panel w-full h-full flex">
      <div className="cmp-first-list shrink-0 w-[70px] h-full py-2 bg-[#f5f5f5] dark:bg-[#252529] flex flex-col gap-2 items-center">
        {categories?.map((item) => {
          return (
            <Toggle
              size="sm"
              variant="default"
              pressed={activeCategory === item.id.toString()}
              className="flex-col h-auto p-2 w-[60px] data-[state=on]:bg-blue-500 data-[state=on]:text-white"
              onClick={() => setActiveCategory(item.id.toString())}
              style={{ borderRadius: 4 }}
              key={item.id}
            >
              <DynamicIcon name={item.icon} />
              <span>{item.name}</span>
            </Toggle>
          );
        })}
      </div>
      {subCategories?.length > 0 && (
        <div className="cmp-second-list shrink-0 w-[70px] border-r h-full py-2 flex flex-col gap-2 items-center">
          {subCategories?.map((item) => {
            return (
              <Toggle
                size="sm"
                variant="default"
                pressed={activeSubCategory === item.id.toString()}
                className="flex-col h-auto p-2 w-[60px] data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                onClick={() => {
                  setActiveSubCategory(item.id.toString())
                  
                }}
                style={{ borderRadius: 4 }}
                key={item.id}
              >
                <span>{item.name}</span>
              </Toggle>
            );
          })}
        </div>
      )}
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
            {components
              ?.filter((item) => item.name.includes(cmpName))
              .map((item) => (
                <div
                  key={item.id}
                  className="cmp-item cursor-pointer flex flex-col items-center gap-2 px-3 py-2 w-[90%] bg-[#f2f3f5] dark:bg-[#252529] rounded-sm relative"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                      id: item.id.toString(),
                      name: item.name
                    }));
                  }}
                  draggable
                >
                  <img
                    src={item.cover}
                    alt=""
                    className="rounded-sm hover:scale-105 transition-all cursor-move"
                  />
                  <div className="header dark:bg-[#2a2a2b] text-center w-full bg-[#f2f3f5]">
                    <span className="text-sm dark:text-gray-300 text-gray-500">{item.name}</span>
                  </div>
                </div>
              ))}
            {components?.filter((item) => item.name.includes(cmpName)).length === 0 && (
              <Empty description="暂无可用组件" />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MaterialPanel;

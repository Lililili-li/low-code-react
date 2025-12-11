import { useState } from 'react';
import { useRequest } from 'ahooks';
import componentApi from '@/api/component';
import DynamicIcon from '@/components/DynamicIcon';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';

const MaterialPanel = () => {
  const { data: categories } = useRequest(() => componentApi.getComponentCategories(), {
    onSuccess: (data) => {
      setActiveCategory(data[0].id.toString());
    },
  });

  const [activeCategory, setActiveCategory] = useState<string | null>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>('');

  const subCategories =
    categories?.find((item) => item.id.toString() === activeCategory)?.children || [];

  return (
    <div className="material-panel w-full h-full flex">
      <div className="cmp-first-list w-[70px] h-full py-2 bg-[#f5f5f5]">
        <ToggleGroup
          type="single"
          className="flex-col justify-center items-center w-full gap-2"
          value={activeCategory!}
          onValueChange={setActiveCategory}
        >
          {categories?.map((item) => {
            return (
              <ToggleGroupItem
                value={item.id.toString()}
                key={item.id}
                className="flex-col h-auto p-2 px-3 w-auto data-[state=on]:bg-primary data-[state=on]:text-white"
                style={{ borderRadius: 4 }}
              >
                <DynamicIcon name={item.icon} />
                <span>{item.name}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      {subCategories?.length > 0 && (
        <div className="cmp-second-list w-[70px] border-r h-full py-2">
          <ToggleGroup
            type="single"
            className="flex-col justify-center items-center w-full gap-2"
            value={activeSubCategory!}
            onValueChange={setActiveSubCategory}
          >
            {subCategories?.map((item) => {
              return (
                <ToggleGroupItem
                  value={item.id.toString()}
                  key={item.id}
                  className="flex-col h-auto p-2 px-3 w-auto data-[state=on]:bg-primary data-[state=on]:text-white"
                  style={{ borderRadius: 4 }}
                >
                  <span>{item.name}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};

export default MaterialPanel;

import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import TabMenu from '@/components/TabMenu';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { CategoryProps } from '@/api/common';

interface IndustryProps {
  queryParams: any;
  setQueryParams: any;
  getProjects?: any;
  categories: CategoryProps[];
}

const Category = ({ queryParams, setQueryParams, getProjects, categories }: IndustryProps) => {
  const [industryKeywords, setIndustryKeywords] = useState('');

  const showIndustries = useMemo(() => {
    const newData = categories
      ?.filter((industry) => {
        return industry.name.includes(industryKeywords);
      })
      .map((item) => ({
        label: item.name,
        value: item.value,
      }));
    newData?.unshift({
      label: '全部',
      value: '',
    });
    return newData;
  }, [industryKeywords, categories]);


  return (
    <div className="category border-r w-[240px] h-full dark:bg-[#18181b] flex flex-col gap-2 bg-white">
      <div className="filter-wrap h-[50px] px-3 flex items-center gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="请输入分类名称"
            defaultValue={industryKeywords}
            onEnterSearch={(value) => {
              setIndustryKeywords(value);
            }}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-3">
        <TabMenu
          items={showIndustries || []}
          activeId={queryParams.category_id}
          onSelect={(id) => {
            const newParams = { ...queryParams, category_id: id.toString() };
            setQueryParams(newParams);
            getProjects(newParams);
          }}
          itemClassName='pl-4 mb-2'
        />
      </ScrollArea>
    </div>
  );
};

export default Category;

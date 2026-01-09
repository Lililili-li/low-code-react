import { useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';

const DatasourcePanel = () => {
  const [keywords, setKeywords] = useState('');
  return (
    <div className="datasource-panel py-2 relative h-full flex flex-col">
      <div className="filter-wrap px-2 flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput
            placeholder="请输入变量名称"
            defaultValue={keywords}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                setKeywords((e.target as HTMLInputElement).value);
              }
            }}
          />
          <InputGroupAddon>
            <InputGroupButton onClick={() => {}} size="icon-xs" className="rounded-[50%]">
              <Search />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button size="sm" variant="outline" className="w-full">
          <PlusCircle className="size-4" />
          <span>添加数据源</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="variable-list border-t py-3 mt-3 gap-2">
          <Empty description="暂无数据" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default DatasourcePanel;

import { Label } from '@repo/ui/components/label';
import { MultiSelect } from '@repo/ui/components/multi-select';
import { useState } from 'react';

const pageOptions = [
  {
    label: '获取数据1',
    value: '1',
  },
  {
    label: '获取数据2',
    value: '2',
  },
  {
    label: '获取数据3',
    value: '3',
  },
  {
    label: '获取数据4',
    value: '4',
  },
];

const FetchAPI = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">请求接口配置</div>
      <div className="content flex flex-col">
        <div className="flex gap-2 flex-col">
          <Label className="w-15">关联接口</Label>
          <MultiSelect
            options={pageOptions}
            value={selectedValues}
            onChange={setSelectedValues}
            placeholder="请选择关联接口"
            maxDisplay={3}  // 最多显示3个标签
          />
        </div>
      </div>
    </div>
  );
};

export default FetchAPI;

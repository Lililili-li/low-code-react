import MonacoEditor from '@/components/MonacoEditor';
import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Label } from '@repo/ui/components/label';
import { Edit, Save, Settings } from 'lucide-react';
import { useState } from 'react';

const selectOptions = [
  {
    label: '静态数据',
    value: '1',
  },
  {
    label: '动态数据',
    value: '2',
  },
];

const StaticDataDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="size-4" />
          <span>设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-4 sm:max-w-[1000px]">
        <DialogHeader>数据值</DialogHeader>
        <MonacoEditor value={''} language="json" height={'600px'} />
        <DialogFooter className="flex gap-2">
          <div className="operation flex gap-2">
            <DialogClose asChild>
              <Button size="sm" variant="outline">
                取消
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button size="sm">
                <Save />
                <span>保存</span>
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 设置变量  使用变量  或者静态数据
const DataConfig = () => {
  const [activeDataType, setActiveDataType] = useState('1');
  return (
    <div className="data-config-container flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>数据类型</Label>
        <div className="flex items-center gap-2">
          <Select
            options={selectOptions}
            value={activeDataType}
            onChange={(value) => setActiveDataType(value)}
            placeholder="请选择数据来源"
            allowClear={false}
            className="flex-1"
          />
          <StaticDataDialog />
        </div>
      </div>
      <div className="filter-func flex flex-col gap-2">
        <Label>预处理器</Label>
        <div className="filter-list flex items-center gap-2">
          <Select
            value=""
            onChange={() => {}}
            options={[]}
            placeholder="请选择过滤条件"
            className="flex-1"
          />
          <Button variant="outline" size="sm">
            <Edit className="size-4" />
            <span>编辑</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataConfig;

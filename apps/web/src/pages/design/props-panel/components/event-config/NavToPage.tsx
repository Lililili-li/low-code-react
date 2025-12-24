import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { InputGroup, InputGroupText, InputGroupInput } from '@repo/ui/components/input-group';
import { Label } from '@repo/ui/components/label';
import { CirclePlus } from 'lucide-react';

const NavToPage = () => {
  const pageOptions = [
    {
      label: '综合概览',
      value: '1',
    },
    {
      label: '客流分析',
      value: '2',
    },
    {
      label: '景区资源',
      value: '3',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">跳转当前应用页面配置</div>
      <div className="content flex flex-col gap-2">
        <div className="flex gap-4">
          <Label className="w-15">页面地址</Label>
          <Select
            options={pageOptions}
            placeholder="请选择页面"
            value="1"
            onChange={(value) => console.log('selected value:', value)}
            className="w-[240px]"
          ></Select>
        </div>
        <div className="flex gap-4">
          <Label className="w-15">跳转延迟</Label>
          <InputGroup className="w-[120px]">
            <InputGroupInput value={0} type="number" />
            <InputGroupText className="mr-2">秒</InputGroupText>
          </InputGroup>
        </div>
        <div className="flex gap-4">
          <Label className="w-15">携带参数</Label>
          <div className="list flex-col gap-2">
            <div className="flex gap-2">
              <Label>key</Label>
              <Input placeholder="参数名"  className='w-[180px]'/>
              <Label>value</Label>
              <Input placeholder="参数值" className='w-[180px]' />
              <Button size='sm' variant='ghost'>
                <CirclePlus className='size-4'/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavToPage;

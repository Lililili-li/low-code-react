import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { HelpCircle, Keyboard, Lock, Redo, Undo, Unlock } from 'lucide-react';
import { Slider } from '@repo/ui/components/slider';
import { useState } from 'react';

const ratioOptions = [
  {
    label: '50%',
    value: '50',
  },
  {
    label: '100%',
    value: '100',
  },
  {
    label: '150%',
    value: '150',
  },
  {
    label: '200%',
    value: '200',
  },
];

const Toolbar = () => {
  const [lock, setLock] = useState(false);

  const [ratio, setRatio] = useState('100');

  return (
    <div className="toolbar flex items-center justify-between w-full">
      <div className="toolbar-left flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              <Keyboard />
              <span>快捷键</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>快捷键说明</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              <HelpCircle />
              <span>操作记录</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>最多存储100条记录</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              <Undo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>撤销</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              <Redo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>恢复</TooltipContent>
        </Tooltip>
      </div>
      <div className="toolbar-right flex gap-2">
        <Select
          options={ratioOptions}
          value={ratio}
          onChange={(value) => setRatio(value)}
          placeholder="请选择比例"
          disabled={lock}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => setLock((prev) => !prev)}>
              {lock ? <Unlock /> : <Lock />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{lock ? '解锁比例' : '锁定比例'}</TooltipContent>
        </Tooltip>
        <div className="slider-container flex items-center gap-2">
          <Slider
            value={[Number(ratio)]}
            min={10}
            max={200}
            step={10}
            onValueChange={(value) => setRatio(value[0].toString())}
            className='w-[180px]'
            disabled={lock}
          />
          <span className={`lock ${lock ? 'text-muted-foreground' : 'text-foreground'}`}>{ratio}%</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

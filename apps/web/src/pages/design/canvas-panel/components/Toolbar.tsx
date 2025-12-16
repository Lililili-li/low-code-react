import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { HelpCircle, Keyboard, Lock, Redo, Undo, Unlock } from 'lucide-react';
import { Slider } from '@repo/ui/components/slider';
import { useDesignStore } from '@/store/modules/design';
import { useState } from 'react';
import HotKeyDialog from './HotKeyDialog';

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
  const { config, setCanvasPanel } = useDesignStore();

  const [openHotKeyDialog, setOpenHotKeyDialog] = useState(false);

  return (
    <div className="toolbar flex items-center justify-between w-full">
      <div className="toolbar-left flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <HotKeyDialog>
              <Button size="sm" variant="outline" onClick={() => setOpenHotKeyDialog(true)}>
                <Keyboard />
                <span>快捷键</span>
              </Button>
            </HotKeyDialog>
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
          value={Number(config.canvasPanel.zoom * 100).toFixed(0)}
          onChange={(value) => setCanvasPanel({ zoom: Number(value) / 100 })}
          placeholder="请选择比例"
          disabled={config.canvasPanel.lockZoom}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCanvasPanel({ lockZoom: !config.canvasPanel.lockZoom })}
            >
              {config.canvasPanel.lockZoom ? <Unlock /> : <Lock />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{config.canvasPanel.lockZoom ? '解锁比例' : '锁定比例'}</TooltipContent>
        </Tooltip>
        <div className="slider-container flex items-center gap-2">
          <Slider
            value={[Number(Number(config.canvasPanel.zoom * 100).toFixed(0))]}
            min={10}
            max={200}
            step={1}
            onValueChange={(value) => setCanvasPanel({ zoom: Number(value[0]) / 100 })}
            className="w-[180px]"
            disabled={config.canvasPanel.lockZoom}
          />
          <span
            className={`lock ${config.canvasPanel.lockZoom ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            {Number(config.canvasPanel.zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Keyboard, Lock, Redo, Undo, Unlock } from 'lucide-react';
import { Slider } from '@repo/ui/components/slider';
import { useDesignStore } from '@/store/design';
import HotKeyDialog from '../../components/HotKeyDialog';
import { useHistoryStore } from '@/store/history';
import { eventBus } from '@repo/shared';

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
  const { panelConfig, setCanvasPanel } = useDesignStore();
  const historyStore = useHistoryStore();

  return (
    <div className="toolbar flex items-center justify-between w-full">
      <div className="toolbar-left flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <HotKeyDialog>
              <Button size="sm" variant="outline">
                <Keyboard />
                <span>快捷键</span>
              </Button>
            </HotKeyDialog>
          </TooltipTrigger>
          <TooltipContent>快捷键说明</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                eventBus.emit('handleUndo')
              }}
            >
              <Undo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>撤销</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                eventBus.emit('handleRedo')
              }}
            >
              <Redo />
            </Button>
          </TooltipTrigger>
          <TooltipContent>恢复</TooltipContent>
        </Tooltip>
      </div>
      <div className="toolbar-right flex gap-2">
        <Select
          options={ratioOptions}
          value={Number(panelConfig.canvasPanel.zoom * 100).toFixed(0)}
          onChange={(value) => setCanvasPanel({ zoom: Number(value) / 100 })}
          placeholder="请选择比例"
          disabled={panelConfig.canvasPanel.lockZoom}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCanvasPanel({ lockZoom: !panelConfig.canvasPanel.lockZoom })}
            >
              {panelConfig.canvasPanel.lockZoom ? <Unlock /> : <Lock />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{panelConfig.canvasPanel.lockZoom ? '解锁比例' : '锁定比例'}</TooltipContent>
        </Tooltip>
        <div className="slider-container flex items-center gap-2">
          <Slider
            value={[Number(Number(panelConfig.canvasPanel.zoom * 100).toFixed(0))]}
            min={10}
            max={200}
            step={1}
            onValueChange={(value) => setCanvasPanel({ zoom: Number(value[0]) / 100 })}
            className="w-[180px]"
            disabled={panelConfig.canvasPanel.lockZoom}
          />
          <span
            className={`lock ${panelConfig.canvasPanel.lockZoom ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            {Number(panelConfig.canvasPanel.zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;

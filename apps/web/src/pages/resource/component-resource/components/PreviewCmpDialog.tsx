import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Button } from '@repo/ui/components/button';
import { Eye } from 'lucide-react';
import { createFunctionComponent } from '@/utils/jsxTransform';
import { useDesignStateStore } from '@/store';

const PreviewCmpDialog = ({ code }: { code: string }) => {

  const state = useDesignStateStore((state) => state.state)

  const Component = createFunctionComponent(code, {
    imports: {
      state
    },
  });

  return (
    <Dialog>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Eye />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>
          <span>预览</span>
        </TooltipContent>
        <DialogContent className="size-[80%] p-4 flex flex-col ">
          <DialogHeader>
            <DialogTitle>预览组件</DialogTitle>
            <DialogDescription>预览当前组件不可编辑</DialogDescription>
          </DialogHeader>
          <div className="preview-container flex-1 dark:bg-[#18181b] rounded-md overflow-hidden">
            <Component />
          </div>
        </DialogContent>
      </Tooltip>
    </Dialog>
  );
};

export default PreviewCmpDialog;

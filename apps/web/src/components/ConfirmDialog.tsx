import { IconAlertTriangle } from '@douyinfe/semi-icons';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';

interface ConfirmDialogProps {
  title?: string;
  description: string;
  trigger: React.ReactNode;
  onConfirm: () => void;
}

const ConfirmDialog = ({ title = '温馨提示!', description, trigger, onConfirm }: ConfirmDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md pb-4">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'><IconAlertTriangle className='text-orange-400'/>{title}</DialogTitle>
          <DialogDescription className='mt-2'>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              取消
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="default" onClick={onConfirm}>
              确定
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;

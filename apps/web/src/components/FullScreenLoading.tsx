import { Spinner } from '@repo/ui/components/spinner';
import { createPortal } from 'react-dom';

interface FullScreenLoadingProps {
  visible?: boolean;
  text?: string;
}

const FullScreenLoading = ({ visible = false, text = '正在保存中，请不要关闭页面...' }: FullScreenLoadingProps) => {
  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 animate-in fade-in duration-200 flex-col gap-4">
      <Spinner className="size-6 text-primary/90"/>
      <span className="dark:text-foreground text-gray-50 text-sm font-medium">{text}</span>
    </div>,
    document.body
  );
};

export default FullScreenLoading;

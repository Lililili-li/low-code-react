import { Dialog, DialogContent, DialogTitle } from '@repo/ui/components/dialog';

interface ImagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string | null;
  alt?: string;
  title?: string;
}

const ImagePreview = ({
  open,
  onOpenChange,
  src,
  alt = '预览图片',
  title = '图片预览',
}: ImagePreviewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={Boolean(src)}
        className="w-auto max-w-[90vw] border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] rounded-md object-contain"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;

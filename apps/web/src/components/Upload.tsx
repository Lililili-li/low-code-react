import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Plus, X, Eye, Loader2 } from 'lucide-react';
import Viewer from 'react-viewer';

export interface UploadFile {
  uid: string;
  name?: string;
  url: string;
  status?: 'uploading' | 'done' | 'error';
  percent?: number;
}

interface UploadProps {
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
  onUpload?: (file: File) => Promise<string>;
  maxCount?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  description?: React.ReactNode;
  model?: 'picture' | 'file';
  trigger?: React.ReactNode;
}

const Upload = ({
  value = [],
  onChange,
  onUpload,
  maxCount = 1,
  accept = 'image/*',
  multiple = false,
  disabled = false,
  className,
  description,
}: UploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  useEffect(() => {
    setFileList(value);
  }, [value])
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUid = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const updateFileList = useCallback(
    (newFiles: UploadFile[]) => {
      setFileList(newFiles);
      onChange?.(newFiles);
    },
    [onChange],
  );

  const handlePreview = useCallback((file: UploadFile) => {
    setPreviewImage(file.url);
    setPreviewOpen(true);
  }, []);

  const handleRemove = useCallback(
    (uid: string) => {
      const newFiles = fileList.filter((f) => f.uid !== uid);
      updateFileList(newFiles);
    },
    [fileList, updateFileList],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files).slice(0, maxCount - fileList.length);

      for (const file of fileArray) {
        const uid = generateUid();
        const newFile: UploadFile = {
          uid,
          name: file.name,
          url: '',
          status: 'uploading',
          percent: 0,
        };

        const updatedList = [...fileList, newFile];
        updateFileList(updatedList);

        try {
          let url: string;
          if (onUpload) {
            url = await onUpload(file);
          } else {
            url = URL.createObjectURL(file);
          }

          setFileList((prev) => {
            const updated = prev.map((f) =>
              f.uid === uid ? { ...f, url, status: 'done' as const } : f,
            );
            onChange?.(updated);
            return updated;
          });
        } catch {
          setFileList((prev) => {
            const updated = prev.map((f) =>
              f.uid === uid ? { ...f, status: 'error' as const } : f,
            );
            onChange?.(updated);
            return updated;
          });
        }
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [fileList, maxCount, onChange, onUpload, updateFileList],
  );

  const handleUploadClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const canUpload = fileList.length < maxCount && !disabled;
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {fileList.map((file) => (
        <div
          key={file.uid}
          className="relative group w-full h-[150px] rounded-md border border-border overflow-hidden bg-muted"
        >
          {file.status === 'uploading' ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : file.status === 'error' ? (
            <div className="w-full h-full flex items-center justify-center text-destructive text-xs">
              上传失败
            </div>
          ) : file.url ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : null}

          {file.status === 'done' && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/20"
                onClick={() => handlePreview(file)}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/20"
                onClick={() => handleRemove(file?.uid)}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {file.status !== 'done' && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 size-5 bg-black/50 text-white hover:bg-black/70"
              onClick={() => handleRemove(file?.uid)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ))}

      {canUpload && (
        <div
          onClick={handleUploadClick}
          className={cn(
            'w-full h-[150px] rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-primary hover:bg-accent',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <Plus className="size-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mt-1">上传图片</span>
          {description && description}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Viewer
        images={[{ src: previewImage }]}
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default Upload;

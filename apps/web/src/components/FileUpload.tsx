import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { Upload, Download, Loader2, FileText } from 'lucide-react';
import { UploadProps } from '@/api/common';

export interface FileUploadItem {
  uid?: string;
  name?: string;
  url: string;
  status?: 'uploading' | 'done' | 'error';
  size?: number;
}

interface FileUploadProps {
  value?: FileUploadItem; // 文件信息
  onChange?: (data: UploadProps) => void;
  onUpload?: (file: File) => Promise<UploadProps>;
  accept?: string;
  disabled?: boolean;
  className?: string;
  description?: React.ReactNode;
}

const FileUpload = ({
  value,
  onChange,
  onUpload,
  accept = '*',
  disabled = false,
  className,
  description,
}: FileUploadProps) => {
  const [file, setFile] = useState<(FileUploadItem & Partial<UploadProps>) | null>(
    value ? { url: value.url, status: 'done', name: value.name } : null,
  );

  useEffect(() => {
    if (value) {
      setFile({ url: value.url, status: 'done', name: value.name, size: value.size });
    }
  }, [value]);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUid = () => `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const handleDownload = useCallback((url: string, name?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || '文件';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const selectedFile = files[0];
      const uid = generateUid();
      const newFile: FileUploadItem = {
        uid,
        name: selectedFile.name,
        url: '',
        status: 'uploading',
      };

      setFile(newFile);

      try {
        const res = await onUpload?.(selectedFile);

        const updatedFile = { ...newFile, url: res?.path, status: 'done' as const };
        setFile(updatedFile as any);
        onChange?.(res!);
      } catch {
        setFile({ ...newFile, status: 'error' as const });
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [onChange, onUpload],
  );

  const handleUploadClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* 上传按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUploadClick}
        disabled={disabled}
        className="w-full"
      >
        <Upload className="size-4 mr-2" />
        {file?.status === 'done' ? '重新上传' : '上传文件'}
      </Button>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* 文件列表 */}
      {file && (
        <div className="border rounded-md p-3">
          {file.status === 'uploading' ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span>上传中...</span>
            </div>
          ) : file.status === 'error' ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <FileText className="size-4" />
              <span>上传失败</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{file.name || '已上传文件'}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file.url, file.name)}
                className="shrink-0"
              >
                <Download className="size-4 mr-1" />
                下载
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;

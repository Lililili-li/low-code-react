import { FC, useState, useRef, useEffect } from 'react';
import { Upload, X, Play } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // MB
  onChange?: (url: string) => void;
  value?: string;
  className?: string;
  type: 'image' | 'video'
}

const FileUpload: FC<FileUploadProps> = ({
  accept = 'image/png,image/gif,image/jpg,image/jpeg,video/*',
  maxSize = 10,
  onChange,
  value = '',
  className = '',
  type = 'image'
}) => {
  const [fileUrl, setFileUrl] = useState<string>(value);
  const [fileType, setFileType] = useState<'image' | 'video'>(type);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // 检查文件大小
    if (selectedFile.size > maxSize * 1024 * 1024) {
      alert(`文件 ${selectedFile.name} 超过 ${maxSize}MB 限制`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const type = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      setFileUrl(url);
      setFileType(type);
      onChange?.(url);
    };
    reader.readAsDataURL(selectedFile);

    // 重置input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setFileUrl('');
    onChange?.('');
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    setFileUrl(value)
  }, [value]);

  return (
    <div className={`file-upload-container w-full h-full ${className}`}>
      {fileUrl ? (
        <div
          className="relative size-full aspect-square rounded-lg overflow-hidden bg-gray-900 border-2 border-gray-700 hover:border-blue-500 transition-all max-w-md"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {fileType === 'image' ? (
            <img
              src={fileUrl}
              alt="uploaded file"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                src={fileUrl}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          )}

          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleUploadClick}
          className="relative size-full aspect-square rounded-lg overflow-hidden bg-linear-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-dashed border-gray-600 hover:border-blue-500 cursor-pointer transition-all group max-w-md"
          style={{
            background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3548 50%, #1a1f2e 100%)',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* 3D Platform Effect */}
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform"></div>
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-600 via-purple-600 to-blue-600 relative flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Upload className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center z-10">
              <p className="text-gray-300 text-sm font-medium">
                图片格式为png/gif/jpg/jpeg格式
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-1/2 w-0.5 h-8 bg-linear-to-b from-transparent via-cyan-400 to-transparent opacity-50"></div>
            <div className="absolute top-8 right-8 w-0.5 h-12 bg-linear-to-b from-transparent via-blue-400 to-transparent opacity-30"></div>
            <div className="absolute bottom-12 left-12 w-0.5 h-10 bg-linear-to-b from-transparent via-purple-400 to-transparent opacity-40"></div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;

import { useTheme } from '@/composable/use-theme';
import { Button } from '@repo/ui/components/button';
import { useRequest } from 'ahooks';
import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import resourceApi from '@/api/resource';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Input } from '@repo/ui/components/input';
import Select from '@/components/Select';
import dayjs from 'dayjs';
import Empty from '@/components/Empty';
import commonApi from '@/api/common';

interface DraggableModalProps {
  visible: boolean;
  title?: string;
  width?: number;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  visible,
  title,
  width = 400,
  onClose,
  defaultPosition = { x: window.innerWidth / 2 + width / 2, y: window.innerHeight / 2 - 100 },
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();

  useEffect(() => {
    if (visible) {
      setPosition(defaultPosition);
    }
  }, [visible]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const [resourceName, setResourceName] = useState('');
  const { data: files } = useRequest(
    (params = { name: '', category_id: '', format: '', page: 1, size: 999999 }) =>
      resourceApi.getFileResource(params),
    {
      refreshDeps: [],
    },
  );

  const [category, setCategory] = useState('');

  const { data: categories } = useRequest(() => commonApi.getCategoryByModuleId('file-resource'), {
    refreshDeps: [],
    onSuccess: (data) => {
      setCategory(data?.[0]?.value);
    },
  });

  const fileList = files?.list?.filter(
    (item) => item.name.includes(resourceName) && item.category_id == category,
  );

  if (!visible) return null;

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      className="border p-2"
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme === 'dark' ? '#18181b' : '#fafafa',
        }}
        className="mb-2"
      >
        <div style={{ fontSize: '16px', fontWeight: 500 }}>{title}</div>
        {onClose && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        )}
      </div>
      <div className="content">
        <div className="filter-wrap flex gap-2 mb-2">
          <Input
            placeholder="资源名称"
            defaultValue={resourceName}
            onEnterSearch={(value) => setResourceName(value)}
          />
          <Select
            placeholder="资源类型"
            options={categories?.map((item) => ({ label: item.name, value: item.value })) || []}
            value={category}
            onChange={(value) => setCategory(value)}
            className="w-[140px]"
          />
        </div>
        <ScrollArea className="h-[400px] ">
          <div className="flex flex-col gap-2 list-disc">
            {fileList?.map((item) => (
              <div
                key={item.name}
                className="flex gap-2 cursor-grab"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({
                      id: 'image',
                      name: '图片',
                      url: item.url,
                      from: 'file-resource',
                    }),
                  );
                }}
              >
                <img src={item.url} alt={item.name} className="w-24 h-20 rounded-[4px] border" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className="text-sm">
                    {dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </div>
              </div>
            ))}
            {fileList?.length === 0 && <Empty description="没有找到资源" />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DraggableModal;

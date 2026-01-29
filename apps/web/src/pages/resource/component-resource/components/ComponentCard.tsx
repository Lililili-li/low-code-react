import Empty from '@/components/Empty';
import { Button } from '@repo/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import dayjs from 'dayjs';
import { Edit, Trash2 } from 'lucide-react';
import PreviewCmpDialog from './PreviewCmpDialog';
import { useNavigate } from 'react-router';

interface ComponentCardProps {
  cover: string;
  name: string;
  onDelete: (id: string) => void;
  id: string;
  category_id: string;
  categories: {
    label: string;
    value: string;
  }[];
  created_at: string;
  is_active: boolean;
  code: string;
}

const ComponentCard = ({
  cover,
  name,
  onDelete,
  id,
  category_id,
  categories,
  created_at,
  is_active,
  code
}: ComponentCardProps) => {

  const navigate = useNavigate()

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="h-[180px] cover flex items-center justify-center dark:bg-black bg-gray-200">
        {cover ? (
          <img src={cover} alt="" className="size-full" />
        ) : (
          <Empty description="暂无封面" />
        )}
      </div>
      <div className="info p-3">
        <div className="flex justify-between">
          <div className="text-ellipsis overflow-hidden font-medium flex items-center">
            <div
              className={`rounded-[50%] w-2.5 h-2.5 mr-1.5 ${is_active ? 'bg-green-500' : 'bg-gray-500'}`}
            ></div>
            <span>{name}</span>
          </div>
          <div className="text-ellipsis overflow-hidden text-sm">
            {categories.find((item) => item.value === category_id)?.label}
          </div>
        </div>
        <div className="actions flex justify-between mt-4 items-center">
          <div className="create_at text-sm dark:text-gray-400">
            {dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}
          </div>
          <div className="flex gap-2">
            <PreviewCmpDialog code={code} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => {navigate('/manage/resource/component?id=' + id)}}>
                  <Edit />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>编辑</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onDelete(id)}>
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>删除</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;

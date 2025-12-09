import { Card, CardContent, CardTitle } from '@/components/Card';
import { APP_STATUS } from '../Application';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { Button } from '@repo/ui/components/button';
import { AppWindow, Copy, Edit, Share, Trash2, Wrench } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';


interface ApplicationCardProps {
  data: Record<string, any>;
  onPreview: () => void;
}
const ApplicationCard = ({ data, onPreview }: ApplicationCardProps) => {
  return (
    <Card
      key={data.id}
      className="p-0 overflow-hidden rounded-[6px] shadow-lg dark:bg-gray-900 dark:border dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 dark:hover:border-gray-500 transition-all duration-200"
    >
      <CardTitle className="relative hover:cursor-zoom-in" onClick={onPreview}>
        <img src={data.cover} alt="" className="w-full object-cover min-h-[160px] max-h-[300px]" />
        <div
          className={`${data.status === 1 ? 'bg-primary' : data.status === 2 ? 'bg-gray-500' : 'bg-[#4b9e5f]'} absolute right-3 top-3 text-xs px-1 py-1 rounded-sm text-white`}
        >
          <span className="status-text">{APP_STATUS[data.status as keyof typeof APP_STATUS]}</span>
        </div>
      </CardTitle>
      <CardContent className="mt-0 p-4">
        <div className="title font-bold">{data.title}</div>
        <div className="information flex items-center mt-2 text-sm">
          <div className="dev w-[50%] text-muted-foreground">
            <span>开发人员：</span>
            {data.development.map((data: {name: string}) => data.name).join('，')}
          </div>
          <div className="create w-[40%] text-muted-foreground">
            <span>创建人员：</span>
            <span>{data.created_by}</span>
          </div>
        </div>
        <div className="operations flex items-center justify-between mt-4">
          <div className="export-option flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="size-8">
                  <Edit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>编辑</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="size-8">
                  <Share className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>导出</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="size-8">
                  <Copy className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>复制</span>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <ConfirmDialog
                trigger={
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="sm" className="size-8">
                      <Trash2 className="size-4" />
                    </Button>
                  </TooltipTrigger>
                }
                description="确定要删除该应用吗？"
                onConfirm={() => {}}
              />
              <TooltipContent>
                <span>删除</span>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="dev-option gap-2 flex items-center">
            <Button variant="outline" size="sm">
              <AppWindow />
              <span>预览</span>
            </Button>
            <Button variant="default" size="sm">
              <Wrench />
              <span>开发</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;

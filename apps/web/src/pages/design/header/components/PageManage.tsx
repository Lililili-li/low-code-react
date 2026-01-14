import { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@repo/ui/components/alert-dialog';

import { ChevronDown, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { IconAlertTriangle } from '@douyinfe/semi-icons';
import CreatePage from '../../../application/components/PageCenter';
import SavePage, { SavePageRef } from './SavePage';
import { useRequest } from 'ahooks';
import { useQuery } from '@/composable/use-query';
import pageApi, { PageProps } from '@/api/page';
import { toast } from 'sonner';
import { useDesignStore } from '@/store/design';
import { PageSchema } from '@repo/core/types';

const Select = ({
  options,
  value,
  placeholder,
  onValueChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const savePageRef = useRef<SavePageRef>(null);

  return (
    <>
      <Popover open={visible} onOpenChange={setVisible}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex justify-between w-[240px]"
            onClick={() => setVisible(true)}
            size="sm"
          >
            <span>{options.find((item) => item.value === value)?.label || placeholder}</span>
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <ScrollArea className="max-h-[300px] p-2 ">
            <div className="options flex flex-col gap-2">
              {options.map((item) => {
                return (
                  <div
                    className={`item flex justify-between items-center dark:hover:bg-[#242424] hover:bg-[#f4f4f5] transition-all cursor-pointer p-1.5 text-sm rounded-[4px] ${value === item.value ? 'dark:bg-[#242424]' : ''}`}
                    onClick={() => {
                      onValueChange(item.value);
                      setVisible(false);
                    }}
                    key={item.value}
                  >
                    <span>{item.label}</span>
                    <div className="operate gap-1 flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="p-0 size-6 rounded-[50%]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisible(false);
                              savePageRef.current?.openDialog();
                            }}
                          >
                            <Edit className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>编辑</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="p-0 size-6 rounded-[50%]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVisible(false);
                              setDeleteDialogVisible(true);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <AlertDialog open={deleteDialogVisible} onOpenChange={setDeleteDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="text-orange-400" />
              删除页面
            </AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复，确定要删除选中的页面吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-[32px]">取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}} className="h-[32px]">
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SavePage ref={savePageRef} />
    </>
  );
};

const PageManage = () => {

  const pageSchema = useDesignStore((state) => state.pageSchema)
  const setPageSchema = useDesignStore((state) => state.setPageSchema)

  const [currentPage, setCurrentPage] = useState('1');

  const queryParams = useQuery();
  const { data: pageOptions, runAsync: getPagesByApplicationId } = useRequest(
    () => pageApi.getPagesByApplicationId(Number(queryParams!.id)),
    {
      onSuccess: (value) => {
        setCurrentPage(value[0].id.toString());
      }
    },
  );

  useRequest(() => pageApi.getPageById(currentPage), {
    onSuccess: (data: PageProps & { schema: PageSchema }) => {
      if (data) {
        setPageSchema({
          ...pageSchema,
          ...data.schema
        })
      }
    },
    refreshDeps: [currentPage],
  })


  const handleCreateSuccess = () => {
    toast.success('创建成功');
    getPagesByApplicationId();
  }
  
  return (
    <div className="header-center flex gap-1 items-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <Select
        value={currentPage}
        options={
          pageOptions?.map((item) => ({
            label: item.name,
            value: item.id.toString(),
          })) || []
        }
        onValueChange={setCurrentPage}
        placeholder="请选择页面"
      />
      <CreatePage
        renderTrigger={
          <Button size="sm" variant="outline">
            <PlusCircle />
          </Button>
        }
        application_id={Number(queryParams!.id)}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default PageManage;

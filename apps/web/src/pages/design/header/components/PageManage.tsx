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
import CreatePage from './CreatePage';
import SavePage, { SavePageRef } from './SavePage';

const pageOptions = [
  {
    label: '综合概览',
    value: '1',
  },
  {
    label: '客流分析',
    value: '2',
  },
  {
    label: '景区资源',
    value: '3',
  },
];

const Select = ({
  options,
  value,
  placeholder,
  onValueChange,
}: {
  options: typeof pageOptions;
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
                    className={`item flex justify-between items-center dark:hover:bg-[#242424] transition-all cursor-pointer p-1.5 text-sm rounded-[4px] ${value === item.value ? 'dark:bg-[#242424]' : ''}`}
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
                              savePageRef.current?.openDialog()
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
  const [page, setPage] = useState('1');
  return (
    <div className="header-center flex gap-1 items-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
      <Select value={page} options={pageOptions} onValueChange={setPage} placeholder="请选择页面" />
      <CreatePage
        renderTrigger={
          <Button size="sm" variant="outline">
            <PlusCircle />
          </Button>
        }
      />
    </div>
  );
};

export default PageManage;

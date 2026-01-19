import { useRef, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Copy, Edit, Search, Trash2 } from 'lucide-react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';
import SaveDatasource, { SaveDatasourceRef } from './components/SaveDatasource';
import { useDesignDatasourceStore } from '@/store/design/dataSource';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { cloneDeep } from 'lodash-es';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { DatasourceSchema } from '@repo/core/types';

const DatasourceList = ({
  list,
  onOpenSaveDialog,
  deleteRecord,
}: {
  list: DatasourceSchema[];
  onOpenSaveDialog: (type: string, item?: DatasourceSchema) => void;
  deleteRecord: (id: string) => void;
}) => {
  return (
    <div className="datasource-list flex flex-col ">
      {list.map((item, index) => (
        <div
          key={item.id}
          className={`datasource-item py-3 border-b ${index === list.length - 1 ? 'border-b-0' : ''}`}
        >
          <div className="header flex items-center justify-between px-3 mb-1">
            <div
              className="name text-[16px] cursor-pointer hover:text-primary transition-colors"
              onClick={() => onOpenSaveDialog('check', item)}
            >
              {item.name}
            </div>
            <div className="actions flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => onOpenSaveDialog('edit', item)}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>编辑</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => onOpenSaveDialog('copy', item)}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>复制</p>
                </TooltipContent>
              </Tooltip>
              <AlertDialog>
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button size="sm" variant="link" className="p-0 h-auto">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent>
                    <p>删除</p>
                  </TooltipContent>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>是否确定要删除?</AlertDialogTitle>
                      <AlertDialogDescription>
                        该操作无法撤销，删除后将永久删除您的数据。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteRecord(item.id)}>
                        确定
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </Tooltip>
              </AlertDialog>
            </div>
          </div>
          <div className="footer flex items-center justify-between px-3">
            <div className="url text-[rgb(146,146,147)] text-sm">{item.url}</div>
            <div
              className={`method ${item.method === 'GET' ? 'text-[#22c55d]' : item.method === 'POST' ? 'text-[#ef4444]' : item.method === 'PUT' ? 'text-[#f59e0b]' : item.method === 'DELETE' ? 'text-[#ef4444]' : ''} `}
            >
              {item.method}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DatasourcePanel = () => {
  const datasource = useDesignDatasourceStore((state) => state.datasource);
  const removeDatasource = useDesignDatasourceStore((state) => state.removeDatasource);

  const [keywords, setKeywords] = useState('');
  const saveDatasourceRef = useRef<SaveDatasourceRef>(null);
  const [activeDatasourceId, setActiveDatasourceId] = useState('');

  const onOpenSaveDialog = (type: string, item?: DatasourceSchema) => {
    const newItem = cloneDeep(item);
    if (type === 'copy') {
      newItem!.id = Date.now().toString();
      newItem!.name = `copy_${newItem!.name}`;
    }
    if (newItem?.id) {
      setActiveDatasourceId(newItem.id);
    }
    saveDatasourceRef.current?.openDialog(type, newItem);
  };

  const deleteRecord = (id: string) => {
    if (activeDatasourceId === id) {
      setActiveDatasourceId('');
      saveDatasourceRef.current?.closeDialog()
    }
    removeDatasource(id);
  };

  return (
    <div className="datasource-panel py-2 relative h-full flex flex-col">
      <div className="filter-wrap px-2 flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput
            placeholder="请输入接口名称"
            defaultValue={keywords}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                setKeywords((e.target as HTMLInputElement).value);
              }
            }}
          />
          <InputGroupAddon>
            <InputGroupButton onClick={() => {}} size="icon-xs" className="rounded-[50%]">
              <Search />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => onOpenSaveDialog('create')}
        >
          <PlusCircle className="size-4" />
          <span>添加数据源</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0 border-t mt-3">
        {datasource.length > 0 ? (
          <DatasourceList
            list={datasource}
            onOpenSaveDialog={onOpenSaveDialog}
            deleteRecord={deleteRecord}
          />
        ) : (
          <div className="variable-list border-t py-3 mt-3 gap-2">
            <Empty description="暂无数据" />
          </div>
        )}
      </ScrollArea>
      <SaveDatasource ref={saveDatasourceRef} onClose={() => {}} />
    </div>
  );
};

export default DatasourcePanel;

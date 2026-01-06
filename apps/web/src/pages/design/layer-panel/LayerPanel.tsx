import { useTheme } from '@/composable/use-theme';
import { useDesignStore } from '@/store/modules/design';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Toggle } from '@repo/ui/components/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { ClipboardList, Laptop, Search } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import LayerItem from './components/LayerItem';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import Empty from '@/components/Empty';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { useComponentOperations } from '@/composable/use-component-operations';
import LayerContextMenu from './components/LayerContextMenu';

const MENU_ID = 'layer-context-menu';
const LayerPanel = () => {
  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const currentCmpId = useDesignStore((state) => state.currentCmpId)
  const { theme } = useTheme();

  const { show } = useContextMenu({
    id: MENU_ID,
  });

  function handleContextMenu(event: React.MouseEvent) {
    show({
      event,
      props: {
        key: 'value',
      },
    });
  }

  const [layerListModel, setLayerListModel] = useState(
    localStorage.getItem('layer-list-model') || 'image',
  );
  const [layerName, setLayerName] = useState('');

  const [collapsibleItem, setCollapsibleItemState] = useState<Record<string, boolean>>({});

  const setCollapsibleItem = useCallback(
    (
      newValue:
        | Record<string, boolean>
        | ((prev: Record<string, boolean>) => Record<string, boolean>),
    ) => {
      setCollapsibleItemState((prev) => {
        const updated = typeof newValue === 'function' ? newValue(prev) : newValue;
        return updated;
      });
    },
    [],
  );

  const { deleteComponent } = useComponentOperations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="layer-panel py-2 flex flex-col h-full">
      <div className="filter flex gap-2 px-2">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="请输入图层名称"
            defaultValue={layerName}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                setLayerName((e.target as HTMLInputElement).value);
              }
            }}
          />
        </InputGroup>
        <Tooltip>
          <TooltipTrigger>
            <Toggle
              aria-label="Toggle image"
              size="sm"
              variant="outline"
              className="data-[state=on]:dark:bg-primary data-[state=on]:bg-[#447dfc] data-[state=on]:text-white"
              onClick={() => setLayerListModel('image')}
              pressed={layerListModel === 'image'}
              asChild
            >
              <Laptop className="size-5" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>图文模式</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Toggle
              aria-label="Toggle text"
              size="sm"
              variant="outline"
              className="data-[state=on]:dark:bg-primary data-[state=on]:bg-[#447dfc] data-[state=on]:text-white"
              onClick={() => setLayerListModel('text')}
              pressed={layerListModel === 'text'}
              asChild
            >
              <ClipboardList className="size-5 " />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>文本列表</TooltipContent>
        </Tooltip>
      </div>
      <ScrollArea className="flex-1 min-h-0 px-2" >
        <div className="layer-list mt-3 gap-2 flex flex-col">
          {pageComponents
            .filter((item) => item.name.indexOf(layerName) > -1)
            .map((item) => {
              return (
                <LayerItem
                  component={item}
                  key={item.id}
                  layerListModel={layerListModel}
                  collapsibleItem={collapsibleItem}
                  setCollapsibleItem={setCollapsibleItem}
                  onContextMenu={handleContextMenu}
                />
              );
            })}
          {pageComponents?.filter((item) => item.name.indexOf(layerName) > -1).length === 0 && (
            <Empty description="暂无数据" />
          )}
        </div>
      </ScrollArea>
      <Menu id={MENU_ID} theme={theme}>
        <LayerContextMenu onDeleteClick={() => {setDeleteDialogOpen(true)}}/>
      </Menu>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          setDeleteDialogOpen(value);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除组件</AlertDialogTitle>
            <AlertDialogDescription>确定要删除选中的组件吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const cmp = pageComponents.find((c) => c.id === currentCmpId);
                deleteComponent(cmp);
              }}
            >
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LayerPanel;

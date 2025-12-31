import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@repo/ui/components/context-menu';
import {
  ArrowDown,
  ArrowDownFromLine,
  ArrowUp,
  ArrowUpFromLine,
  Box,
  Clipboard,
  Copy,
  EyeClosed,
  Layers,
  Lock,
  Star,
  Trash2,
  Unlock,
} from 'lucide-react';
import { Cut20Filled } from '@ricons/fluent';
import { useDesignStore } from '@/store/modules/design';
import { ComponentSchema } from '@repo/core/types';
import { useCanvasEvent } from '@/composable/use-canvas-event';
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
import { toast } from 'sonner';

const CanvasMenu = ({
  updateCurrentCmp,
}: {
  currentCmp: ComponentSchema;
  selectedCmpIds: string[];
  updateCurrentCmp: (cmp: ComponentSchema) => void;
}) => {
  const { pasteComponent } = useCanvasEvent(updateCurrentCmp);
  return (
    <>
      <ContextMenuItem onClick={() => pasteComponent()}>
        <ContextMenuShortcut>
          <Clipboard />
        </ContextMenuShortcut>
        粘贴
      </ContextMenuItem>
    </>
  );
};

const ComponentMenu = ({
  currentCmp,
  updateCurrentCmp,
  selectedCmpIds,
}: {
  currentCmp: ComponentSchema;
  updateCurrentCmp: (cmp: ComponentSchema) => void;
  selectedCmpIds: string[];
}) => {
  const {
    copyComponent,
    cutComponent,
    deleteComponent,
    setLayerLevel,
    lockComponent,
    splitComponent,
    combinationComponent,
    visibleComponent
  } = useCanvasEvent(updateCurrentCmp);

  const isLock = selectedCmpIds.length > 1 ? false : currentCmp?.id ? currentCmp?.lock : false;
  return (
    <>
      <ContextMenuItem onClick={() => lockComponent(currentCmp)}>
        <ContextMenuShortcut>{isLock ? <Unlock /> : <Lock />}</ContextMenuShortcut>
        {isLock ? '解锁' : '锁定'}
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => visibleComponent(currentCmp)}
      >
        <ContextMenuShortcut>
          <EyeClosed />
        </ContextMenuShortcut>
        隐藏
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => toast.warning('功能正在开发中～')}>
        <ContextMenuShortcut>
          <Star />
        </ContextMenuShortcut>
        收藏组件
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <ContextMenuShortcut>
            <Copy />
          </ContextMenuShortcut>
          交互
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem onClick={() => copyComponent(currentCmp)}>
            <ContextMenuShortcut>
              <Copy />
            </ContextMenuShortcut>
            复制
          </ContextMenuItem>
          <ContextMenuItem onClick={() => cutComponent(currentCmp)}>
            <ContextMenuShortcut>
              <Cut20Filled />
            </ContextMenuShortcut>
            剪切
          </ContextMenuItem>
          {selectedCmpIds.length > 1 && !currentCmp?.group && (
            <ContextMenuItem onClick={() => combinationComponent()}>
              <ContextMenuShortcut>
                <Box />
              </ContextMenuShortcut>
              组合
            </ContextMenuItem>
          )}
          {
            currentCmp?.group && (
              <ContextMenuItem onClick={() => splitComponent(currentCmp)}>
                <ContextMenuShortcut>
                  <Box />
                </ContextMenuShortcut>
                拆分
              </ContextMenuItem>
            )
          }
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <ContextMenuShortcut>
            <Layers />
          </ContextMenuShortcut>
          图层
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="w-38">
          <ContextMenuItem onClick={() => setLayerLevel({ type: 'top', component: currentCmp })}>
            <ContextMenuShortcut>
              <ArrowUpFromLine />
            </ContextMenuShortcut>
            置顶
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setLayerLevel({ type: 'bottom', component: currentCmp })}>
            <ContextMenuShortcut>
              <ArrowDownFromLine />
            </ContextMenuShortcut>
            置底
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setLayerLevel({ type: 'up', component: currentCmp })}>
            <ContextMenuShortcut>
              <ArrowUp />
            </ContextMenuShortcut>
            上移
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setLayerLevel({ type: 'down', component: currentCmp })}>
            <ContextMenuShortcut>
              <ArrowDown />
            </ContextMenuShortcut>
            下移
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <ContextMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <Trash2 />
            删除
          </ContextMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除组件</AlertDialogTitle>
            <AlertDialogDescription>确定要删除选中的组件吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteComponent(currentCmp);
                requestAnimationFrame(() => {
                  document.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
                  );
                });
              }}
            >
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const CanvasContextMenu = () => {
  const selectedCmpIds = useDesignStore((state) => state.selectedCmpIds);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const currentCmp = pageComponents.find((c) => c.id === currentCmpId);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);
  return (
    <>
      {currentCmpId || selectedCmpIds.length > 0 ? (
        <ComponentMenu
          currentCmp={currentCmp!}
          updateCurrentCmp={updateCurrentCmp}
          selectedCmpIds={selectedCmpIds}
        />
      ) : (
        <CanvasMenu
          currentCmp={currentCmp!}
          updateCurrentCmp={updateCurrentCmp}
          selectedCmpIds={selectedCmpIds}
        />
      )}
    </>
  );
};

export default CanvasContextMenu;

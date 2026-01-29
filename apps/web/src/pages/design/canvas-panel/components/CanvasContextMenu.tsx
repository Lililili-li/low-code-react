import {
  ArrowDown,
  ArrowDownFromLine,
  ArrowUp,
  ArrowUpFromLine,
  Box,
  Clipboard,
  ClipboardX,
  Copy,
  EyeClosed,
  Layers,
  Lock,
  Star,
  Trash2,
  Unlock,
} from 'lucide-react';
import { Cut20Filled } from '@ricons/fluent';
import { ComponentSchema } from '@repo/core/types';
import { useComponentOperations } from '@/composable/use-component-operations';
import { toast } from 'sonner';
import { Item, Separator, Submenu, contextMenu } from 'react-contexify';
import { useDesignComponentsStore } from '@/store/design/components';

const CanvasMenu = () => {
  const { pasteComponent } = useComponentOperations();

  const clearClipboard = async () => {
    try {
      await navigator.clipboard.writeText('');
      toast.success('剪切板已清空');
    } catch (error) {
      toast.error('清空剪切板失败');
    }
  };

  const handlePaste = async () => {
    contextMenu.hideAll();
    try {
      await pasteComponent();
    } catch (error) {
      console.error('粘贴组件失败:', error);
    }
  };

  return (
    <>
      <Item onClick={handlePaste}>
        <Clipboard style={{ width: '16px', marginRight: '6px' }} />
        粘贴
      </Item>
      <Item
        onClick={() => {
          contextMenu.hideAll();
          clearClipboard();
        }}
      >
        <ClipboardX style={{ width: '16px', marginRight: '6px' }} />
        清空剪切板
      </Item>
    </>
  );
};

const ComponentMenu = ({
  currentCmp,
  selectedCmpIds,
  onDeleteClick,
}: {
  currentCmp: ComponentSchema;
  updateCurrentCmp: (cmp: ComponentSchema) => void;
  selectedCmpIds: string[];
  onDeleteClick: () => void;
}) => {
  const {
    copyComponent,
    cutComponent,
    setLayerLevel,
    lockComponent,
    splitComponent,
    combinationComponent,
    visibleComponent,
  } = useComponentOperations();

  const isLock = selectedCmpIds.length > 1 ? false : currentCmp?.id ? currentCmp?.lock : false;

  return (
    <>
      <Item onClick={() => lockComponent(currentCmp)}>
        {isLock ? (
          <Unlock style={{ width: '16px', marginRight: '6px' }} />
        ) : (
          <Lock style={{ width: '16px', marginRight: '6px' }} />
        )}
        {isLock ? '解锁' : '锁定'}
      </Item>
      <Item onClick={() => visibleComponent(currentCmp)}>
        <EyeClosed style={{ width: '16px', marginRight: '6px' }} />
        隐藏
      </Item>
      <Separator />
      <Item onClick={() => toast.warning('功能正在开发中～')}>
        <Star style={{ width: '16px', marginRight: '6px' }} />
        收藏组件
      </Item>
      <Separator />
      <Submenu
        label={
          <>
            <Copy style={{ width: '16px', marginRight: '6px' }} />
            交互
          </>
        }
      >
        <Item onClick={() => copyComponent(currentCmp)}>
          <Copy style={{ width: '16px', marginRight: '6px' }} />
          复制
        </Item>
        <Item onClick={() => cutComponent(currentCmp)}>
          <Cut20Filled style={{ width: '16px', marginRight: '6px' }} />
          剪切
        </Item>
        {selectedCmpIds.length > 1 && !currentCmp?.group && (
          <Item
            onClick={() => {
              combinationComponent();
              contextMenu.hideAll();
            }}
          >
            <Box style={{ width: '16px', marginRight: '6px' }} />
            组合
          </Item>
        )}
        {currentCmp?.group && (
          <Item
            onClick={() => {
              splitComponent(currentCmp);
              contextMenu.hideAll();
            }}
          >
            <Box style={{ width: '16px', marginRight: '6px' }} />
            拆分
          </Item>
        )}
      </Submenu>
      <Submenu
        label={
          <>
            <Layers style={{ width: '16px', marginRight: '6px' }} />
            图层
          </>
        }
      >
        <Item onClick={() => setLayerLevel({ type: 'top', component: currentCmp })}>
          <ArrowUpFromLine style={{ width: '16px', marginRight: '6px' }} />
          置顶
        </Item>
        <Item onClick={() => setLayerLevel({ type: 'bottom', component: currentCmp })}>
          <ArrowDownFromLine style={{ width: '16px', marginRight: '6px' }} />
          置底
        </Item>
        <Item onClick={() => setLayerLevel({ type: 'up', component: currentCmp })}>
          <ArrowUp style={{ width: '16px', marginRight: '6px' }} />
          上移
        </Item>
        <Item onClick={() => setLayerLevel({ type: 'down', component: currentCmp })}>
          <ArrowDown style={{ width: '16px', marginRight: '6px' }} />
          下移
        </Item>
      </Submenu>

      <Separator />

      <Item onClick={onDeleteClick}>
        <Trash2 style={{ width: '16px', marginRight: '6px' }} />
        删除
      </Item>
    </>
  );
};

const CanvasContextMenu = ({ onDeleteClick }: { onDeleteClick: () => void }) => {
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const pageComponents = useDesignComponentsStore((state) => state.components);
  const currentCmp = pageComponents.find((c) => c.id === currentCmpId);
  const updateCurrentCmp = useDesignComponentsStore((state) => state.updateCurrentCmp);

  return (
    <>
      {currentCmpId || selectedCmpIds.length > 0 ? (
        <ComponentMenu
          currentCmp={currentCmp!}
          updateCurrentCmp={updateCurrentCmp}
          selectedCmpIds={selectedCmpIds}
          onDeleteClick={onDeleteClick}
        />
      ) : (
        <CanvasMenu />
      )}
    </>
  );
};

export default CanvasContextMenu;

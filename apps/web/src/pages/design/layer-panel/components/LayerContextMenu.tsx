import { useComponentOperations } from '@/composable/use-component-operations';
import { useDesignComponentsStore } from '@/store/design/components';
import { Cut20Filled } from '@ricons/fluent';
import {
  ArrowUpFromLine,
  Box,
  Copy,
  Layers,
  Star,
  ArrowDownFromLine,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { Item, Separator, Submenu } from 'react-contexify';
import { toast } from 'sonner';

const LayerContextMenu = ({ onDeleteClick }: { onDeleteClick: () => void }) => {
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);
  const currentCmp = useDesignComponentsStore((state) => state.componentsMap.get(currentCmpId));

  const { copyComponent, cutComponent, combinationComponent, splitComponent, setLayerLevel } =
    useComponentOperations();

  return (
    <>
      <Item onClick={() => toast.warning('功能正在开发中～')} className="text-sm">
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
        className="text-sm"
      >
        <Item onClick={() => copyComponent(currentCmp!)} className="text-sm">
          <Copy style={{ width: '16px', marginRight: '6px' }} />
          复制
        </Item>
        <Item onClick={() => cutComponent(currentCmp!)} className="text-sm">
          <Cut20Filled style={{ width: '16px', marginRight: '6px' }} />
          剪切
        </Item>
        {selectedCmpIds.length > 1 && !currentCmp?.group && (
          <Item onClick={() => combinationComponent()} className="text-sm">
            <Box style={{ width: '16px', marginRight: '6px' }} />
            组合
          </Item>
        )}
        {currentCmp?.group && (
          <Item onClick={() => splitComponent(currentCmp)} className="text-sm">
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
        className="text-sm"
      >
        <Item
          onClick={() => setLayerLevel({ type: 'top', component: currentCmp! })}
          className="text-sm"
        >
          <ArrowUpFromLine style={{ width: '16px', marginRight: '6px' }} />
          置顶
        </Item>
        <Item
          onClick={() => setLayerLevel({ type: 'bottom', component: currentCmp! })}
          className="text-sm"
        >
          <ArrowDownFromLine style={{ width: '16px', marginRight: '6px' }} />
          置底
        </Item>
        <Item
          onClick={() => setLayerLevel({ type: 'up', component: currentCmp! })}
          className="text-sm"
        >
          <ArrowUp style={{ width: '16px', marginRight: '6px' }} />
          上移
        </Item>
        <Item
          onClick={() => setLayerLevel({ type: 'down', component: currentCmp! })}
          className="text-sm"
        >
          <ArrowDown style={{ width: '16px', marginRight: '6px' }} />
          下移
        </Item>
      </Submenu>

      <Separator />

      <Item onClick={onDeleteClick} className="text-sm">
        <Trash2 style={{ width: '16px', marginRight: '6px' }} />
        删除
      </Item>
    </>
  );
};

export default LayerContextMenu;

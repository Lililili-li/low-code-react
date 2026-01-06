import React, { useRef, useCallback, useState } from 'react';
import { useDesignStore } from '@/store/modules/design';
import { useShallow } from 'zustand/react/shallow';
import RenderCmp from './RenderCmp';
import CanvasContextMenu from './CanvasContextMenu';
import HelperLine from './HelperLine';
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
import { useCanvasHotKeys } from '@/composable/use-canvas-hot-keys';
import { Menu, useContextMenu } from 'react-contexify';
import { useTheme } from '@/composable/use-theme';
import { useCanvasEvent } from '@/composable/use-canvas-event';

const MENU_ID = 'canvas-context-menu';

const CONTAINER_SIZE = {
  width: 3600,
  height: 3600,
};

// 画布在容器中的起始偏移（居中）

const CanvasDom = ({
  canvasRef,
  onScroll,
  effectiveZoom,
  CANVAS_OFFSET,
  setScrollY,
  setScrollX,
}: {
  canvasRef: React.RefCallback<HTMLDivElement> | React.RefObject<HTMLDivElement | null>;
  effectiveZoom: number;
  CANVAS_OFFSET: { x: number; y: number };
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  setScrollY: (scrollY: number) => void;
  setScrollX: (scrollX: number) => void;
}) => {
  const pageSchemaSubset = useDesignStore(
    useShallow((state) => ({
      width: state.pageSchema.width,
      height: state.pageSchema.height,
      background: state.pageSchema.background,
    })),
  );
  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);

  const { spacePressed, setScope, clearScope } = useCanvasHotKeys(() =>
    setTimeout(() => setDeleteDialogOpen(true)),
  );
  const { theme } = useTheme();

  // 创建内部 ref 用于访问 DOM 元素
  const internalCanvasRef = useRef<HTMLDivElement>(null);

  // 合并 ref：同时设置内部 ref 和外部传入的 ref
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // 设置内部 ref
      internalCanvasRef.current = node;

      // 设置外部 ref
      if (typeof canvasRef === 'function') {
        canvasRef(node);
      } else if (canvasRef) {
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [canvasRef],
  );

  const {
    handleDrop,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleFocus,
    handleBlur,
  } = useCanvasEvent({
    setScope,
    internalCanvasRef,
    spacePressed,
    setScrollX,
    setScrollY,
    clearScope,
  });

  const { deleteComponent } = useComponentOperations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  function handleContextMenu(event: React.MouseEvent) {
    show({
      event,
      props: {
        key: 'value',
      },
    });
  }
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  return (
    <>
      <div
        ref={setRefs}
        className="canvas-area"
        onScroll={onScroll}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onContextMenu={handleContextMenu}
        style={{
          cursor: spacePressed ? 'grab' : 'default',
        }}
      >
        <div
          className="canvas-scroll-container"
          style={{ width: CONTAINER_SIZE.width, height: CONTAINER_SIZE.height }}
        >
          <div
            className="canvas-content"
            id="canvas-content"
            style={{
              transform: `scale(${effectiveZoom})`,
              transformOrigin: 'top left',
              position: 'absolute',
              left: CANVAS_OFFSET.x,
              top: CANVAS_OFFSET.y,
              width: pageSchemaSubset.width,
              height: pageSchemaSubset.height,
              ...(pageSchemaSubset.background.useType === '1'
                ? { backgroundImage: `url(${pageSchemaSubset.background.image})` }
                : { backgroundColor: pageSchemaSubset.background.color }),
            }}
          >
            <RenderCmp />
            <HelperLine />
          </div>
        </div>
      </div>
      <Menu id={MENU_ID} theme={theme}>
        <CanvasContextMenu onDeleteClick={() => setTimeout(() => setDeleteDialogOpen(true), 300)} />
      </Menu>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          setScope('canvas');
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
    </>
  );
};

export default CanvasDom;

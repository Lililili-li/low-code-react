import Ruler from '@scena/react-ruler';
import React, { useRef, useEffect, useCallback } from 'react';
import hotkeys from 'hotkeys-js';
import { useDesignStore } from '@/store/modules/design';
import CmpHotKeysService from '@repo/core/hot-keys';
import { useShallow } from 'zustand/react/shallow';
import materialCmp, { MaterialType } from '@repo/core/material';
import { ComponentSchema } from '@repo/core/types';
import RenderCmp from './RenderCmp';

const CONTAINER_SIZE = {
  width: 3600,
  height: 3600,
};

const cmpHotKeysService = new CmpHotKeysService();

// 画布在容器中的起始偏移（居中）

const CanvasDom = ({
  canvasRef,
  onScroll,
  onWheel,
  effectiveZoom,
  CANVAS_OFFSET,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  effectiveZoom: number;
  CANVAS_OFFSET: { x: number; y: number };
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent) => void;
}) => {
  const pageSchemaSubset = useDesignStore(
    useShallow((state) => ({
      width: state.pageSchema.width,
      height: state.pageSchema.height,
      background: state.pageSchema.background,
    })),
  );
  const setCanvasPanel = useDesignStore((state) => state.setCanvasPanel);

  const verticalRulerRef = useRef<Ruler>(null);
  const horizontalRulerRef = useRef<Ruler>(null);

  const handleResize = useCallback(() => {
    verticalRulerRef.current?.resize();
    horizontalRulerRef.current?.resize();
  }, []);

  const autoCenter = useCallback(() => {
    if (!canvasRef.current) return;
    const { width } = canvasRef.current.getBoundingClientRect();
    const scale = (width - 40) / pageSchemaSubset.width;
    setCanvasPanel({ zoom: Number(Number(scale)) });
  }, [canvasRef.current]);

  useEffect(() => {
    autoCenter();
  }, [autoCenter]);

  // 计算使画布居中所需的滚动位置
  const getCenterScrollPosition = useCallback(() => {
    if (!canvasRef.current) return { scrollLeft: 0, scrollTop: 0 };
    const container = canvasRef.current;
    const scaledWidth = pageSchemaSubset.width * effectiveZoom;
    const scaledHeight = pageSchemaSubset.height * effectiveZoom;

    // 画布中心在容器中的位置
    const canvasCenterX = CANVAS_OFFSET.x + scaledWidth / 2;
    const canvasCenterY = CANVAS_OFFSET.y + scaledHeight / 2;

    // 滚动到使画布居中的位置
    const scrollLeft = canvasCenterX - container.clientWidth / 2;
    const scrollTop = canvasCenterY - container.clientHeight / 2;

    return { scrollLeft, scrollTop };
  }, [CANVAS_OFFSET]);

  useEffect(() => {
    // 延迟调用 resize，确保 Shadow DOM 完全渲染
    const timer = setTimeout(() => {
      handleResize();
      // 滚动到中心位置
      if (canvasRef.current) {
        const { scrollLeft, scrollTop } = getCenterScrollPosition();
        canvasRef.current.scrollLeft = scrollLeft;
        canvasRef.current.scrollTop = scrollTop;
      }
    }, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, getCenterScrollPosition]);

  // 画布聚焦/失焦时切换 hotkeys 作用域
  const handleFocus = useCallback(() => {
    hotkeys.setScope('canvas');
  }, []);

  const handleBlur = useCallback(() => {
    hotkeys.setScope('all');
  }, []);

  // 注册画布快捷键
  useEffect(() => {
    const cmpHotKeysMap = cmpHotKeysService.getHotKeysMap();
    cmpHotKeysMap.forEach((item) => {
      hotkeys(item.key, 'canvas', (e) => {
        e.preventDefault();
        item.action();
      });
    });
    // 移动画布
    hotkeys('space', 'canvas', (e) => {
      e.preventDefault();
      console.log('移动');
    });

    return () => {
      cmpHotKeysMap.forEach((item) => {
        hotkeys.unbind(item.key, 'canvas');
      });
    };
  }, []);

  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const zoom = useDesignStore((state) => state.config.canvasPanel.zoom);
  const addComponent = useDesignStore((state) => state.addComponent);
  const setCurrentCmpId = useDesignStore((state) => state.setCurrentCmpId);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);

  // ✅ 使用 useRef 存储拖动状态，避免触发重渲染
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dom: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
    scale: {
      isScaling: false,
      direction: '',
    },
    draggedCmp: null as ComponentSchema | null,
    rafId: null as number | null,
  });

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const canvasContent = (e.currentTarget as HTMLElement).querySelector(
        '.canvas-content',
      ) as HTMLElement;
      if (!canvasContent) return;

      const rect = canvasContent.getBoundingClientRect();
      const cmpData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const cmpType = cmpData.id as MaterialType;
      const schemaMeta = materialCmp[cmpType].schema;
      const style = (schemaMeta.style || {}) as any;
      const cmpWidth = style.width as number | undefined;
      const cmpHeight = style.height as number | undefined;
      const x = (e.clientX - rect.left - ((cmpWidth || 0) * zoom) / 2) / zoom;
      const y = (e.clientY - rect.top - ((cmpHeight || 0) * zoom) / 2) / zoom;

      const component: ComponentSchema = {
        id: new Date().getTime().toString(),
        type: cmpType,
        name: cmpData.name,
        style: {
          ...(schemaMeta.style as any),
          left: x,
          top: y,
        },
        visible: (schemaMeta.visible ?? false) as boolean,
        lock: (schemaMeta.lock ?? false) as boolean,
        props: schemaMeta.props || {},
      };
      dragStateRef.current.draggedCmp = component;
      dragStateRef.current.dom = {
        left: component.style?.left as number,
        top: component.style?.top as number,
        width: component.style?.width as number,
        height: component.style?.height as number,
      };
      addComponent(component);
      setCurrentCmpId(component.id);
    },
    [zoom, addComponent, setCurrentCmpId],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // 右键点击直接返回
      e.stopPropagation();
      const target = e.target as HTMLDivElement;
      if (target.id.startsWith('cmp-mask-id-')) {
        // 点击组件
        const cmpId = target.id.replace('cmp-mask-id-', '');
        if (cmpId !== currentCmpId) setCurrentCmpId(cmpId);
        const currentCmp = pageComponents.find((c) => c.id === cmpId);
        if (!currentCmp) return;
        // 只更新 ref，不触发重渲染
        dragStateRef.current = {
          isDragging: true,
          scale: {
            isScaling: false,
            direction: '',
          },
          startX: e.clientX,
          startY: e.clientY,
          currentX: e.clientX,
          currentY: e.clientY,
          dom: {
            left: (currentCmp?.style?.left as number) || 0,
            top: (currentCmp?.style?.top as number) || 0,
            width: (currentCmp?.style?.width as number) || 0,
            height: (currentCmp?.style?.height as number) || 0,
          },
          draggedCmp: currentCmp,
          rafId: null,
        };
      } else if (target.className.endsWith('scale')) {
        const currentCmp = pageComponents.find((c) => c.id === currentCmpId);
        if (!currentCmp) return;
        // 点击缩放角
        dragStateRef.current.isDragging = false;
        dragStateRef.current.scale.isScaling = true;
        dragStateRef.current.scale.direction = target.id;
        dragStateRef.current.startX = e.clientX;
        dragStateRef.current.startY = e.clientY;
        dragStateRef.current.dom = {
          left: (currentCmp?.style?.left as number) || 0,
          top: (currentCmp?.style?.top as number) || 0,
          width: (currentCmp?.style?.width as number) || 0,
          height: (currentCmp?.style?.height as number) || 0,
        };
        dragStateRef.current.draggedCmp = currentCmp;
      } else {
        setCurrentCmpId('');
      }
    },
    [currentCmpId, pageComponents, setCurrentCmpId],
  );

  // 拖拽移动
  const handleDrag = useCallback(
    (
      moveX: number,
      moveY: number,
      draggedCmp: ComponentSchema,
      dom: typeof dragStateRef.current.dom,
    ) => {
      updateCurrentCmp({
        ...draggedCmp,
        style: {
          ...draggedCmp.style,
          left: dom.left + moveX,
          top: dom.top + moveY,
        },
      });
    },
    [updateCurrentCmp],
  );

  // 拖拽缩放
  const handleScale = useCallback(
    (
      direction: string,
      moveX: number,
      moveY: number,
      draggedCmp: ComponentSchema,
      dom: typeof dragStateRef.current.dom,
    ) => {
      const scaleHandlers: Record<string, () => void> = {
        'bottom-rect': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              height: dom.height + moveY,
            },
          }),
        'top-rect': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              top: dom.top + moveY,
              height: dom.height - moveY,
            },
          }),
        'left-rect': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              left: dom.left + moveX,
              width: dom.width - moveX,
            },
          }),
        'right-rect': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              width: dom.width + moveX,
            },
          }),
        'left-top-corner': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              left: dom.left + moveX,
              width: dom.width - moveX,
              top: dom.top + moveY,
              height: dom.height - moveY,
            },
          }),
        'left-bottom-corner': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              left: dom.left + moveX,
              width: dom.width - moveX,
              height: dom.height + moveY,
            },
          }),
        'right-bottom-corner': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              width: dom.width + moveX,
              height: dom.height + moveY,
            },
          }),
        'right-top-corner': () =>
          updateCurrentCmp({
            ...draggedCmp,
            style: {
              ...draggedCmp.style,
              width: dom.width + moveX,
              top: dom.top + moveY,
              height: dom.height - moveY,
            },
          }),
      };

      scaleHandlers[direction]?.();
    },
    [updateCurrentCmp],
  );

  // 鼠标移动综合处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const dragState = dragStateRef.current;

      if ((!dragState.isDragging && !dragState.scale.isScaling) || !dragState.draggedCmp) return;

      dragState.currentX = e.clientX;
      dragState.currentY = e.clientY;

      if (dragState.rafId !== null) return;

      dragState.rafId = requestAnimationFrame(() => {
        const moveX = (dragState.currentX - dragState.startX) / zoom;
        const moveY = (dragState.currentY - dragState.startY) / zoom;

        if (dragState.isDragging) {
          handleDrag(moveX, moveY, dragState.draggedCmp!, dragState.dom);
        } else if (dragState.scale.isScaling) {
          handleScale(
            dragState.scale.direction,
            moveX,
            moveY,
            dragState.draggedCmp!,
            dragState.dom,
          );
        }

        dragState.rafId = null;
      });
    },
    [zoom, handleDrag, handleScale],
  );

  const handleMouseUp = useCallback(() => {
    const dragState = dragStateRef.current;
    if (dragState.rafId !== null) {
      cancelAnimationFrame(dragState.rafId);
    }
    dragStateRef.current.isDragging = false;
    dragStateRef.current.scale.isScaling = false;
    dragStateRef.current.rafId = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dragStateRef.current.isDragging) {
      handleMouseUp();
    }
  }, [handleMouseUp]);

  return (
    <div
      ref={canvasRef}
      className="canvas-area"
      onWheel={onWheel}
      onScroll={onScroll}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
    >
      <div
        className="canvas-scroll-container"
        style={{ width: CONTAINER_SIZE.width, height: CONTAINER_SIZE.height }}
      >
        <div
          className="canvas-content"
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
        </div>
      </div>
    </div>
  );
};

export default CanvasDom;

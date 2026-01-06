import { useDesignStore } from "@/store/modules/design";
import materialCmp, { MaterialType } from "@repo/core/material";
import { ComponentSchema } from "@repo/core/types";
import { RefObject, useCallback, useRef } from "react";
import { eventBus } from '@repo/shared/index';
import { createHistoryRecord, useHistoryStore } from "@/store/modules/history";

interface CanvasEventProps {
  setScope: (key: string) => void
  clearScope: () => void
  internalCanvasRef: RefObject<HTMLDivElement | null>
  spacePressed: boolean
  setScrollY: (scrollY: number) => void;
  setScrollX: (scrollX: number) => void;
}

export function useCanvasEvent({ setScope, internalCanvasRef, spacePressed, setScrollY, setScrollX, clearScope }: CanvasEventProps) {
  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const zoom = useDesignStore((state) => state.config.canvasPanel.zoom);
  const addComponent = useDesignStore((state) => state.addComponent);
  const setCurrentCmpId = useDesignStore((state) => state.setCurrentCmpId);
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);
  const updateSelectCmp = useDesignStore((state) => state.updateSelectCmp);
  const setSelectedCmpIds = useDesignStore((state) => state.setSelectedCmpIds);
  const addSelectedCmpIds = useDesignStore((state) => state.addSelectedCmpIds);
  const selectedCmpIds = useDesignStore((state) => state.selectedCmpIds);

  const pushHistory = useHistoryStore.getState().push;



  // 画布拖拽状态
  const canvasDragState = useRef({
    canMove: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  // 组件拖拽状态
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
    // 存储多选组件的初始位置
    multiDragInitialPositions: [] as Array<{ id: string; left: number; top: number }>,
  });


  // 组件从左侧菜单拉到画布的drop事件
  const handleDrop = useCallback(
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
          left: Number(x.toFixed(0)),
          top: Number(y.toFixed(0)),
        },
        visible: (schemaMeta.visible ?? false) as boolean,
        lock: (schemaMeta.lock ?? false) as boolean,
        animation: {
          enable: false, // 是否开启动画
          name: '', // 动画名称
          duration: 1, // 动画时长
          delay: 0, // 动画延迟
          iterationCount: 1, // 动画重复次数
          direction: 'normal', // 动画方向
          speed: 'linear', // 动画缓动函数
        },
        props: schemaMeta.props || {},
      };
      dragStateRef.current.draggedCmp = component;
      dragStateRef.current.dom = {
        left: component.style?.left as number,
        top: component.style?.top as number,
        width: component.style?.width as number,
        height: component.style?.height as number,
      };
      addComponent(component, true);
      setCurrentCmpId(component.id);
      setSelectedCmpIds([component.id]); // 默认放到多选数组中
      setScope('canvas');
    },
    [zoom, addComponent, setCurrentCmpId],
  );

  // 处理多选
  const handleMultiSelect = (cmpId: string) => {
    if (selectedCmpIds.length === 0) {
      // 如果只选择了第一个，那么当前选中组件
      setCurrentCmpId(cmpId);
    } else {
      setCurrentCmpId('');
    }
    addSelectedCmpIds(cmpId);
  };
  // 处理多选
  const handleSingleSelect = (cmpId: string, e: React.MouseEvent) => {
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
      multiDragInitialPositions: [],
    };
    setSelectedCmpIds([cmpId]);
  };
  // 处理拖拽缩放
  const handleScaleSelect = (e: React.MouseEvent, target: HTMLDivElement) => {
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
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // 手动让画布区域获得焦点，因为 preventDefault 阻止了默认的焦点行为
      internalCanvasRef.current?.focus();

      if (spacePressed) {
        canvasDragState.current = {
          canMove: true,
          startX: e.clientX,
          startY: e.clientY,
          currentX: e.clientX,
          currentY: e.clientY,
        };
        return;
      }
      const target = e.target as HTMLDivElement;
      if (target.id.startsWith('cmp-mask-id-')) {
        // 点击组件
        const cmpId = target.id.replace('cmp-mask-id-', '');
        // 如果按了shift键就是多选
        if (e.shiftKey) {
          if (target.dataset.lock === 'true') return; // 如果是锁定的元素直接不能选中
          handleMultiSelect(cmpId);
        } else if (selectedCmpIds.length > 1) {
          dragStateRef.current.multiDragInitialPositions = pageComponents
            .filter((cmp) => selectedCmpIds.includes(cmp.id))
            .map((cmp) => ({
              id: cmp.id,
              left: (cmp.style?.left as number) || 0,
              top: (cmp.style?.top as number) || 0,
            }));
          dragStateRef.current.isDragging = true;
          dragStateRef.current.startX = e.clientX;
          dragStateRef.current.startY = e.clientY;
          dragStateRef.current.currentX = e.clientX;
          dragStateRef.current.currentY = e.clientY;
          setCurrentCmpId('');
        } else {
          // 单选
          handleSingleSelect(cmpId, e);
        }
      } else if (target.className.endsWith('scale')) {
        handleScaleSelect(e, target);
      } else {
        setCurrentCmpId('');
        setSelectedCmpIds([]);
      }
    },
    [currentCmpId, pageComponents, setCurrentCmpId, spacePressed, selectedCmpIds],
  );

  // 拖拽单个组件移动
  const handleDrag = useCallback(
    (
      moveX: number,
      moveY: number,
      draggedCmp: ComponentSchema,
      dom: typeof dragStateRef.current.dom,
    ) => {
      moveY = Number(Number(moveY).toFixed(0));
      moveX = Number(Number(moveX).toFixed(0));
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

  // 拖拽多个组件移动
  const handleMultiDrag = useCallback(
    (moveX: number, moveY: number) => {
      const initialPositions = dragStateRef.current.multiDragInitialPositions;
      if (initialPositions.length === 0) return;

      const updatedComponents = initialPositions
        .map((initial) => {
          const component = pageComponents.find((cmp) => cmp.id === initial.id);
          if (!component) return null;
          return {
            ...component,
            style: {
              ...component.style,
              left: initial.left + moveX,
              top: initial.top + moveY,
            },
          };
        })
        .filter(Boolean) as ComponentSchema[];
      updateSelectCmp(updatedComponents);
    },
    [pageComponents, updateSelectCmp],
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
      moveY = Number(Number(moveY).toFixed(0));
      moveX = Number(Number(moveX).toFixed(0));
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

  // 拖拽移动画板
  const handleDragCanvas = useCallback(
    (deltaX: number, deltaY: number) => {
      // 这里可以实现画板拖拽逻辑
      if (!internalCanvasRef.current) return;
      internalCanvasRef.current.scrollLeft -= deltaX;
      internalCanvasRef.current.scrollTop -= deltaY;
      setScrollX(internalCanvasRef.current.scrollLeft);
      setScrollY(internalCanvasRef.current.scrollTop);
      eventBus.emit('handleHelperLine');
    },
    [setScrollX, setScrollY],
  );

  // 鼠标移动综合处理
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const dragState = dragStateRef.current;
      // 如果是画布移动的话直接移动画布其他操作不做处理
      if (canvasDragState.current.canMove) {
        const moveX = e.clientX - canvasDragState.current.currentX;
        const moveY = e.clientY - canvasDragState.current.currentY;
        canvasDragState.current.currentX = e.clientX;
        canvasDragState.current.currentY = e.clientY;
        handleDragCanvas(moveX, moveY);
        return;
      }
      if ((!dragState.isDragging && !dragState.scale.isScaling) || !dragState.draggedCmp) return;
      dragState.currentX = e.clientX;
      dragState.currentY = e.clientY;

      const moveX = (dragState.currentX - dragState.startX) / zoom;
      const moveY = (dragState.currentY - dragState.startY) / zoom;
      if (dragState.isDragging) {
        if (selectedCmpIds.length > 1) {
          handleMultiDrag(moveX, moveY);
        } else {
          if (dragState.draggedCmp.lock) return;
          handleDrag(moveX, moveY, dragState.draggedCmp!, dragState.dom);
        }
      } else if (dragState.scale.isScaling) {
        handleScale(dragState.scale.direction, moveX, moveY, dragState.draggedCmp!, dragState.dom);
      }
      eventBus.emit('handleHelperLine');
    },
    [zoom, handleDrag, handleScale, selectedCmpIds],
  );

  const isComponentMoved = (dragState: typeof dragStateRef.current) => {
    return dragState.currentX !== dragState.startX && dragState.currentY !== dragState.startY
  }

  const handleMouseUp = useCallback(() => {
    const dragState = dragStateRef.current;
    if (dragState.rafId !== null) {
      cancelAnimationFrame(dragState.rafId);
    }
    const isMultipleSelect = selectedCmpIds.length > 1;
    if (dragState.isDragging) {
      if (isMultipleSelect && isComponentMoved(dragState)) {
        const selectComponents = pageComponents.filter((item) => selectedCmpIds.includes(item.id));
        pushHistory(
          createHistoryRecord.moveMultiple(
            selectComponents!,
            dragState.multiDragInitialPositions,
            selectComponents.map((item) => ({
              id: item.id,
              left: item.style?.left as number,
              top: item.style?.top as number,
            })),
          ),
        );
      } else {
        if (isComponentMoved(dragState)) {
          const currentCmp = pageComponents.find((item) => item.id === dragState.draggedCmp?.id);
          pushHistory(
            createHistoryRecord.move(
              currentCmp!,
              {
                left: dragState.draggedCmp?.style?.left as number,
                top: dragState.draggedCmp?.style?.top as number,
              },
              {
                left: currentCmp?.style?.left as number,
                top: currentCmp?.style?.top as number,
              },
            ),
          );
        }
      }
    }
    if (dragState.scale.isScaling) {
      const oldSize = {
        width: (dragState.draggedCmp?.style?.width as number),
        height: (dragState.draggedCmp?.style?.height as number)
      }
      const newCmp = pageComponents.find(item => item.id === currentCmpId)
      const newSize = {
        width: (newCmp?.style?.width as number),
        height: (newCmp?.style?.height as number)
      }
      if (oldSize.width !== newSize.width || newSize.height !== oldSize.height) {
        pushHistory(createHistoryRecord.size(
          dragState.draggedCmp!,
          oldSize,
          newSize
        ))
      }
    }
    dragStateRef.current.isDragging = false;
    dragStateRef.current.scale.isScaling = false;
    canvasDragState.current.canMove = false;
    dragStateRef.current.rafId = null;
  }, [selectedCmpIds, pageComponents]);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);


  // 画布聚焦/失焦时切换 hotkeys 作用域
  const handleFocus = useCallback(() => {
    setScope('canvas');
  }, []);

  const handleBlur = useCallback(() => {
    clearScope();
  }, []);

  return {
    handleDrop,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleFocus,
    handleBlur
  }
}
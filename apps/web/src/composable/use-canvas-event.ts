import { useDesignStore } from "@/store/design";
import materialCmp, { MaterialType } from "@repo/core/material";
import { ComponentSchema, VisibleConfig } from "@repo/core/types";
import { RefObject, useCallback, useRef } from "react";
import { eventBus } from '@repo/shared/index';
import { createHistoryRecord, useHistoryStore } from "@/store/history";
import { useDesignComponentsStore } from "@/store/design/components";
import { useHelperLines } from "@/composable/use-helper-lines";
import { UndoManager } from "yjs";

// 节流函数
const throttle = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
        timeoutId = null;
      }, delay - (currentTime - lastExecTime));
    }
  };
};

interface CanvasEventProps {
  setScope: (key: string) => void
  clearScope: () => void
  internalCanvasRef: RefObject<HTMLDivElement | null>
  spacePressed: boolean
  setScrollY: (scrollY: number) => void;
  setScrollX: (scrollX: number) => void;
  addCanvasComponent: (schema: ComponentSchema) => void;
  moveCanvasComponent: (id: string, left: number, top: number) => void;
  undoManage: UndoManager | null;
}

export function useCanvasEvent({
  setScope,
  internalCanvasRef,
  spacePressed,
  setScrollY,
  setScrollX,
  clearScope,
  addCanvasComponent,
  moveCanvasComponent,
}: CanvasEventProps): {
  handleDrop: (e: React.DragEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
} {
  const zoom = useDesignStore((state) => state.panelConfig.canvasPanel.zoom);
  const components = useDesignComponentsStore((state) => state.components);
  // const addComponent = useDesignComponentsStore((state) => state.addComponent);
  const setCurrentCmpId = useDesignComponentsStore((state) => state.setCurrentCmpId);
  const setCurrentCmp = useDesignComponentsStore((state) => state.setCurrentCmp);
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const updateCurrentCmp = useDesignComponentsStore((state) => state.updateCurrentCmp);
  const updateSelectCmp = useDesignComponentsStore((state) => state.updateSelectCmp);
  const setSelectedCmpIds = useDesignComponentsStore((state) => state.setSelectedCmpIds);
  const addSelectedCmpIds = useDesignComponentsStore((state) => state.addSelectedCmpIds);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);

  const pushHistory = useHistoryStore.getState().push;

  // 辅助线吸附系统
  const { calculateSnap, calculateMultiSnap } = useHelperLines();

  // 创建节流的辅助线更新函数
  const throttledHelperLineUpdate = useRef(
    throttle(() => {
      eventBus.emit('handleHelperLine');
    }, 16) // 约60fps
  ).current;



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
      const style = (schemaMeta.style || {}) as ComponentSchema['style'];
      const cmpWidth = Number(style.width);
      const cmpHeight = Number(style.height);
      const x = (e.clientX - rect.left - ((cmpWidth * zoom) / 2)) / zoom;
      const y = (e.clientY - rect.top - ((cmpHeight * zoom) / 2)) / zoom;
      // cmpData.url是用于区分是否为资源列表拖拽的
      // cmpData.remote代表的是自定义组件
      let props = schemaMeta.props || {};
      if (cmpData.remote) {
        props = { ...props, option: cmpData.props };
      } else if (cmpData.url) {
        // Check if props has option property before accessing it
        if ('option' in props) {
          props = { ...props, option: { ...props.option, url: cmpData.url } };
        } else {
          props = { ...props, option: { url: cmpData.url } };
        }
      }
      const component: ComponentSchema = {
        id: new Date().getTime().toString(),
        type: cmpType,
        name: cmpData.name,
        style: {
          ...(schemaMeta.style as any),
          left: Number(x.toFixed(0)),
          top: Number(y.toFixed(0)),
        },
        visibleProp: schemaMeta.visibleProp as VisibleConfig,
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
        props,
      };
      dragStateRef.current.draggedCmp = component;
      dragStateRef.current.dom = {
        left: component.style?.left as number,
        top: component.style?.top as number,
        width: component.style?.width as number,
        height: component.style?.height as number,
      };
      // addComponent(component, true);
      addCanvasComponent(component);
      setCurrentCmpId(component.id);
      setCurrentCmp({ id: component.id, parentId: '' })
      setSelectedCmpIds([component.id]); // 默认放到多选数组中
      setScope('canvas');
    },
    [zoom, addCanvasComponent, setCurrentCmpId],
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
    const currentCmp = components.find((c) => c.id === cmpId);
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
    const currentCmp = components.find((c) => c.id === currentCmpId);
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
          dragStateRef.current.multiDragInitialPositions = components
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
        setCurrentCmp({ id: '', parentId: '' })
        setCurrentCmpId('');
        setSelectedCmpIds([]);
      }
    },
    [currentCmpId, components, setCurrentCmpId, spacePressed, selectedCmpIds],
  );

  // 拖拽单个组件移动 - 优化版本
  const handleDrag = useCallback(
    (
      moveX: number,
      moveY: number,
      draggedCmp: ComponentSchema,
      dom: typeof dragStateRef.current.dom,
    ) => {
      moveY = Number(Number(moveY).toFixed(0));
      moveX = Number(Number(moveX).toFixed(0));

      // 直接计算新位置，减少不必要的对象创建
      const newLeft = dom.left + moveX;
      const newTop = dom.top + moveY;

      // 简化吸附计算，只在必要时进行
      let finalLeft = newLeft;
      let finalTop = newTop;

      // 只在有其他组件时才计算吸附
      if (components.length > 1) {
        const tempComponent = {
          ...draggedCmp,
          style: {
            ...draggedCmp.style,
            left: newLeft,
            top: newTop,
          },
        };

        const snapResult = calculateSnap(tempComponent, [draggedCmp.id]);
        finalLeft = snapResult.snappedX;
        finalTop = snapResult.snappedY;

        // 立即更新辅助线显示
        eventBus.emit('handleHelperLine');
      }

      // 应用最终位置
      updateCurrentCmp({
        ...draggedCmp,
        style: {
          ...draggedCmp.style,
          left: finalLeft,
          top: finalTop,
        },
      });
      moveCanvasComponent(draggedCmp.id as string, finalLeft as number, finalTop as number);
    },
    [updateCurrentCmp, calculateSnap, components.length],
  );

  // 拖拽多个组件移动 - 优化版本
  const handleMultiDrag = useCallback(
    (moveX: number, moveY: number) => {
      const initialPositions = dragStateRef.current.multiDragInitialPositions;
      if (initialPositions.length === 0) return;

      // 直接计算最终位置，减少中间步骤
      const finalComponents = initialPositions
        .map((initial) => {
          const component = components.find((cmp) => cmp.id === initial.id);
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

      // 只在有其他组件时才计算吸附
      if (components.length > selectedCmpIds.length) {
        const snapResult = calculateMultiSnap(finalComponents, selectedCmpIds);

        // 应用吸附偏移
        finalComponents.forEach((component, index) => {
          const initial = initialPositions[index];
          component.style = {
            ...component.style,
            left: initial.left + moveX + snapResult.snappedX,
            top: initial.top + moveY + snapResult.snappedY,
          };
        });

        // 立即更新辅助线显示
        eventBus.emit('handleHelperLine');
      }

      updateSelectCmp(finalComponents);
    },
    [components, updateSelectCmp, calculateMultiSnap, selectedCmpIds, components.length],
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

  // 鼠标移动综合处理 - 优化版本
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

      // 使用节流的辅助线更新
      throttledHelperLineUpdate();
    },
    [zoom, handleDrag, handleScale, handleMultiDrag, selectedCmpIds, throttledHelperLineUpdate],
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
        const selectComponents = components.filter((item) => selectedCmpIds.includes(item.id));
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
          const currentCmp = components.find((item) => item.id === dragState.draggedCmp?.id);
          
        }
      }
    }
    if (dragState.scale.isScaling) {
      const oldSize = {
        width: (dragState.draggedCmp?.style?.width as number),
        height: (dragState.draggedCmp?.style?.height as number)
      }
      const newCmp = components.find(item => item.id === currentCmpId)
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
  }, [selectedCmpIds, components]);

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
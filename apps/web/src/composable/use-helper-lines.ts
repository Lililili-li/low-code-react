import { useCallback } from 'react';
import { ComponentSchema } from '@repo/core/types';
import { useDesignComponentsStore } from '@/store/design/components';

// 吸附阈值（像素）
const SNAP_THRESHOLD = 8;

// 辅助线类型
export interface HelperLineData {
  type: 'horizontal' | 'vertical';
  position: number;
  strength: 'strong' | 'weak'; // 强对齐（中心/边缘）vs 弱对齐（间距）
  source: 'edge' | 'center' | 'spacing';
}

// 吸附结果
export interface SnapResult {
  snappedX: number;
  snappedY: number;
  horizontalLines: HelperLineData[];
  verticalLines: HelperLineData[];
}

export interface UseHelperLinesOptions {
  enabled?: boolean;
  snapThreshold?: number;
}

export function useHelperLines(options: UseHelperLinesOptions = {}) {
  const { 
    enabled = true, 
    snapThreshold = SNAP_THRESHOLD 
  } = options;
  
  const components = useDesignComponentsStore((state) => state.components);

  // 获取组件的边界信息
  const getComponentBounds = useCallback((component: ComponentSchema) => {
    const left = component.style?.left as number || 0;
    const top = component.style?.top as number || 0;
    const width = component.style?.width as number || 0;
    const height = component.style?.height as number || 0;
    
    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
      centerX: left + width / 2,
      centerY: top + height / 2,
      width,
      height
    };
  }, []);

  // 检测水平对齐 - 优化版本
  const detectHorizontalAlignment = useCallback((
    draggedBounds: ReturnType<typeof getComponentBounds>,
    otherComponents: ComponentSchema[],
    threshold: number = snapThreshold
  ) => {
    const lines: HelperLineData[] = [];
    let snappedY = draggedBounds.top;
    let minDistance = threshold;
    let foundAlignment = false;

    // 检测与其他组件的水平对齐
    for (const component of otherComponents) {
      const bounds = getComponentBounds(component);
      
      // 上边缘对齐（拖拽组件的top与其他组件的top）
      const topToTopDiff = Math.abs(draggedBounds.top - bounds.top);
      if (topToTopDiff < minDistance) {
        lines.push({
          type: 'horizontal',
          position: bounds.top,
          strength: 'strong',
          source: 'edge'
        });
        snappedY = bounds.top;
        minDistance = topToTopDiff;
        foundAlignment = true;
      }
      
      // 底边对齐（拖拽组件的bottom与其他组件的bottom）
      const bottomToBottomDiff = Math.abs(draggedBounds.bottom - bounds.bottom);
      if (bottomToBottomDiff < minDistance) {
        lines.push({
          type: 'horizontal',
          position: bounds.bottom,
          strength: 'strong',
          source: 'edge'
        });
        snappedY = bounds.bottom - draggedBounds.height;
        minDistance = bottomToBottomDiff;
        foundAlignment = true;
      }
      
      // 中心对齐
      const centerDiff = Math.abs(draggedBounds.centerY - bounds.centerY);
      if (centerDiff < minDistance) {
        lines.push({
          type: 'horizontal',
          position: bounds.centerY,
          strength: 'strong',
          source: 'center'
        });
        snappedY = bounds.centerY - draggedBounds.height / 2;
        minDistance = centerDiff;
        foundAlignment = true;
      }
      
      // 拖拽组件的底边与其他组件的顶边对齐（上下紧贴）
      const bottomToTopDiff = Math.abs(draggedBounds.bottom - bounds.top);
      if (bottomToTopDiff < minDistance) {
        lines.push({
          type: 'horizontal',
          position: bounds.top,
          strength: 'weak',
          source: 'spacing'
        });
        snappedY = bounds.top - draggedBounds.height;
        minDistance = bottomToTopDiff;
        foundAlignment = true;
      }
      
      // 拖拽组件的顶边与其他组件的底边对齐（上下紧贴）
      const topToBottomDiff = Math.abs(draggedBounds.top - bounds.bottom);
      if (topToBottomDiff < minDistance) {
        lines.push({
          type: 'horizontal',
          position: bounds.bottom,
          strength: 'weak',
          source: 'spacing'
        });
        snappedY = bounds.bottom;
        minDistance = topToBottomDiff;
        foundAlignment = true;
      }
    }

    // 只返回最近的吸附线
    const closestLine = foundAlignment && lines.length > 0 ? [lines[lines.length - 1]] : [];

    return { 
      lines: closestLine, 
      snappedY 
    };
  }, [getComponentBounds, snapThreshold]);

  // 检测垂直对齐 - 优化版本
  const detectVerticalAlignment = useCallback((
    draggedBounds: ReturnType<typeof getComponentBounds>,
    otherComponents: ComponentSchema[],
    threshold: number = snapThreshold
  ) => {
    const lines: HelperLineData[] = [];
    let snappedX = draggedBounds.left;
    let minDistance = threshold;
    let foundAlignment = false;

    // 检测与其他组件的垂直对齐
    for (const component of otherComponents) {
      const bounds = getComponentBounds(component);
      
      // 左边缘对齐（拖拽组件的left与其他组件的left）
      const leftToLeftDiff = Math.abs(draggedBounds.left - bounds.left);
      if (leftToLeftDiff < minDistance) {
        lines.push({
          type: 'vertical',
          position: bounds.left,
          strength: 'strong',
          source: 'edge'
        });
        snappedX = bounds.left;
        minDistance = leftToLeftDiff;
        foundAlignment = true;
      }
      
      // 右边缘对齐（拖拽组件的right与其他组件的right）
      const rightToRightDiff = Math.abs(draggedBounds.right - bounds.right);
      if (rightToRightDiff < minDistance) {
        lines.push({
          type: 'vertical',
          position: bounds.right,
          strength: 'strong',
          source: 'edge'
        });
        snappedX = bounds.right - draggedBounds.width;
        minDistance = rightToRightDiff;
        foundAlignment = true;
      }
      
      // 中心对齐
      const centerDiff = Math.abs(draggedBounds.centerX - bounds.centerX);
      if (centerDiff < minDistance) {
        lines.push({
          type: 'vertical',
          position: bounds.centerX,
          strength: 'strong',
          source: 'center'
        });
        snappedX = bounds.centerX - draggedBounds.width / 2;
        minDistance = centerDiff;
        foundAlignment = true;
      }
      
      // 拖拽组件的右边与其他组件的左边对齐（左右紧贴）
      const rightToLeftDiff = Math.abs(draggedBounds.right - bounds.left);
      if (rightToLeftDiff < minDistance) {
        lines.push({
          type: 'vertical',
          position: bounds.left,
          strength: 'weak',
          source: 'spacing'
        });
        snappedX = bounds.left - draggedBounds.width;
        minDistance = rightToLeftDiff;
        foundAlignment = true;
      }
      
      // 拖拽组件的左边与其他组件的右边对齐（左右紧贴）
      const leftToRightDiff = Math.abs(draggedBounds.left - bounds.right);
      if (leftToRightDiff < minDistance) {
        lines.push({
          type: 'vertical',
          position: bounds.right,
          strength: 'weak',
          source: 'spacing'
        });
        snappedX = bounds.right;
        minDistance = leftToRightDiff;
        foundAlignment = true;
      }
    }

    // 只返回最近的吸附线
    const closestLine = foundAlignment && lines.length > 0 ? [lines[lines.length - 1]] : [];

    return { 
      lines: closestLine, 
      snappedX 
    };
  }, [getComponentBounds, snapThreshold]);

  // 计算吸附位置和辅助线
  const calculateSnap = useCallback((
    draggedComponent: ComponentSchema,
    excludeIds: string[] = []
  ): SnapResult => {
    if (!enabled) {
      return {
        snappedX: draggedComponent.style?.left as number || 0,
        snappedY: draggedComponent.style?.top as number || 0,
        horizontalLines: [],
        verticalLines: []
      };
    }

    const draggedBounds = getComponentBounds(draggedComponent);
    
    // 获取其他组件（排除当前拖动的组件和所有排除的组件）
    const otherComponents = components.filter(cmp => 
      !excludeIds.includes(cmp.id) && 
      cmp.id !== draggedComponent.id &&
      // 确保组件有有效的位置和尺寸
      cmp.style?.left !== undefined && 
      cmp.style?.top !== undefined &&
      Number(cmp.style?.width || 0) > 0 && 
      Number(cmp.style?.height || 0) > 0
    );

    // 检测水平和垂直对齐，传递阈值参数
    const { lines: hLines, snappedY } = detectHorizontalAlignment(draggedBounds, otherComponents, snapThreshold);
    const { lines: vLines, snappedX } = detectVerticalAlignment(draggedBounds, otherComponents, snapThreshold);

    return {
      snappedX,
      snappedY,
      horizontalLines: hLines,
      verticalLines: vLines
    };
  }, [enabled, components, getComponentBounds, detectHorizontalAlignment, detectVerticalAlignment, snapThreshold]);

  // 为多选组件计算吸附
  const calculateMultiSnap = useCallback((
    draggedComponents: ComponentSchema[],
    excludeIds: string[] = []
  ): SnapResult => {
    if (!enabled || draggedComponents.length === 0) {
      return {
        snappedX: 0,
        snappedY: 0,
        horizontalLines: [],
        verticalLines: []
      };
    }

    // 使用第一个组件作为参考计算吸附位置
    const referenceComponent = draggedComponents[0];
    const result = calculateSnap(referenceComponent, excludeIds);
    
    // 返回实际的吸附位置，而不是偏移量
    return {
      snappedX: result.snappedX - (referenceComponent.style?.left as number || 0),
      snappedY: result.snappedY - (referenceComponent.style?.top as number || 0),
      horizontalLines: result.horizontalLines,
      verticalLines: result.verticalLines
    };
  }, [enabled, calculateSnap]);

  return {
    calculateSnap,
    calculateMultiSnap,
    getComponentBounds
  };
}

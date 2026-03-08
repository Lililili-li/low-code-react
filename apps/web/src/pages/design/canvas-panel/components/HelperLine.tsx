/**
 * 增强的辅助线系统 - 支持对齐检测和自动吸附
 */

import { useDesignStore } from '@/store/design';
import { useEffect, useState } from 'react';
import { eventBus } from '@repo/shared/index';
import { useDesignComponentsStore } from '@/store/design/components';
import { getVariableValue } from '@repo/core/variable';
import { useDesignStateStore } from '@/store';
import { HelperLineData } from '@/composable/use-helper-lines';

const HelperLine = () => {
  const currentCmpId = useDesignComponentsStore((state) => state.currentCmpId);
  const currentCmp = useDesignComponentsStore((state) =>
    state.components?.find((comp) => comp.id === currentCmpId),
  );
  const components = useDesignComponentsStore((state) => state.components);
  const selectedCmpIds = useDesignComponentsStore((state) => state.selectedCmpIds);

  const zoom = useDesignStore((state) => state.panelConfig.canvasPanel.zoom);
  const state = useDesignStateStore((state) => state.state);

  const shadowHost = document.getElementById('shadow-host');

  // 辅助线状态
  const [helperLines, setHelperLines] = useState({
    horizontal: [] as HelperLineData[],
    vertical: [] as HelperLineData[],
  });

  // 基础位置信息（保持原有功能）
  const [basicPosition, setBasicPosition] = useState({
    width: 0,
    height: 0,
  });

  // useHelperLines hook 不再需要，直接在组件内计算对齐

  // 更新基础位置信息（原有功能）
  const updateBasicPosition = () => {
    const canvasContent = shadowHost?.shadowRoot?.querySelector('#canvas-content') as HTMLElement;
    const canvasWrapper = shadowHost?.shadowRoot?.querySelector('.ruler-content-row');
    const canvasContentLeft = canvasContent?.getBoundingClientRect().left || 0;
    const canvasWrapperLeft = canvasWrapper?.getBoundingClientRect().left || 0;
    const canvasContentTop = canvasContent?.getBoundingClientRect().top || 0;
    const canvasWrapperTop = canvasWrapper?.getBoundingClientRect().top || 0;

    setBasicPosition({
      width:
        (canvasContentLeft + (currentCmp?.style?.left as number) - canvasWrapperLeft) / zoom || 0,
      height:
        (canvasContentTop + (currentCmp?.style?.top as number) - canvasWrapperTop) / zoom || 0,
    });
  };

  // 更新辅助线 - 直接在这里计算对齐
  const updateHelperLines = () => {
    if (!currentCmp) {
      setHelperLines({ horizontal: [], vertical: [] });
      return;
    }

    // 获取其他组件
    const otherCmps = components.filter(
      (c) => c.id !== currentCmp.id && !selectedCmpIds.includes(c.id),
    );

    if (otherCmps.length === 0) {
      setHelperLines({ horizontal: [], vertical: [] });
      return;
    }

    const threshold = 10; // 吸附阈值 - 调整为10像素，更精确
    const hLines: HelperLineData[] = [];
    const vLines: HelperLineData[] = [];

    // 当前组件的边界
    const currentLeft = (currentCmp.style?.left as number) || 0;
    const currentTop = (currentCmp.style?.top as number) || 0;
    const currentWidth = (currentCmp.style?.width as number) || 0;
    const currentHeight = (currentCmp.style?.height as number) || 0;
    const currentRight = currentLeft + currentWidth;
    const currentBottom = currentTop + currentHeight;

    // 检测与其他组件的对齐 - 只检测真正有意义的对齐
    for (const other of otherCmps) {
      const otherLeft = (other.style?.left as number) || 0;
      const otherTop = (other.style?.top as number) || 0;
      const otherWidth = (other.style?.width as number) || 0;
      const otherHeight = (other.style?.height as number) || 0;
      const otherRight = otherLeft + otherWidth;
      const otherBottom = otherTop + otherHeight;

      // 水平对齐检测（显示水平线）- 只检测边缘对齐
      const topDiff = Math.abs(currentTop - otherTop);
      const bottomDiff = Math.abs(currentBottom - otherBottom);

      // 只有当差异小于阈值时才显示辅助线
      if (topDiff < threshold && topDiff > 0) {
        hLines.push({ type: 'horizontal', position: otherTop, strength: 'strong', source: 'edge' });
      }
      if (bottomDiff < threshold && bottomDiff > 0) {
        hLines.push({
          type: 'horizontal',
          position: otherBottom,
          strength: 'strong',
          source: 'edge',
        });
      }

      // 垂直对齐检测（显示垂直线）- 只检测边缘对齐
      const leftDiff = Math.abs(currentLeft - otherLeft);
      const rightDiff = Math.abs(currentRight - otherRight);

      if (leftDiff < threshold && leftDiff > 0) {
        vLines.push({ type: 'vertical', position: otherLeft, strength: 'strong', source: 'edge' });
      }
      if (rightDiff < threshold && rightDiff > 0) {
        vLines.push({ type: 'vertical', position: otherRight, strength: 'strong', source: 'edge' });
      }
    }

    setHelperLines({
      horizontal: hLines,
      vertical: vLines,
    });
  };

  // 处理辅助线更新事件
  const handleHelperLine = () => {
    updateBasicPosition();
    updateHelperLines();
  };

  useEffect(() => {
    if (!currentCmpId) return;
    handleHelperLine();
    // 选中组件时也更新辅助线
    updateHelperLines();
  }, [currentCmpId, currentCmp, selectedCmpIds]);

  useEffect(() => {
    const canvasArea = shadowHost?.shadowRoot?.querySelector('.canvas-area');
    canvasArea?.addEventListener('scroll', handleHelperLine);
    return () => {
      canvasArea?.removeEventListener('scroll', handleHelperLine);
    };
  }, [currentCmpId, currentCmp]);

  useEffect(() => {
    eventBus.on('handleHelperLine', handleHelperLine);
    return () => {
      eventBus.off('handleHelperLine');
    };
  }, []);

  const getVisibleProps = () => {
    if (currentCmp?.visibleProp.type === 'normal') {
      return currentCmp.visibleProp.value;
    }
    return getVariableValue(currentCmp?.visibleProp.value as string, state);
  };

  const helperLineVisible = currentCmp && getVisibleProps() && !currentCmp.lock;

  // 渲染辅助线
  const renderAlignmentLines = () => {
    if (!helperLineVisible) return null;

    // 获取画布内容元素
    const canvasContent = shadowHost?.shadowRoot?.querySelector('#canvas-content') as HTMLElement;
    if (!canvasContent) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {/* 水平辅助线 */}
        {helperLines.horizontal.map((line, index) => (
          <div
            key={`h-${index}`}
            className={`alignment-line horizontal ${line.strength}`}
            style={{
              position: 'absolute',
              left: 0,
              top: line.position,
              width: '100%',
              height: 2,
              backgroundColor: line.strength === 'strong' ? '#ff6b6b' : '#4ecdc4',
              zIndex: 1000,
            }}
          />
        ))}

        {/* 垂直辅助线 */}
        {helperLines.vertical.map((line, index) => (
          <div
            key={`v-${index}`}
            className={`alignment-line vertical ${line.strength}`}
            style={{
              position: 'absolute',
              left: line.position,
              top: 0,
              width: 2,
              height: '100%',
              backgroundColor: line.strength === 'strong' ? '#ff6b6b' : '#4ecdc4',
              zIndex: 1000,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {helperLineVisible && (
        <>
          {/* 原有的基础辅助线 */}
          {selectedCmpIds.length <= 1 && (
            <div style={{ fontSize: 22 }} className="helper-container">
              <div
                className="helper-text"
                style={{
                  left: (currentCmp?.style?.left as number) - 20,
                  top: (currentCmp?.style?.top as number) - 10,
                  transform: 'translate(-100%, -100%)',
                  position: 'absolute',
                }}
              >
                <span style={{ marginRight: 10 }}>
                  x: {Number(currentCmp.style?.left).toFixed(0)}
                </span>
                <span>y: {Number(currentCmp.style?.top).toFixed(0)}</span>
              </div>
              <div
                className="horizontal-line helper-line"
                style={{
                  left: currentCmp.style?.left,
                  top: currentCmp.style?.top,
                  width: basicPosition.width,
                }}
              />
              <div
                className="vertical-line helper-line"
                style={{
                  left: currentCmp.style?.left,
                  top: currentCmp.style?.top,
                  height: basicPosition.height,
                }}
              />
            </div>
          )}

          {/* 新的对齐辅助线 */}
          {/* {renderAlignmentLines()} */}
        </>
      )}
    </>
  );
};

export default HelperLine;

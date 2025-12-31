/**
 * 辅助线
 */

import { useDesignStore } from '@/store/modules/design';
import { useEffect, useState } from 'react';
import { eventBus } from '@repo/shared/index';

const HelperLine = () => {
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const currentCmp = useDesignStore((state) =>
    state.pageSchema?.components?.find((comp) => comp.id === currentCmpId),
  );
  const zoom = useDesignStore((state) => state.config.canvasPanel.zoom);
  const selectCmpIds = useDesignStore((state) => state.selectedCmpIds);

  const shadowHost = document.getElementById('shadow-host');
  const [helperLine, setHelperLine] = useState({
    width: 0,
    height: 0,
  });

  const handleHelperLine = () => {
    const canvasContent = shadowHost?.shadowRoot?.querySelector('#canvas-content') as HTMLElement;
    const canvasWrapper = shadowHost?.shadowRoot?.querySelector('.ruler-content-row');
    const canvasContentLeft = canvasContent?.getBoundingClientRect().left || 0;
    const canvasWrapperLeft = canvasWrapper?.getBoundingClientRect().left || 0;
    const canvasContentTop = canvasContent?.getBoundingClientRect().top || 0;
    const canvasWrapperTop = canvasWrapper?.getBoundingClientRect().top || 0;
    // 更新辅助线位置
    setHelperLine({
      width: (canvasContentLeft + (currentCmp?.style?.left as number) - canvasWrapperLeft) / zoom || 0,
      height: (canvasContentTop + (currentCmp?.style?.top as number) - canvasWrapperTop) / zoom || 0,
    });
  };

  useEffect(() => {
    if (!currentCmpId) return;
    handleHelperLine();
  }, [currentCmpId, currentCmp]);

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
  const helperLineVisible =
    currentCmp && currentCmp.visible && !currentCmp.lock && selectCmpIds.length <= 1;
  return (
    <>
      {helperLineVisible && (
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
            <span style={{ marginRight: 10 }}>x: {Number(currentCmp.style?.left).toFixed(0)}</span>
            <span>y: {Number(currentCmp.style?.top).toFixed(0)}</span>
          </div>
          <div
            className="horizontal-line helper-line"
            style={{
              left: currentCmp.style?.left,
              top: currentCmp.style?.top,
              width: helperLine.width,
            }}
          ></div>
          <div
            className="vertical-line helper-line"
            style={{
              left: currentCmp.style?.left,
              top: currentCmp.style?.top,
              height: helperLine.height,
            }}
          ></div>
        </div>
      )}
    </>
  );
};

export default HelperLine;

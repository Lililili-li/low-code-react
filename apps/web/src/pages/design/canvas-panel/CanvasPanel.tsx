import React from 'react';
import CanvasDom from './components/CanvasDom';
import Toolbar from './components/Toolbar';
import { useDesignStore } from '@/store/modules/design';
import materialCmp from '@repo/core/material';

const CanvasPanel = () => {
  const {
    pageSchema,
    setPageSchema,
    setCanvasPanel,
    config,
    addComponent,
    setCurrentCmp,
    currentCmp,
  } = useDesignStore();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // 1. 获取 canvas-content 元素（实际画布）
    const canvasContent = (e.currentTarget as HTMLElement).querySelector(
      '.canvas-content',
    ) as HTMLElement;
    if (!canvasContent) return;

    // 2. 获取画布的边界信息
    const rect = canvasContent.getBoundingClientRect();

    // 3. 获取缩放比例
    const zoom = config.canvasPanel.zoom ?? 1;

    // 4. 计算鼠标在画布上的实际位置（考虑缩放）

    // 5. 创建组件
    const cmpData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const style = materialCmp[cmpData.id].schema.style || {};
    const cmpWidth = style.width as number | undefined;
    const cmpHeight = style.height as number | undefined;
    const x = (e.clientX - rect.left - ((cmpWidth || 0) * zoom) / 2) / zoom;
    const y = (e.clientY - rect.top - ((cmpHeight || 0) * zoom) / 2) / zoom;
    const component = {
      id: cmpData.id,
      name: cmpData.name,
      style: {
        ...materialCmp[cmpData.id].schema.style,
        left: x,
        top: y,
      },
      visible: materialCmp[cmpData.id].schema.visible ?? false,
      lock: materialCmp[cmpData.id].schema.lock ?? false,
      props: materialCmp[cmpData.id].schema.props || {},
    };

    addComponent(component);
    setCurrentCmp(component);
  };

  return (
    <div className="canvas-panel w-full flex flex-col h-[calc(100vh-50px)]">
      <div className="canvas-container h-[calc(100%-50px)]">
        <CanvasDom
          onDrop={onDrop}
          pageSchema={pageSchema}
          setPageSchema={setPageSchema}
          setCanvasPanel={setCanvasPanel}
          config={config}
        >
          {pageSchema.components.map((item) => {
            const Component = materialCmp[item.id].component;
            return (
              item.visible && (
                <div className="canvas-render-container" key={item.id} style={item.style}>
                  <Component {...item.props} />
                  <div
                    className="cmp-mask"
                    style={{
                      ...item.style,
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      border: currentCmp.id === item.id ? '1px solid #274be3' : 'none',
                    }}
                  >
                    {currentCmp.id === item.id && (
                      <>
                        <div className="l-t-move move-corner"></div>
                        <div className="r-t-move move-corner"></div>
                        <div className="r-b-move move-corner"></div>
                        <div className="l-b-move move-corner"></div>
                        <div className="t-move move-rect"></div>
                        <div className="b-move move-rect"></div>
                        <div className="l-move move-rect"></div>
                        <div className="r-move move-rect"></div>
                      </>
                    )}
                  </div>
                </div>
              )
            );
          })}
        </CanvasDom>
      </div>
      <div className="toolbar-container shrink-0 border-t h-[50px] flex items-center px-4 dark:bg-[#18181c] bg-white">
        <Toolbar />
      </div>
    </div>
  );
};

export default CanvasPanel;

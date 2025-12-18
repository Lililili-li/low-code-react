import React from 'react';
import CanvasDom from './components/CanvasDom';
import Toolbar from './components/Toolbar';
import { useDesignStore } from '@/store/modules/design';
import materialCmp from '@repo/core/material';

const CanvasPanel = () => {
  const { pageSchema, setPageSchema, setCanvasPanel, config, addComponent, setCurrentCmp } = useDesignStore();

  const onDrop = (e: React.DragEvent) => {
    const cmpData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const component = {
      id: cmpData.id,
      name: cmpData.name,
      style: materialCmp[cmpData.id].schema.style,
      visible: materialCmp[cmpData.id].schema.visible ?? false,
      lock: materialCmp[cmpData.id].schema.lock ?? false,
      props: {
        option: materialCmp[cmpData.id].schema.props?.option,
      },
    };
    addComponent(component);
    setCurrentCmp(component)
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

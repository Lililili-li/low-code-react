import CanvasDom from './components/CanvasDom';
import Toolbar from './components/Toolbar';
import { useDesignStore } from '@/store/modules/design';
import materialCmp from '@repo/core/material';

const CanvasPanel = () => {
  const { pageSchema, setPageSchema, setCanvasPanel, config, addComponent } = useDesignStore();

  return (
    <div className="canvas-panel w-full flex flex-col h-[calc(100vh-50px)]">
      <div className="canvas-container h-[calc(100%-50px)]">
        <CanvasDom
          onDrop={(e) => {
            const cmp = JSON.parse(e.dataTransfer.getData('text/plain'));
            addComponent({
              id: cmp.id,
              name: cmp.name,
              style: materialCmp[cmp.id as keyof typeof materialCmp].meta.style,
              hidden: true
            });
          }}
          pageSchema={pageSchema}
          setPageSchema={setPageSchema}
          setCanvasPanel={setCanvasPanel}
          config={config}
        >
          {pageSchema.components.map((item) => {
            return (
              <>
                {item.hidden && (
                  <div className="canvas-render-container" key={item.id} style={item.style}>
                    {materialCmp[item.id as keyof typeof materialCmp].cmp({props: item.props})}
                  </div>
                )}
              </>
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

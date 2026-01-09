import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ImperativePanelHandle,
} from '@repo/ui/components/resizable';
import Header from './header';
import { useDesignStore } from '@/store/modules/design';
import MaterialPanel from './material-panel/MaterialPanel';
import LayerPanel from './layer-panel/LayerPanel';
import VariablePanel from './variable-panel/VariablePanel';
import CanvasPanel from './canvas-panel/CanvasPanel';
import PropPanel from './props-panel/PropPanel';
import './assets/index.less';
import DatasourcePanel from './datasource-panel/DatasourcePanel';
import { eventBus } from '@repo/shared/index';
import { useEffect, useRef } from 'react';

const panelMap = {
  material: MaterialPanel,
  layers: LayerPanel,
  variable: VariablePanel,
  datasource: DatasourcePanel,
};

const Design = () => {
  const config = useDesignStore((state) => state.config);
  const siderBarModel = config.siderBarModel;

  const getSiderBarPanel = () => {
    if (!siderBarModel) {
      return <></>;
    }
    const PanelComponent = panelMap[siderBarModel];
    return <PanelComponent />;
  };
  const siderBarPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    if (siderBarModel) {
      siderBarPanelRef.current?.expand();
    } else {
      siderBarPanelRef.current?.collapse();
    }
    requestAnimationFrame(() => {
      eventBus.emit('handleResize');
    });
  }, [siderBarModel]);

  const propPanelRef = useRef<ImperativePanelHandle>(null);
  useEffect(() => {
    if (config.propPanel.open) {
      propPanelRef.current?.expand();
    } else {
      propPanelRef.current?.collapse();
    }
    requestAnimationFrame(() => {
      eventBus.emit('handleResize');
    });
  }, [config.propPanel.open]);
  return (
    <div className="design-container h-full flex flex-col dark:bg-[#18181b]">
      <div className="design-header h-[50px] border-b shrink-0">
        <Header />
      </div>
      <div className="design-content flex flex-1 min-h-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-full"
          onLayout={() => eventBus.emit('handleResize')}
        >
          <ResizablePanel
            defaultSize={20}
            maxSize={25}
            minSize={0}
            style={{ overflow: 'none' }}
            ref={siderBarPanelRef}
            collapsible={true}
            collapsedSize={0}
          >
            <div className="sidebar w-full h-full">{getSiderBarPanel()}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={63}>
            <CanvasPanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={propPanelRef}
            defaultSize={17}
            maxSize={25}
            minSize={0}
            collapsible={true}
            collapsedSize={0}
          >
            <PropPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Design;

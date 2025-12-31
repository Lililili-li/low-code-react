import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@repo/ui/components/resizable';
import Header from './components/Header';
import { useDesignStore } from '@/store/modules/design';
import MaterialPanel from './material-panel/MaterialPanel';
import LayerPanel from './layer-panel/LayerPanel';
import VariablePanel from './variable-panel/VariablePanel';
import CanvasPanel from './canvas-panel/CanvasPanel';
import PropPanel from './props-panel/PropPanel';
import './assets/index.less'
import DatasourcePanel from './datasource-panel/DatasourcePanel';
import { eventBus } from '@repo/shared/index';

const panelMap = {
  material: MaterialPanel,
  layers: LayerPanel,
  variable: VariablePanel,
  datasource: DatasourcePanel
};

const Design = () => {
  const config = useDesignStore((state) => state.config);
  const siderVisible = config.siderVisible;
  const PanelComponent = panelMap[siderVisible];

  return (
    <div className="design-container h-full flex flex-col dark:bg-[#18181b]">
      <div className="design-header h-[50px] border-b shrink-0">
        <Header />
      </div>
      <div className="design-content flex flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full" onLayout={() => {
          eventBus.emit('handleResize')
        }}>
          <ResizablePanel defaultSize={20} maxSize={25}>
            <div className="sidebar w-full h-full">{<PanelComponent />}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={63}>
            <CanvasPanel />
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel defaultSize={17} maxSize={25}>
            <PropPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Design;

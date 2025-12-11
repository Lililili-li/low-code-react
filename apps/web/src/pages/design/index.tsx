import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@repo/ui/components/resizable';
import Header from './components/Header';
import { useDesignStore } from '@/store/modules/design';
import MaterialPanel from './components/MaterialPanel';
import LayerPanel from './components/LayerPanel';
import VariablePanel from './components/VariablePanel';
import Canvas from './components/Canvas';
import PropPanel from './components/PropPanel';

const panelMap = {
  material: MaterialPanel,
  layers: LayerPanel,
  variable: VariablePanel,
};

const Design = () => {
  const config = useDesignStore((state) => state.config);
  const siderVisible = config.siderVisible;
  const PanelComponent = panelMap[siderVisible];

  return (
    <div className="design-container h-full flex flex-col dark:bg-[#18181b]">
      <div className="design-header h-[50px] border-b">
        <Header />
      </div>
      <div className="design-content flex flex-1">
        <ResizablePanelGroup direction="horizontal" className="w-full h-full">
          <ResizablePanel defaultSize={15} maxSize={20} minSize={15}>
            <div className="sidebar w-full h-full">{<PanelComponent />}</div>
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel defaultSize={70}>
            <Canvas />
          </ResizablePanel>
          <ResizableHandle withHandle/>
          <ResizablePanel defaultSize={15} maxSize={20} minSize={15}>
            <PropPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Design;

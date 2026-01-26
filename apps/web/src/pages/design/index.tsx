import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ImperativePanelHandle,
} from '@repo/ui/components/resizable';
import Header from './header';
import { useDesignStore } from '@/store/design';
import MaterialPanel from './material-panel/MaterialPanel';
import LayerPanel from './layer-panel/LayerPanel';
import VariablePanel from './variable-panel/VariablePanel';
import CanvasPanel from './canvas-panel/CanvasPanel';
import PropPanel from './props-panel/PropPanel';
import './assets/index.less';
import DatasourcePanel from './datasource-panel/DatasourcePanel';
import { eventBus } from '@repo/shared/index';
import { useEffect, useRef } from 'react';
import TabMenu from '@/components/TabMenu';
import { Database } from 'lucide-react';
import { IconAppCenter, IconCode, IconLayers, IconShare } from '@douyinfe/semi-icons';

const panelMap = {
  material: MaterialPanel,
  layers: LayerPanel,
  variable: VariablePanel,
  datasource: DatasourcePanel,
};

const Design = () => {
  const panelConfig = useDesignStore((state) => state.panelConfig);
  const siderBarModel = panelConfig.siderBarModel;
  const setSiderBarModel = useDesignStore((state) => state.setSiderBarModel);

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
    if (panelConfig.propPanel.open) {
      propPanelRef.current?.expand();
    } else {
      propPanelRef.current?.collapse();
    }
    requestAnimationFrame(() => {
      eventBus.emit('handleResize');
    });
  }, [panelConfig.propPanel.open]);
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
            <div className="sidebar w-full h-full flex">
              <div className="tabs w-[70px] border-r h-full">
                <TabMenu
                  items={[
                    {
                      label: (
                        <div className="flex flex-col gap-2 items-center">
                          <IconAppCenter size="large" />
                          <span className="text-[12px]">组件库</span>
                        </div>
                      ),
                      value: 'material',
                    },
                    {
                      label: (
                        <div className="flex flex-col gap-2 items-center">
                          <IconLayers size="large" />
                          <span className="text-[12px]">图层</span>
                        </div>
                      ),
                      value: 'layers',
                    },
                    {
                      label: (
                        <div className="flex flex-col gap-2 items-center">
                          <IconShare size="large" />
                          <span className="text-[12px]">变量</span>
                        </div>
                      ),
                      value: 'variable',
                    },
                    {
                      label: (
                        <div className="flex flex-col gap-2 items-center">
                          <Database className="size-5" />
                          <span className="text-[12px]">数据源</span>
                        </div>
                      ),
                      value: 'datasource',
                    },
                    // {
                    //   label: (
                    //     <div className="flex flex-col gap-2 items-center">
                    //       <IconCode size="large" />
                    //       <span className="text-[12px]">源码</span>
                    //     </div>
                    //   ),
                    //   value: 'sourceCode',
                    // },
                  ]}
                  activeId={siderBarModel as string}
                  itemClassName="pl-2 py-3 justify-center rounded-none border-b"
                  onSelect={(value) => {
                    if (value === siderBarModel) {
                      siderBarPanelRef.current?.collapse();
                      setSiderBarModel(null);
                    } else {
                      siderBarPanelRef.current?.expand();
                      setSiderBarModel(value as 'material' | 'layers' | 'variable' | 'datasource');
                    }
                  }}
                />
              </div>
              <div className="content w-full h-full flex flex-col flex-1">
                <div className="header border-b h-[40px]">
                  <div className="title flex items-center pl-4 font-medium h-full text-sm">
                    {siderBarModel === 'material' && '组件库'}
                    {siderBarModel === 'layers' && '图层'}
                    {siderBarModel === 'variable' && '变量'}
                    {siderBarModel === 'datasource' && '数据源'}
                    {/* {siderBarModel === 'sourceCode' && '源码'} */}
                  </div>
                </div>
                <div className="body flex-1 min-h-0">
                  {getSiderBarPanel()}
                </div>
              </div>
            </div>
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

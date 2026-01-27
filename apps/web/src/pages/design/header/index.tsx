import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { useDesignStore } from '@/store/design';
import { Button } from '@repo/ui/components/button';
import { Toggle } from '@repo/ui/components/toggle';
import { AppWindow, FileImage, Home, Save, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import PageManage from './components/PageManage';
import pageApi from '@/api/page';
import { useRequest } from 'ahooks';
import { toast } from 'sonner';
import FullScreenLoading from '@/components/FullScreenLoading';
import { useDesignStateStore } from '@/store';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import { useEffect, useState } from 'react';
import hotkeys from 'hotkeys-js';
import DraggableModal from './components/DraggableModal';

const Header = () => {
  const navigate = useNavigate();
  const panelConfig = useDesignStore((state) => state.panelConfig);
  const setPropsPanelOpen = useDesignStore((state) => state.setPropsPanelOpen);
  const pageSchema = useDesignStore((state) => state.pageSchema);
  const state = useDesignStateStore((state) => state.state);
  const components = useDesignComponentsStore((state) => state.components);
  const datasource = useDesignDatasourceStore((state) => state.datasource);

  const { runAsync: updatePageSchema, loading } = useRequest(
    () =>
      pageApi.updatePageSchema({ ...pageSchema, state, components, datasource }, pageSchema.id!),
    {
      manual: true,
      onSuccess: () => {
        toast.success('保存成功');
      },
    },
  );

  useEffect(() => {
    hotkeys('ctrl+s, command+s', (event: KeyboardEvent) => {
      event.preventDefault();
      updatePageSchema();
    });
    return () => {
      hotkeys.unbind('ctrl+s, command+s');
    };
  }, []);

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="flex items-center px-4 h-full justify-between relative">
      <div className="header-left flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate('/manage/dashboard')}>
          <Home />
          <span>首页</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setModalVisible(true);
          }}
        >
          <FileImage />
          <span>资源</span>
        </Button>
        <Toggle
          size="sm"
          variant="outline"
          pressed={panelConfig.propPanel.open}
          onClick={() => setPropsPanelOpen(!panelConfig.propPanel.open)}
          className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
        >
          <Settings2 />
          <span>属性面板</span>
        </Toggle>
      </div>

      <PageManage />

      <div className="header-right flex gap-2">
        <Button size="sm" onClick={updatePageSchema}>
          <Save />
          <span>保存</span>
        </Button>
        <Button size="sm" variant="outline">
          <AppWindow />
          <span>预览</span>
        </Button>
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <FullScreenLoading visible={loading} />
      <DraggableModal
        title="资源列表"
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        width={350}
      ></DraggableModal>
    </div>
  );
};

export default Header;

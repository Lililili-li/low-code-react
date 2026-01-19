import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { useDesignStore } from '@/store/design';
import { Button } from '@repo/ui/components/button';
import { Toggle } from '@repo/ui/components/toggle';
import {
  AppWindow,
  Component,
  Database,
  Home,
  Layers,
  Save,
  Settings2,
  Variable,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import PageManage from './components/PageManage';
import pageApi from '@/api/page';
import { useRequest } from 'ahooks';
import { toast } from 'sonner';
import FullScreenLoading from '@/components/FullScreenLoading';
import { useDesignStateStore } from '@/store';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignDatasourceStore } from '@/store/design/dataSource';

const designConfig = [
  {
    id: 'material',
    name: '物料',
    icon: <Component />,
  },
  {
    id: 'layers',
    name: '图层',
    icon: <Layers />,
  },
  {
    id: 'variable',
    name: '变量',
    icon: <Variable />,
  },
  {
    id: 'datasource',
    name: '数据源',
    icon: <Database />,
  },
];

const Header = () => {
  const navigate = useNavigate();
  const panelConfig = useDesignStore((state) => state.panelConfig);
  const setSiderBarModel = useDesignStore((state) => state.setSiderBarModel);
  const setPropsPanelOpen = useDesignStore((state) => state.setPropsPanelOpen);
  const pageSchema = useDesignStore((state) => state.pageSchema);
  const state = useDesignStateStore((state) => state.state);
  const components = useDesignComponentsStore((state) => state.components);
  const datasource = useDesignDatasourceStore((state) => state.datasource);

  const { runAsync: updatePageSchema, loading } = useRequest(
    () => pageApi.updatePageSchema({ ...pageSchema, state, components, datasource }, pageSchema.id!),
    {
      manual: true,
      onSuccess: () => {
        toast.success('保存成功');
      },
    },
  );

  return (
    <div className="flex items-center px-4 h-full justify-between relative">
      <div className="header-left flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate('/manage/dashboard')}>
          <Home />
          <span>首页</span>
        </Button>
        {designConfig.map((item) => (
          <Toggle
            size="sm"
            variant="outline"
            pressed={panelConfig.siderBarModel === item.id}
            onClick={() => {
              if (panelConfig.siderBarModel === item.id) {
                setSiderBarModel(null);
              } else {
                setSiderBarModel(item.id as 'material' | 'layers' | 'variable');
              }
            }}
            key={item.id}
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
          >
            {item.icon}
            <span>{item.name}</span>
          </Toggle>
        ))}
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
    </div>
  );
};

export default Header;

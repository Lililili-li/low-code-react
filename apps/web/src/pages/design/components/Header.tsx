import LanguageToggle from '@/components/LanguageToggle';
import Select from '@/components/Select';
import ThemeToggle from '@/components/ThemeToggle';
import { useDesignStore } from '@/store/modules/design';
import { Button } from '@repo/ui/components/button';
import { Toggle } from '@repo/ui/components/toggle';
import { AppWindow, Component, Database, Home, Layers, PlusCircle, Save, Variable } from 'lucide-react';
import { useNavigate } from 'react-router';
import SavePage from './SavePage';

const pageOptions = [
  {
    label: '综合概览',
    value: '1',
  },
  {
    label: '客流分析',
    value: '2',
  },
  {
    label: '景区资源',
    value: '3',
  },
];

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
    icon: <Database/>,
  },
];

const Header = () => {
  const navigate = useNavigate();
  const config = useDesignStore(state => state.config);
  const setSiderVisible = useDesignStore(state => state.setSiderVisible);
  return (
    <div className="flex items-center px-4 h-full justify-between relative">
      <div className="header-left flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate('/manage/dashboard')}>
          <Home />
          <span>回到首页</span>
        </Button>
        {designConfig.map((item) => (
          <Toggle
            size="sm"
            variant="outline"
            pressed={config.siderVisible === item.id}
            onClick={() => setSiderVisible(item.id as 'material' | 'layers' | 'variable')}
            key={item.id}
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
          >
            {item.icon}
            <span>{item.name}</span>
          </Toggle>
        ))}
      </div>
      <div className="header-center flex gap-2 items-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Select
          value="1"
          onChange={(value) => {}}
          options={pageOptions}
          placeholder="请选择页面"
          allowClear={false}
          className="w-[240px]"
        />

        <SavePage
          renderTrigger={
            <Button size="sm" variant="outline">
              <PlusCircle />
              <span>添加页面</span>
            </Button>
          }
        ></SavePage>
      </div>
      <div className="header-right flex gap-2">
        <Button size="sm" variant="outline">
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
    </div>
  );
};

export default Header;

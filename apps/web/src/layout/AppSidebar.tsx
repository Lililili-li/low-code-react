import { Button } from '@repo/ui/components/button';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@repo/ui/components/sidebar';
import { BookOpenText, Database, HelpCircle, Map, Settings, Settings2 } from 'lucide-react';
import { IconAppCenter, IconSemiLogo } from '@douyinfe/semi-icons';
import { Menu, MenuItem } from '@/components/Menu';
import { LayoutDashboard, FolderKanban, Image, Layers, Globe, Component } from 'lucide-react';

const AppSidebar = () => {
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      label: '工作台',
      icon: <LayoutDashboard className="size-4" />,
      path: '/manage/dashboard',
    },
    {
      key: 'project',
      label: '项目管理',
      icon: <Globe className="size-4" />,
      children: [
        {
          key: 'resource',
          label: '项目资源',
          icon: <IconAppCenter className="size-4" />,
          path: '/manage/project/resource',
        },
      ],
    },
    {
      key: 'application',
      label: '应用管理',
      icon: <IconAppCenter className="size-4" />,
      path: '/manage/application',
      // children: [
      //   {
      //     key: 'application',
      //     label: '应用管理',
      //     icon: <IconAppCenter className="size-4" />,
      //     path: '/manage/resource/application',
      //   },
      //   {
      //     key: 'component',
      //     label: '组件资源',
      //     icon: <Layers className="size-4" />,
      //     path: '/manage/resource/component',
      //   },
      //   {
      //     key: 'image',
      //     label: '图片资源',
      //     icon: <Image className="size-4" />,
      //     path: '/manage/resource/image',
      //   },
      // ],
    },

    {
      key: 'resource',
      label: '资源管理',
      icon: <Globe className="size-4" />,
      children: [
        {
          key: 'file',
          label: '静态资源',
          icon: <Image className="size-4" />,
          path: '/manage/resource/file',
        },
        {
          key: 'map',
          label: '地图资源',
          icon: <Map className="size-4" />,
          path: '/manage/resource/map',
        },
      ],
    },
    // {
    //   key: 'template',
    //   label: '社区模板',
    //   icon: <Component className="size-4" />,
    //   path: '/manage/template',
    // },
    {
      key: 'system',
      label: '系统设置',
      icon: <Settings className="size-4" />,
      children: [
        {
          key: 'category',
          label: '分类管理',
          icon: <BookOpenText className="size-4" />,
          path: '/manage/system/category',
        },
      ],
      // path: '/manage/system',
    },
  ];
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center items-center gap-2 h-[50px] border-b">
          <IconSemiLogo />
          <span className="logo-title">超级无敌机器大人</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Menu items={menuItems} defaultOpenKeys={['dashboard']} />
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline">
          帮助与反馈
          <HelpCircle />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

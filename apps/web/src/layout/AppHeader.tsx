import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@repo/ui/components/button';
import { useSidebar } from '@repo/ui/components/sidebar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@repo/ui/components/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { PanelLeft, PanelRight } from 'lucide-react';
import { useUserStore } from '@/store/modules/user';
import { Separator } from '@repo/ui/components/separator';
import { IconQuit, IconUserSetting } from '@douyinfe/semi-icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import { useLocation } from 'react-router';

const routeMap: Record<string, string> = {
  resource: '我的应用',
  project: '项目管理',
  component: '组件资源',
  image: '图片资源',
  template: '社区模板',
  dataSource: '数据源',
  dashboard: '工作台',
  application: '应用管理',
};

const AppHeader = () => {
  const { toggleSidebar, state } = useSidebar();
  const user = useUserStore((state) => state.user);

  const location = useLocation();
  const locationPath = location.pathname
    .split('/')
    .filter((item, index) => item !== 'manage' && index > 0);
  const crumbs = locationPath.map((item) => routeMap[item]) || [];
  return (
    <div className="app-header h-[50px] flex justify-between px-3 items-center border-b dark:bg-[#18181b]">
      <div className="sidebar-status flex items-center h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" onClick={toggleSidebar} className="px-3">
              {state === 'expanded' ? (
                <PanelLeft style={{ width: 20, height: 20 }} />
              ) : (
                <PanelRight style={{ width: 20, height: 20 }} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{state === 'expanded' ? '收起' : '展开'}</TooltipContent>
        </Tooltip>
        <Breadcrumb>
          <BreadcrumbList className='flex'>
            {crumbs.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                {index !== crumbs.length - 1 && (
                  <>
                    <BreadcrumbItem>{item}</BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                {index === crumbs.length - 1 && (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="operation flex items-center gap-2 pr-2">
        <ThemeToggle />
        <LanguageToggle />
        <Popover>
          <PopoverTrigger asChild>
            <Avatar>
              <AvatarImage src={user.avatar || 'https://github.com/shadcn.png'} alt="Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align='end'>
            <div className="information flex gap-2">
              <Avatar>
                <AvatarImage src={user.avatar || 'https://github.com/shadcn.png'} alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="name text-sm">
                <div>{user.user_name}</div>
                <div className="text-[12px] text-gray-500">{user.account}</div>
              </div>
            </div>
            <Separator variant="dashed" className="my-2" />
            <div className="setting-btn-group">
              <Button variant="ghost" className="w-full text-[13px] justify-start gap-1.5">
                <IconUserSetting />
                <span>个人设置</span>
              </Button>
              <Button variant="ghost" className="w-full text-[13px] justify-start gap-1.5">
                <IconQuit />
                <span>退出登录</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AppHeader;

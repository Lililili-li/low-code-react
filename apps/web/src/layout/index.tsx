import { SidebarProvider } from '@repo/ui/components/sidebar';
import AppSidebar from './AppSidebar';
import './index.less';
import { Outlet } from 'react-router';
import AppHeader from './AppHeader';
import { useSystemStore } from '@/store/modules/system';
import { useRequest } from 'ahooks';
import industryApi from '@/api/industry';

const Layout = () => {
  const { setIndustries } = useSystemStore();

  useRequest(() => industryApi.getIndustries(), {
    onSuccess: (data) => {
      setIndustries(data);
    },
  })

  return (
    <SidebarProvider className="h-full w-screen">
      <AppSidebar />
      <main className="flex flex-col flex-1 h-full relative">
        <AppHeader />
        <div className="h-[calc(100vh-50px)] overflow-auto bg-[#f1f2f5] dark:bg-[#09090b]">
          <section className='h-full'>
            <Outlet />
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;

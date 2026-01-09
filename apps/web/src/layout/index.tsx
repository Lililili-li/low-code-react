import { SidebarProvider } from '@repo/ui/components/sidebar';
import AppSidebar from './AppSidebar';
import './index.less';
import { Outlet } from 'react-router';
import AppHeader from './AppHeader';

const Layout = () => {
  return (
    <SidebarProvider className="h-dvh w-screen">
      <AppSidebar />
      <main className="flex flex-col flex-1 h-full relative">
        <AppHeader />
        <div className="h-[calc(100dvh-50px)] overflow-hidden dark:bg-[#18181b]">
          <section className='h-full'>
            <Outlet />
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;

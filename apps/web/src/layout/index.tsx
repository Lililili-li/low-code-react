import { SidebarProvider } from '@repo/ui/components/sidebar';
import AppSidebar from './AppSidebar';
import './index.less';
import { Outlet } from 'react-router';
import AppHeader from './AppHeader';

const Layout = () => {
  return (
    <SidebarProvider className="h-full">
      <AppSidebar />
      <main className="flex flex-col flex-1 h-full">
        <AppHeader />
        <div className="flex-1 overflow-y-auto">
          <section className="p-6 flex-1 bg-[#f1f2f5] dark:bg-[#09090b] h-full">
            <Outlet />
          </section>
        </div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;

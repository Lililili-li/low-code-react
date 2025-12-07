import { SidebarProvider } from "@repo/ui/components/sidebar"
import AppSidebar from "./AppSidebar"
import './index.less'
import { Outlet } from "react-router"
import AppHeader from "./AppHeader"


const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1">
        <AppHeader />
        <section className="p-6 flex-1 bg-[#f1f2f5] dark:bg-[#18181b]">
          <Outlet />
        </section>
      </main>
    </SidebarProvider>
  )
}

export default Layout

import { Button } from "@repo/ui/components/button"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@repo/ui/components/sidebar"
import { Database, HelpCircle } from "lucide-react"
import { IconSemiLogo } from '@douyinfe/semi-icons'
import { Menu, MenuItem } from "@/components/Menu"
import { LayoutDashboard, FolderKanban, Image, Layers, Globe, Component } from "lucide-react"


const AppSidebar = () => {
  const menuItems: MenuItem[] = [
    { key: "dashboard", label: "工作台", icon: <LayoutDashboard className="size-4" />, path: "/manage/dashboard" },
    {
      key: "resources",
      label: "我的应用",
      icon: <FolderKanban className="size-4" />,
      children: [
        { key: "application", label: "项目管理", icon: <Globe className="size-4" />, path: "/manage/resources/application" },
        { key: "components", label: "组件资源", icon: <Layers className="size-4" />, path: "/manage/resources/components" },
        { key: "images", label: "图片资源", icon: <Image className="size-4" />, path: "/manage/resources/images" },
      ],
    },
    { key: "template", label: "社区模板", icon: <Component className="size-4" />, path: "/manage/template" },
    { key: "dataSource", label: "数据源", icon: <Database className="size-4" />, path: "/manage/dataSource" },
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-center items-center gap-2">
          <IconSemiLogo />
          <span className="logo-title">
            超级无敌机器大人
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent >
        <Menu items={menuItems} defaultOpenKeys={["dashboard"]} />
      </SidebarContent>
      <SidebarFooter>
        <Button variant="outline">
          帮助与反馈
          <HelpCircle />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
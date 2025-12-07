import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@repo/ui/components/button'
import { useSidebar } from '@repo/ui/components/sidebar'
import { Tooltip, TooltipTrigger, TooltipContent } from '@repo/ui/components/tooltip'
import { Popover, PopoverTrigger, PopoverContent } from '@repo/ui/components/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { PanelLeft, PanelRight, SlashIcon } from 'lucide-react'
import { useUserStore } from '@/store/modules/user'
import { Separator } from '@repo/ui/components/separator'
import { IconQuit, IconUserSetting } from '@douyinfe/semi-icons'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb"

const AppHeader = () => {
  const { toggleSidebar, state } = useSidebar()
  const user = useUserStore(state => state.user)

  return (
    <div className="app-header h-[50px] flex justify-between px-3 items-center border-b dark:bg-[#18181b]">
      <div className="sidebar-status flex items-center h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' onClick={toggleSidebar} className='px-3'>
              {state === 'expanded' ? <PanelLeft style={{ width: 20, height: 20 }} /> : <PanelRight style={{ width: 20, height: 20 }} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {state === 'expanded' ? '收起' : '展开'}
          </TooltipContent>
        </Tooltip>
        <Breadcrumb>
          <BreadcrumbList>
            {/* <BreadcrumbItem>
              <BreadcrumbLink asChild>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                Components
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <SlashIcon />
            </BreadcrumbSeparator> */}
            <BreadcrumbItem>
              <BreadcrumbPage className='font-bold'>工作台</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="operation flex items-center gap-2 pr-4">
        <ThemeToggle />
        <LanguageToggle />
        <Popover>
          <PopoverTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2">
            <div className="information flex gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="name text-sm">
                <div>{user.user_name}</div>
                <div className="text-[12px] text-gray-500">{user.account}</div>
              </div>
            </div>
            <Separator variant='dashed' className="my-2" />
            <div className="setting-btn-group">
              <Button variant='ghost' className='w-full text-[13px] justify-start gap-1.5'>
                <IconUserSetting />
                <span>个人设置</span>
              </Button>
              <Button variant='ghost' className='w-full text-[13px] justify-start gap-1.5'>
                <IconQuit />
                <span>退出登录</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default AppHeader
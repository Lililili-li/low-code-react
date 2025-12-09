import { Card, CardContent, CardTitle } from "@/components/Card"
import { ScrollArea } from '@repo/ui/components/scroll-area'
import projectLogo from "./images/project-logo.png"
import { Button } from "@repo/ui/components/button"
import { ChevronRight } from "lucide-react"


const Dashboard = () => {
  return (
    <div className="flex flex-col h-full">
      {/* <div className="title mb-4 font-bold text-2xl">
        工作台
      </div> */}
      <div className="statistics grid grid-cols-4 gap-4">
        <Card className="rounded-[4px] p-4">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>项目总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>应用总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>组件总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[4px] p-4">
          <CardTitle className="flex gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="logo-icon w-[30px] h-[30px] flex items-center justify-center rounded-[50%] bg-[#eef8e3] dark:bg-[#333532]">
                <img src={projectLogo} alt="" className="w-[20px]" />
              </div>
              <span>模板总数</span>
            </div>
          </CardTitle>
          <CardContent>
            <div className="total">
              共 <span className="font-weight text-4xl">100</span> 个
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-[4px] p-4 mt-4 flex-1">
        <CardTitle className="flex gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="line w-1 h-[18px] bg-primary rounded-[2px]"></div>
            <div>
              <span>我的应用</span>
              <span className="text-xs text-gray-500 ml-2">最近14天创建的应用</span>
            </div>
          </div>
          <div>
            <Button variant="link">
              查看更多
              <ChevronRight />
            </Button>
          </div>
        </CardTitle>
        <CardContent>
          <div className="applications mt-2">
            <ScrollArea className="h-[calc(100%-32px)]">
              sadjaskldj
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
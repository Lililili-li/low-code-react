import { Label } from "@repo/ui/components/label";
import { InputGroup, InputGroupText, InputGroupInput } from "@repo/ui/components/input-group";
import { Button } from "@repo/ui/components/button";
import { CirclePlus } from "lucide-react";
import { Switch } from "@repo/ui/components/switch";
import { Input } from "@repo/ui/components/input";

const NavToLink = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">跳转链接配置</div>
      <div className="content flex flex-col gap-2">
        <div className="flex gap-4">
          <Label className="w-15">新窗口</Label>
          <Switch />
        </div>
        <div className="flex gap-4">
          <Label className="w-15">跳转延迟</Label>
          <InputGroup className="w-[120px]">
            <InputGroupInput value={0} type="number" />
            <InputGroupText className="mr-2">秒</InputGroupText>
          </InputGroup>
        </div>
        <div className="flex gap-4">
          <Label className="w-15">携带参数</Label>
          <div className="list flex-col gap-2">
            <div className="flex gap-2">
              <Label>key</Label>
              <Input placeholder="参数名" className="w-[180px]" />
              <Label>value</Label>
              <Input placeholder="参数值" className="w-[180px]" />
              <Button size="sm" variant="ghost">
                <CirclePlus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavToLink;

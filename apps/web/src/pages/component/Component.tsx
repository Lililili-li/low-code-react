import { Card, CardContent, CardTitle } from '@/components/Card';
import { Button } from '@repo/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from '@repo/ui/components/input-group';
import { CircleX, FolderPlus, Search } from 'lucide-react';
import { Tree, type TreeNode } from '@repo/ui/components/tree';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@repo/ui/components/select';
import { useRequest } from 'ahooks';
import componentApi, { type ComponentCategoryProps } from '@/api/component';
import DynamicIcon from '@/components/DynamicIcon';
import { ScrollArea } from '@repo/ui/components/scroll-area';

// Transform ComponentCategoryProps to TreeNode (convert id from number to string)
const transformToTreeNodes = (categories: ComponentCategoryProps[]): TreeNode[] => {
  return categories.map((category) => ({
    ...category,
    id: String(category.id),
    label: category.name,
    icon: category.icon ? (
      <DynamicIcon name={category.icon} className="size-4 shrink-0 text-muted-foreground" />
    ) : undefined,
    children: category.children ? transformToTreeNodes(category.children) : undefined,
  }));
};

const Components = () => {
  const { data: categories = [] } = useRequest(() => componentApi.getComponentCategories());

  return (
    <div className="flex flex-col gap-4 ">
      <Card>
        <CardTitle>组件资源</CardTitle>
        <CardContent className='text-sm text-gray-600'>
          您可为项目添加合适的组件资源
        </CardContent>
      </Card>
      <div className="component-content flex  gap-4">
        <div className="sidebar w-[20%] ">
          <Card className=" flex flex-col gap-2">
            <CardTitle>
              <div className="flex justify-between items-center">
                <InputGroup className="w-full h-[32px] group">
                  <InputGroupInput
                    placeholder="请输入分类名称"
                    className="w-full"
                    onKeyDown={(e) => {}}
                    onChange={(e) => {}}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupButton asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                      onClick={() => {}}
                    >
                      <CircleX className="size-4" />
                    </Button>
                  </InputGroupButton>
                </InputGroup>
              </div>
            </CardTitle>
            <CardContent className="flex-1 mt-0 min-h-0">
              <ScrollArea className=''>
                <Tree
                  data={transformToTreeNodes(categories)}
                  onSelect={(id) => console.log('Selected:', id)}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <div className="content flex-1 ">
          <Card className="">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <InputGroup className="w-[240px] h-[32px] group">
                  <InputGroupInput
                    placeholder="请输入组件名称"
                    className="w-[240px]"
                    onKeyDown={(e) => {}}
                    onChange={(e) => {}}
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupButton asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                      onClick={() => {}}
                    >
                      <CircleX className="size-4" />
                    </Button>
                  </InputGroupButton>
                </InputGroup>
                <Select
                  // value={queryParams.industry}
                  onValueChange={(value) => {}}
                >
                  <SelectTrigger
                    className="w-[240px] h-[32px] group justify-between"
                    style={{ height: 32 }}
                    allowClear={true}
                    onClear={() => {}}
                  >
                    <div className="flex items-center gap-2 justify-between flex-1 relative">
                      <SelectValue placeholder="请选择组件类别" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">基础组件</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="default" size="sm">
                <FolderPlus />
                添加组件
              </Button>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Components;

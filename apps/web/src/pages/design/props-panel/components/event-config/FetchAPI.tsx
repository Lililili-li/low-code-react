import { useDesignDatasourceStore } from '@/store/design/dataSource';
import { Label } from '@repo/ui/components/label';
import { MultiSelect } from '@repo/ui/components/multi-select';


const FetchAPI = ({ value, onValueChange }: { value: string[]; onValueChange: (value: string[]) => void }) => {
  const apiList = useDesignDatasourceStore((state) => state.datasource);
  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">请求接口配置</div>
      <div className="content flex flex-col">
        <div className="flex gap-2 flex-col">
          <Label className="w-15">关联接口</Label>
          <MultiSelect
            options={apiList.map(item => ({label: item.name, value: item.id}))}
            value={value}
            onChange={onValueChange}
            placeholder="请选择关联接口"
            maxDisplay={3}  // 最多显示3个标签
          />
        </div>
      </div>
    </div>
  );
};

export default FetchAPI;

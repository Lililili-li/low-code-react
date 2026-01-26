import Select from '@/components/Select';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { InputGroup, InputGroupText, InputGroupInput } from '@repo/ui/components/input-group';
import { Label } from '@repo/ui/components/label';
import { CircleMinus, CirclePlus } from 'lucide-react';
import { ActionSchema, DataType } from '@repo/core/types';
import { useEffect, useState } from 'react';

const NavToPage = ({
  value,
  onValueChange,
}: {
  value: ActionSchema['navToPage'];
  onValueChange: (value: ActionSchema['navToPage']) => void;
}) => {
  const pageOptions = [
    {
      label: '综合概览',
      value: '1',
    },
    {
      label: '客流分析',
      value: '2',
    },
    {
      label: '景区资源',
      value: '3',
    },
  ];
  const [params, setParams] = useState<ActionSchema['navToPage']>({
    pageId: '',
    delay: 0,
    linkParams: [],
  });
  useEffect(() => {
    if (value) {
      setParams(value);
    }
  }, [value]);

  const updateParams = (newParams: ActionSchema['navToPage']) => {
    setParams(newParams);
    onValueChange(newParams);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">跳转当前应用页面配置</div>
      <div className="content flex flex-col gap-2">
        <div className="flex gap-4">
          <Label className="w-15">页面地址</Label>
          <Select
            options={pageOptions}
            placeholder="请选择页面"
            value={params?.pageId!}
            onChange={(value) => updateParams({ ...params!, pageId: value })}
            className="w-[240px]"
          ></Select>
        </div>
        <div className="flex gap-4">
          <Label className="w-15">跳转延迟</Label>
          <InputGroup className="w-[120px]">
            <InputGroupInput defaultValue={params?.delay} type="number" />
            <InputGroupText className="mr-2">秒</InputGroupText>
          </InputGroup>
        </div>
        <div className="flex gap-4 items-start">
          <Label className="w-15 h-8">携带参数</Label>
          <div className="list flex flex-col gap-2">
            {params?.linkParams.map((item, index) => {
              return (
                <div className="flex gap-2 item" key={index}>
                  <Label>key</Label>
                  <Input
                    placeholder="参数名"
                    className="w-[150px]"
                    defaultValue={item.key}
                    onEnterSearch={(value) => {
                      const newParams = [...params!.linkParams];
                      newParams[index] = { ...newParams[index], key: value };
                      updateParams({
                        ...params!,
                        linkParams: newParams,
                      });
                    }}
                  />
                  <Label>value</Label>
                  <Input
                    placeholder="参数值"
                    className="w-[150px]"
                    defaultValue={item.value}
                    onEnterSearch={(value) => {
                      const newParams = [...params!.linkParams];
                      newParams[index] = { ...newParams[index], value: value };
                      updateParams({
                        ...params!,
                        linkParams: newParams,
                      });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newParams = [...params!.linkParams];
                      newParams.push({
                        key: '',
                        value: '',
                        dataType: DataType.Normal,
                      });
                      updateParams({
                        ...params!,
                        linkParams: newParams,
                      });
                    }}
                  >
                    <CirclePlus className="size-4" />
                  </Button>
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newParams = [...params!.linkParams];
                        newParams.splice(index, 1);
                        updateParams({
                          ...params!,
                          linkParams: newParams,
                        });
                      }}
                    >
                      <CircleMinus className="size-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavToPage;

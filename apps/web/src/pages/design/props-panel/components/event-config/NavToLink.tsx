import { Label } from '@repo/ui/components/label';
import { InputGroup, InputGroupText, InputGroupInput } from '@repo/ui/components/input-group';
import { Button } from '@repo/ui/components/button';
import { CircleMinus, CirclePlus } from 'lucide-react';
import { Switch } from '@repo/ui/components/switch';
import { Input } from '@repo/ui/components/input';
import { ActionSchema, DataType } from '@repo/core/types';
import { useEffect, useState } from 'react';

const NavToLink = ({
  value,
  onValueChange,
}: {
  value: ActionSchema['navToLink'] | undefined;
  onValueChange: (value: ActionSchema['navToLink']) => void;
}) => {
  const [params, setParams] = useState<ActionSchema['navToLink']>({
    isBlank: false,
    linkUrl: '',
    delay: 0,
    linkParams: [],
  });

  useEffect(() => {
    if (value) {
      setParams(value);
    }
  }, [value]);

  const updateParams = (newParams: ActionSchema['navToLink']) => {
    setParams(newParams);
    onValueChange(newParams);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">跳转链接配置</div>
      <div className="content flex flex-col gap-2">
        <div className="flex gap-4">
          <Label className="w-20">打开新窗口</Label>
          <Switch
            checked={params?.isBlank}
            onCheckedChange={(value) =>
              updateParams({
                linkUrl: params!.linkUrl,
                delay: params!.delay,
                linkParams: params!.linkParams,
                isBlank: value,
              })
            }
          />
        </div>
        <div className="flex gap-4">
          <Label className="w-20">跳转链接</Label>
          <InputGroup className="w-[240px]">
            <InputGroupInput
              placeholder="请输入跳转链接"
              defaultValue={params?.linkUrl || ''}
              onEnterSearch={(value) => {
                updateParams({
                  linkUrl: value,
                  delay: params!.delay,
                  linkParams: params!.linkParams,
                  isBlank: params!.isBlank,
                });
              }}
            />
          </InputGroup>
        </div>
        <div className="flex gap-4">
          <Label className="w-20">跳转延迟</Label>
          <InputGroup className="w-[120px]">
            <InputGroupInput
              defaultValue={params?.delay || 0}
              onEnterSearch={(value) => {
                updateParams({
                  linkUrl: params!.linkUrl,
                  isBlank: params!.isBlank,
                  linkParams: params!.linkParams,
                  delay: Number(value),
                });
              }}
              type="number"
            />
            <InputGroupText className="mr-2">秒</InputGroupText>
          </InputGroup>
        </div>
        <div className="flex gap-4 items-start">
          <Label className="w-20 h-8">携带参数</Label>
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

export default NavToLink;

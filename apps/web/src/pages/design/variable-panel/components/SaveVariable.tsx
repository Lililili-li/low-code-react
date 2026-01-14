import { Button } from '@repo/ui/components/button';
import { X } from 'lucide-react';
import { Ref, useImperativeHandle, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import MonacoEditor from '@repo/ui/components/monaco-editor';

export interface SaveVariableRef {
  openDialog: (params?: { name: string; defaultValue: string; type: string }) => void;
  closeDialog: () => void;
}

const SaveVariable = ({
  ref,
  onClose,
  onSave,
}: {
  ref: Ref<SaveVariableRef>;
  onClose: () => void;
  onSave: (variable: { key: string; defaultValue: string; type: string }) => void;
}) => {
  const [visible, setVisible] = useState(false);

  const closeDialog = () => {
    setVisible(false);
    onClose();
    setTimeout(() => {
      form.reset();
    }, 500);
  };
  const openDialog = (params?: { name: string; defaultValue: string; type: string }) => {
    setVisible(true);
    if (params) {
      const defaultValue =
        params.type === 'number'
          ? Number(params.defaultValue).toString()
          : params.type === 'string'
            ? String(params.defaultValue)
            : params.type === 'boolean'
              ? Boolean(params.defaultValue).toString()
              : params.type === 'array' || params.type === 'object'
                ? JSON.stringify(params.defaultValue, null, 2)
                : params.defaultValue;
      form.setValue('name', params.name);
      form.setValue('defaultValue', defaultValue);
      form.setValue('type', params.type);
    }
  };
  useImperativeHandle(ref, () => ({
    openDialog,
    closeDialog,
  }));

  const FormSchema = z.object({
    name: z
      .string()
      .min(1, {
        message: '变量名称不能为空',
      })
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
        message: '变量名称只能包含数字、字母和下划线，且不能以数字开头',
      }),
    type: z.string().min(1, {
      message: '变量类型不能为空',
    }),
    defaultValue: z.any(),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      type: 'string',
      defaultValue: '',
    },
  });

  const onSubmit = () => {
    form.handleSubmit((data) => {
      const defaultValue =
        data.type === 'number'
          ? Number(data.defaultValue)
          : data.type === 'string'
            ? String(data.defaultValue)
            : data.type === 'boolean'
              ? data.defaultValue === 'false' ? false : true
              : data.type === 'array' || data.type === 'object'
                ? JSON.parse(data.defaultValue)
                : data.defaultValue;
      onSave({
        key: data.name,
        defaultValue,
        type: data.type,
      });
    })();
  };

  return (
    <div
      className={`save-variable-container h-full overflow-hidden ${visible ? 'w-[500px]' : 'w-0 border-0'} duration-500 transition-[width] absolute right-0 top-0 translate-x-full border dark:bg-[#18181b] bg-white border-t-0 border-b-0`}
      style={{ zIndex: 10 }}
    >
      <div className="save-variable-header min-w-[400px] flex items-center justify-between border-b p-2 px-3">
        <div className="title text-[16px]">添加变量</div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onSubmit()} className="h-[28px] w-[60px]">
            保存
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="size-6 rounded-[50%] p-0"
            onClick={closeDialog}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <div className="save-variable-content px-3 min-w-[350px]">
        <Form {...form}>
          <form>
            <div className="flex flex-col gap-5 py-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>
                      <span className="text-red-500">*</span>
                      变量名称
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="只能包含数字字母下划线，且不能以数字开头" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>初始值类型</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="string" id="r1" />
                          <Label htmlFor="r1">String</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="number" id="r2" />
                          <Label htmlFor="r2">Number</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="boolean" id="r4" />
                          <Label htmlFor="r4">Boolean</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="array" id="r5" />
                          <Label htmlFor="r5">Array</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="object" id="r6" />
                          <Label htmlFor="r6">Object</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>初始值</FormLabel>
                    <FormControl>
                      <MonacoEditor
                        value={field.value}
                        onChange={field.onChange}
                        language="json"
                        height={300}
                        lineNumbers="off"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormItem className="flex flex-col gap-2">
                <FormLabel>提示</FormLabel>
                <FormControl>
                  <div className="tip p-2 text-sm dark:text-gray-300 text-gray-600 bg-[#f5f5f5] dark:bg-[#333] rounded-[4px] min-w-[300px]">
                    字符串:"string"
                    <br />
                    数字:123
                    <br />
                    布尔值:true/false
                    <br />
                    对象:{`{"name":"xxx"}`}
                    <br />
                    数组:["1","2"]
                    <br />
                  </div>
                </FormControl>
              </FormItem>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SaveVariable;

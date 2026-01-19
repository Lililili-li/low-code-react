import Empty from '@/components/Empty';
import { Button } from '@repo/ui/components/button';
import { FormControl, FormField, FormItem, FormMessage } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import MonacoEditor from '@repo/ui/components/monaco-editor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { isArray } from 'lodash-es';
import { CircleMinus, PlusCircle } from 'lucide-react';
import BindVariableDialog from '../../variable-panel/components/BindVariableDialog';
import { DataType } from '@repo/core/types';

interface BodyParamsTabProps {
  form: any;
}


const BodyParamsTab = ({ form }: BodyParamsTabProps) => {
  
  return (
    <FormField
      control={form.control}
      name="bodyParams"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormControl>
            <Tabs
              value={field.value.type}
              onValueChange={(value) => {
                field.onChange({ ...field.value, type: value });
              }}
            >
              <TabsList>
                <TabsTrigger value="none">none</TabsTrigger>
                <TabsTrigger value="form-data">form-data</TabsTrigger>
                <TabsTrigger value="x-www-form-urlencoded">
                  <span>x-www-form-urlencoded</span>
                  
                </TabsTrigger>
                <TabsTrigger value="json">json</TabsTrigger>
              </TabsList>
              <TabsContent value="none">
                <Empty description="参数为None"></Empty>
              </TabsContent>
              <TabsContent value="form-data">
                <div className="border w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isArray(field.value.params['form-data']) &&
                        field.value?.params['form-data']?.map(
                          (
                            item: { key: string; value: string; dataType: string },
                            index: number,
                          ) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                <Input
                                  value={item.key}
                                  onChange={(e) => {
                                    const newFields = [...field.value.params['form-data']];
                                    newFields[index].key = e.target.value;
                                    field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newFields } });
                                  }}
                                  placeholder="请输入key"
                                ></Input>
                              </TableCell>
                              <TableCell className="items-center">
                                <div className="flex items-center gap-2">
                                  {item.dataType === DataType.Normal ? (
                                    <Input
                                      value={item.value}
                                      onChange={(e) => {
                                        const newFields = [...field.value.params['form-data']];
                                        newFields[index].value = e.target.value;
                                        field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newFields } });
                                      }}
                                      placeholder="请输入value"
                                      className="flex-1"
                                    ></Input>
                                  ) : (
                                    <div className="flex-1">已绑定{item.value}</div>
                                  )}
                                  <BindVariableDialog
                                    id={item.value}
                                    onChange={(value) => {
                                      const newFields = [...field.value.params['form-data']];
                                      newFields[index].value = value;
                                      newFields[index].dataType = DataType.JsExpression;
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newFields } });
                                    }}
                                    onClear={() => {
                                      const newFields = [...field.value.params['form-data']];
                                      newFields[index].value = '';
                                      newFields[index].dataType = DataType.Normal;
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newFields } });
                                    }}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newValue = [...field.value.params['form-data']];
                                    newValue.push({ key: '', value: '', dataType: DataType.Normal });
                                    field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newValue } });
                                  }}
                                >
                                  <PlusCircle />
                                </Button>
                                {index > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newValue = [...field.value.params['form-data']];
                                      newValue.splice(index, 1);
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'form-data': newValue } });
                                    }}
                                  >
                                    <CircleMinus />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="x-www-form-urlencoded">
                <div className="border w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isArray(field.value.params['x-www-form-urlencoded']) &&
                        field.value?.params['x-www-form-urlencoded']?.map(
                          (
                            item: { key: string; value: string; dataType: string },
                            index: number,
                          ) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                <Input
                                  value={item.key}
                                  onChange={(e) => {
                                    const newFields = [...field.value.params['x-www-form-urlencoded']];
                                    newFields[index].key = e.target.value;
                                    field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newFields } });
                                  }}
                                  placeholder="请输入key"
                                ></Input>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 items-center">
                                  {item.dataType === DataType.Normal ? (
                                    <Input
                                      value={item.value}
                                      onChange={(e) => {
                                        const newFields = [...field.value.params['x-www-form-urlencoded']];
                                        newFields[index].value = e.target.value;
                                        field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newFields } });
                                      }}
                                      placeholder="请输入value"
                                      className="flex-1"
                                    ></Input>
                                  ) : (
                                    <div className="flex-1">已绑定{item.value}</div>
                                  )}
                                  <BindVariableDialog
                                    id={item.value}
                                    onChange={(value) => {
                                      const newFields = [...field.value.params['x-www-form-urlencoded']];
                                      newFields[index].value = value;
                                      newFields[index].dataType = DataType.JsExpression;
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newFields } });
                                    }}
                                    onClear={() => {
                                      const newFields = [...field.value.params['x-www-form-urlencoded']];
                                      newFields[index].value = '';
                                      newFields[index].dataType = DataType.Normal;
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newFields } });
                                    }}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newValue = [...field.value.params['x-www-form-urlencoded']];
                                    newValue.push({ key: '', value: '', dataType: DataType.Normal });
                                    field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newValue } });
                                  }}
                                >
                                  <PlusCircle />
                                </Button>
                                {index > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const newValue = [...field.value.params['x-www-form-urlencoded']];
                                      newValue.splice(index, 1);
                                      field.onChange({ ...field.value, params: { ...field.value.params, 'x-www-form-urlencoded': newValue } });
                                    }}
                                  >
                                    <CircleMinus />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="json">
                {field.value.type === 'json' && (
                  <MonacoEditor
                    value={field.value.params['json']}
                    onChange={(value) => field.onChange({ ...field.value, params: { ...field.value.params, json: value } })}
                    language="json"
                  />
                )}
              </TabsContent>
            </Tabs>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BodyParamsTab;

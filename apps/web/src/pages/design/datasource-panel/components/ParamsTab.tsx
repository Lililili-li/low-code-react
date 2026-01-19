import { Button } from '@repo/ui/components/button';
import { FormControl, FormField, FormItem, FormMessage } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { CircleMinus, PlusCircle } from 'lucide-react';
import BindVariableDialog from '../../variable-panel/components/BindVariableDialog';
import { DataType } from '@repo/core/types';

interface ParamsTabProps {
  form: any;
}

const ParamsTab = ({ form }: ParamsTabProps) => {
  return (
    <FormField
      control={form.control}
      name="params"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2">
          <FormControl>
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
                  {field.value.map(
                    (
                      item: { key: string; value: string; dataType: keyof typeof DataType },
                      index: number,
                    ) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Input
                            value={item.key}
                            onChange={(e) => {
                              const newFields = [...field.value];
                              newFields[index].key = e.target.value;
                              field.onChange(newFields);
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
                                  const newFields = [...field.value];
                                  newFields[index].value = e.target.value;
                                  field.onChange(newFields);
                                }}
                                placeholder="请输入value"
                              ></Input>
                            ) : (
                              <div>已绑定: {item.value}</div>
                            )}
                            <BindVariableDialog
                              id={item.value}
                              onChange={(value) => {
                                const newFields = [...field.value];
                                newFields[index].value = value;
                                newFields[index].dataType = DataType.JsExpression;
                                field.onChange(newFields);
                              }}
                              onClear={() => {
                                const newFields = [...field.value];
                                newFields[index].value = '';
                                newFields[index].dataType = DataType.Normal;
                                field.onChange(newFields);
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
                              form.setValue('params', [...field.value, { key: '', value: '' }]);
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
                                const newValue = [...field.value];
                                newValue.splice(index, 1);
                                form.setValue('params', newValue);
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ParamsTab;

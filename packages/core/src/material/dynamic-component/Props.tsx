import { Label } from '@repo/ui/components/label';
import { PageRouterPropsSchema } from './schema';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { DataType } from '../../types';

const Props = ({
  bindVariable,
  schema,
  pages,
  updateSchema,
}: {
  bindVariable?: ({
    key,
    onChange,
    onClear,
  }: {
    key: string;
    onChange: (value: string) => void;
    onClear: () => void;
  }) => React.ReactNode;
  schema: PageRouterPropsSchema;
  updateSchema: (updates: Partial<PageRouterPropsSchema>) => void;
  pages: { label: string; value: string }[];
}) => {
  const { props } = schema || {
    pageSchema: {
      components: [],
      state: {},
      datasource: [],
      globalCss: '',
    },
    pageId: '',
    dataType: '',
  };
  return (
    <div className="props-panel flex flex-col gap-2 px-2 mt-2">
      <div className="flex gap-2 items-center">
        <div className="shrink-0 w-[25%]">
          <Label>页面选择</Label>
        </div>
        <div className="flex-1 flex gap-2">
          {props.dataType === DataType.Normal ? (
            <Select
              value={props.pageId}
              onValueChange={(value) => {
                updateSchema?.({
                  ...schema,
                  props: {
                    ...schema?.props,
                    pageId: value,
                  },
                });
              }}
            >
              <SelectTrigger className="h-[32px]! w-full">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pages?.map((item) => {
                    return <SelectItem value={item.value}>{item.label}</SelectItem>;
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <div className='flex items-center text-sm'>已绑定{props.pageId}</div>
          )}
          {bindVariable?.({
            key: '',
            onChange: (value) => {
              updateSchema?.({
                ...schema,
                props: {
                  ...schema?.props,
                  dataType: DataType.JsExpression,
                  pageId: value,
                },
              });
            },
            onClear: () => {
              updateSchema?.({
                ...schema,
                props: {
                  ...schema?.props,
                  dataType: DataType.Normal,
                  pageId: '',
                },
              });
            },
          })}
        </div>
      </div>
    </div>
  );
};

export default Props;

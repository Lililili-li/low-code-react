import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Button } from '@repo/ui/components/button';
import { CircleX, Download, FolderPlus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useRef, useState } from 'react';
import { TreeTable, TreeTableColumn, TreeTableDataNode } from './components/tree-table';
import SaveMapSource, { SaveMapSourceRef } from './components/SaveMapSource';

interface MapData {
  key: string;
  name: string;
  type: string;
  mapCount: number;
  children?: MapData[];
}

const MapResource = () => {
  const [queryParams, setQueryParams] = useState({
    name: '',
  });

  const columns: TreeTableColumn<MapData>[] = [
    {
      key: 'map_name',
      title: '地图名称',
      dataIndex: 'map_name',
      width: '40%',
    },
    {
      key: 'map_level',
      title: '地图级别',
      dataIndex: 'type',
      width: '20%',
    },
    {
      key: 'map_code',
      title: '地图编号',
      dataIndex: 'map_code',
      width: '20%',
    },
    {
      key: 'actions',
      title: '操作',
      width: '20%',
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="h-auto p-0 text-blue-500 gap-1.5">
            <Edit className="size-4" />
            编辑
          </Button>
          <Button variant="link" size="sm" className="text-red-500 p-0 gap-1.5">
            <Trash2 className="size-4" />
            删除
          </Button>
          <Button variant="link" size="sm" className="h-auto p-0 text-blue-500 gap-1.5">
            <Eye className="size-4" />
            增加子级
          </Button>
          <Button variant="link" size="sm" className="h-auto p-0 text-blue-500 gap-1.5">
            <Eye className="size-4" />
            预览
          </Button>
        </div>
      ),
    },
  ];

  // const mockData: TreeTableDataNode<MapData>[] = [
  //   {
  //     key: '1',
  //     name: '中华人民共和国',
  //     type: '国家',
  //     mapCount: 0,
  //     children: [
  //       { key: '1-1', name: '北京市', type: '省份', mapCount: 11 },
  //       { key: '1-2', name: '河北省', type: '省份', mapCount: 13 },
  //       { key: '1-3', name: '天津市', type: '省份', mapCount: 12 },
  //       { key: '1-4', name: '山西省', type: '省份', mapCount: 14 },
  //       { key: '1-5', name: '内蒙古自治区', type: '省份', mapCount: 15 },
  //       { key: '1-6', name: '吉林省', type: '省份', mapCount: 22 },
  //       { key: '1-7', name: '黑龙江省', type: '省份', mapCount: 23 },
  //       { key: '1-8', name: '辽宁省', type: '省份', mapCount: 21 },
  //       { key: '1-9', name: '上海市', type: '省份', mapCount: 31 },
  //       { key: '1-10', name: '江苏省', type: '省份', mapCount: 32 },
  //       { key: '1-11', name: '浙江省', type: '省份', mapCount: 33 },
  //       { key: '1-12', name: '安徽省', type: '省份', mapCount: 34 },
  //       { key: '1-13', name: '福建省', type: '省份', mapCount: 35 },
  //     ],
  //   },
  // ];

  const mockData: TreeTableDataNode<MapData>[] = []

  const loadData = async (record: TreeTableDataNode<MapData>) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        record.children = [
          { key: `${record.key}-1`, name: '子节点1', type: '市', mapCount: 100 },
          { key: `${record.key}-2`, name: '子节点2', type: '市', mapCount: 101 },
        ];
        resolve();
      }, 500);
    });
  };

  const saveMapSourceRef = useRef<SaveMapSourceRef | null>(null)

  const createMapSource = () => {
    saveMapSourceRef.current?.openDialog('create')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center h-[50px] px-3 bg-white dark:bg-[#18181b] border-b">
        <div className="flex items-center gap-2">
          <InputGroup className="w-[240px] h-[32px] group">
            <InputGroupInput
              placeholder="地图名称"
              className="w-[240px]"
              onEnterSearch={(value) => {
                setQueryParams({ ...queryParams, name: value });
              }}
              defaultValue={queryParams.name}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            {queryParams.name && (
              <InputGroupButton asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-[50%] size-5 mr-1 opacity-0 group-focus-within:opacity-100 transition-opacity"
                  onClick={() => setQueryParams({ ...queryParams, name: '' })}
                >
                  <CircleX className="size-4" />
                </Button>
              </InputGroupButton>
            )}
          </InputGroup>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={createMapSource}>
            <FolderPlus />
            添加地图资源
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                'https://datav.aliyun.com/portal/school/atlas/area_selector#&lat=33.521903996156105&lng=104.29849999999999&zoom=4',
                '_blank',
              )
            }
          >
            <Download />
            下载地图资源
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#18181b]">
        <TreeTable
          columns={columns}
          dataSource={mockData}
          defaultExpandedKeys={['1']}
          loadData={loadData}
          className="h-full"
        />
      </div>
      <SaveMapSource ref={saveMapSourceRef} />
    </div>
  );
};

export default MapResource;

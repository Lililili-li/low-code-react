import MonacoEditor from '@repo/ui/components/monaco-editor';

const ChangeVariable = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">修改变量配置</div>
      <MonacoEditor
        value={value}
        onChange={(value) => onValueChange(value || '')}
        language="javascript"
        height="440px"
      />
    </div>
  );
};

export default ChangeVariable;

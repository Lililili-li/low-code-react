import MonacoEditor from '@repo/ui/components/monaco-editor';
import { useState } from 'react';

const ChangeVariable = () => {
  const [code, setCode] = useState(`function ChangeVariable(this, state) {
  console.log('ChangeVariable called with state:', state);
}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="title font-medium">修改变量配置</div>
      <MonacoEditor
        value={code}
        onChange={(value) => setCode(value || '')}
        language="javascript"
        height="440px"
      />
    </div>
  );
};

export default ChangeVariable;

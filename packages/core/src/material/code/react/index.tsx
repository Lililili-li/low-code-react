import { createFunctionComponent } from '@repo/shared/index';
import { useMemo } from 'react';
import { ReactCodePropsSchema } from './schema';

const ReactComponent = ({
  props,
  state,
  onStateChange,
}: ReactCodePropsSchema & { state: Record<string, any>; onStateChange: (state: Record<string, any>) => void }) => {
  const { option } = props;

  const Component = useMemo(() => createFunctionComponent(option.code, {
    imports: {},
  }), [option.code]);

  return (
    <div className="react-code-cmp h-full">
      <Component state={state} setState={onStateChange} />
    </div>
  );
};

export default ReactComponent;

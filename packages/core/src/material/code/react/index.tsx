import { createFunctionComponent } from '@repo/shared/index';
import { ReactCodePropsSchema } from './schema';

const ReactComponent = ({
  props,
  state,
}: ReactCodePropsSchema & { state: Record<string, any> }) => {
  const { option } = props;

  const Component = createFunctionComponent(option.code, {
    imports: {
      state,
    },
  });

  return (
    <div className="react-code-cmp h-full">
      <Component />
    </div>
  );
};

export default ReactComponent;

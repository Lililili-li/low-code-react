import { IconEmpty } from '@douyinfe/semi-icons-lab';
import {
  Empty as ShaEmpty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@repo/ui/components/empty';
const Empty = ({
  renderContent,
  description = '暂无数据',
}: {
  renderContent: React.ReactNode;
  description?: string;
}) => {
  return (
    <ShaEmpty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconEmpty size="extra-large" />
        </EmptyMedia>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{renderContent}</EmptyContent>
    </ShaEmpty>
  );
};

export default Empty;

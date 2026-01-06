import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@repo/ui/components/accordion';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@repo/ui/components/input-group';
import { Label } from '@repo/ui/components/label';
import RotateConfig from './RotateConfig';
import FilterConfig from './FilterConfig';
import { ConfigProps } from '../../CmpPanel';
import { createHistoryRecord, PositionProps, SizeProps, useHistoryStore } from '@/store/modules/history';
import { useEffect, useState } from 'react';

const StyleConfig = ({ component, updateComponent }: ConfigProps) => {
  const pushHistory = useHistoryStore((state) => state.push);

  const [positionSize, setPositionSize] = useState({ ...component.style });

  const updateCmpStyle = (key: string, value: number) => {
    updateComponent({
      ...component,
      style: {
        ...component.style,
        [key]: Number(value),
      },
    });
    const handlePushHistory = (key1: 'left' | 'width', key2: 'top' | 'height') => {
      const oldProperty = {
        [key1]: component?.style?.[key1] as number,
        [key2]: component?.style?.[key2] as number,
      };
      const newProperty = {
        [key1]: key === key1 ? value : (component?.style?.[key1] as number),
        [key2]: key === key2 ? value : (component?.style?.[key2] as number),
      };
      if (newProperty[key1] === oldProperty[key1] && newProperty[key2] === oldProperty[key2]) return [];
      return [oldProperty, newProperty];
    };
    if (key === 'width' || key === 'height') {
      const [oldSize, newSize] = handlePushHistory('width', 'height');
      if (!oldSize && !newSize) return
      pushHistory(createHistoryRecord.size(component!, oldSize as unknown as SizeProps, newSize as unknown as SizeProps));
    }
    if (key === 'left' || key === 'top') {
      const [oldPosition, newPosition] = handlePushHistory('left', 'top');
      if (!oldPosition && !newPosition) return
      pushHistory(createHistoryRecord.move(component!, oldPosition as unknown as PositionProps, newPosition as unknown as PositionProps));
    }
  };
  const { style } = component;

  useEffect(() => {
    setPositionSize(component.style!);
  }, [component.style]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 px-2">
        <Label className="shrink-0">尺寸</Label>
        <InputGroup>
          <InputGroupInput
            type="number"
            min={0}
            onChange={(e) => setPositionSize({ ...positionSize, width: e.target.value })}
            onBlur={(e) => updateCmpStyle('width', Number((e.target as HTMLInputElement).value))}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                updateCmpStyle('width', Number((e.target as HTMLInputElement).value));
              }
            }}
            value={positionSize?.width}
            disabled={component.lock || component?.group}
          />
          <InputGroupAddon>
            <span>宽</span>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            type="number"
            min={0}
            onChange={(e) => setPositionSize({ ...positionSize, height: e.target.value })}
            onBlur={(e) => updateCmpStyle('height', Number((e.target as HTMLInputElement).value))}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                updateCmpStyle('height', Number((e.target as HTMLInputElement).value));
              }
            }}
            value={positionSize?.height}
            disabled={component.lock || component?.group}
          />
          <InputGroupAddon>
            <span>高</span>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex gap-2 px-2">
        <Label className="shrink-0">位置</Label>
        <InputGroup>
          <InputGroupInput
            type="number"
            min={0}
            onChange={(e) => setPositionSize({ ...positionSize, top: e.target.value })}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                updateCmpStyle('top', Number((e.target as HTMLInputElement).value));
              }
            }}
            onBlur={(e) => updateCmpStyle('top', Number((e.target as HTMLInputElement).value))}
            value={positionSize?.top}
            disabled={component.lock}
          />
          <InputGroupAddon>
            <span>上</span>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            type="number"
            min={0}
            onChange={(e) => setPositionSize({ ...positionSize, left: e.target.value })}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                updateCmpStyle('left', Number((e.target as HTMLInputElement).value));
              }
            }}
            onBlur={(e) => updateCmpStyle('left', Number((e.target as HTMLInputElement).value))}
            value={positionSize?.left}
            disabled={component.lock}
          />
          <InputGroupAddon>
            <span>左</span>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>滤镜</AccordionTrigger>
          <AccordionContent>
            <FilterConfig />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            <span>其他</span>
          </AccordionTrigger>
          <AccordionContent>
            <RotateConfig style={style} updateCmpStyle={updateCmpStyle} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default StyleConfig;

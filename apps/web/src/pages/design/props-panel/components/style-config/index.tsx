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


const StyleConfig = ({ component, updateComponent }: ConfigProps) => {
  const updateCmpStyle = (key: string, value: number) => {
    updateComponent({
      ...component,
      style: {
        ...component.style,
        [key]: Number(value),
      },
    });
  };
  const { style } = component

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 px-2">
        <Label className="shrink-0">尺寸</Label>
        <InputGroup>
          <InputGroupInput
            type="number"
            min={0}
            defaultValue={component.style?.width}
            onChange={(e) => updateCmpStyle('width', Number((e.target as HTMLInputElement).value))}
            onBlur={(e) => updateCmpStyle('width', Number((e.target as HTMLInputElement).value))}
            value={component.style?.width}
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
            onChange={(e) => updateCmpStyle('height', Number((e.target as HTMLInputElement).value))}
            onBlur={(e) => updateCmpStyle('height', Number((e.target as HTMLInputElement).value))}
            value={component.style?.height}
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
            onChange={(e) => updateCmpStyle('top', Number((e.target as HTMLInputElement).value))}
            onBlur={(e) => updateCmpStyle('top', Number((e.target as HTMLInputElement).value))}
            value={component.style?.top}
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
            onChange={(e) => updateCmpStyle('left', Number((e.target as HTMLInputElement).value))}
            onBlur={(e) => updateCmpStyle('left', Number((e.target as HTMLInputElement).value))}
            value={component.style?.left}
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
            <RotateConfig style={style} updateCmpStyle={updateCmpStyle}/>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default StyleConfig;

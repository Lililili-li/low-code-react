import { Label } from '@repo/ui/components/label';
import { Switch } from '@repo/ui/components/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion';
import { ConfigProps } from '../../CmpPanel';
import { animationList } from './config';
import Select from '@/components/Select';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@repo/ui/components/input-group';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface AnimateBoxProps {
  className: string;
  label: string;
  key: string;
  currentAnimate: string;
  setCurrentAnimate: (animate: string) => void;
  hoverClass: string;
  setHoverClass: (animate: string) => void;
}

const AnimateBox = ({
  className,
  label,
  currentAnimate,
  setCurrentAnimate,
  hoverClass,
  setHoverClass,
}: AnimateBoxProps) => {
  return (
    <div
      className={`border rounded-xl py-[10px] cursor-pointer flex items-center justify-center text-[13px] ${hoverClass === className ? `animate__animated animate__${className}` : ''} ${currentAnimate === className ? 'border-blue-500' : ''}`}
      onMouseEnter={() => setHoverClass(className)}
      onClick={() => {
        setCurrentAnimate(className);
      }}
    >
      {label}
    </div>
  );
};

const AnimateConfig = ({ component, updateComponent }: ConfigProps) => {
  const [hoverClass, setHoverClass] = useState('');

  const updateComponentAnimation = (name: string) => {
    updateComponent({
      ...component,
      animation: { ...component.animation, name },
    });
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
        <div className="shrink-0 w-[25%]">
          <Label>动画名称</Label>
        </div>
        <div className="flex-1 items-center flex">
          <InputGroup>
            <InputGroupInput
              placeholder="请输入动画名称"
              value={component.animation?.name}
              onChange={(e) => {
                updateComponent({
                  ...component,
                  animation: { ...component.animation, name: e.target.value },
                });
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
        <div className="shrink-0 w-[25%]">
          <Label>启用动画</Label>
        </div>
        <div className="flex-1 items-center flex">
          <Switch
            checked={component.animation?.enable}
            onCheckedChange={(value) =>
              updateComponent({
                ...component,
                animation: { ...component.animation, enable: value },
              })
            }
          />
        </div>
      </div>
      <div className="item flex justify-between gap-2 items-center px-2 h-[32px]">
        <div className="shrink-0 w-[25%]">
          <Label>循环动画</Label>
        </div>
        <div className="flex-1 items-center flex">
          <Switch
            checked={component.animation?.iterationCount === -1}
            onCheckedChange={(value) =>
              updateComponent({
                ...component,
                animation: {
                  ...component.animation,
                  iterationCount: value ? -1 : 1,
                },
              })
            }
          />
        </div>
      </div>
      <div className="item flex justify-between gap-2 items-center px-2">
        <div className="shrink-0 w-[25%]">
          <Label>播放速度</Label>
        </div>
        <div className="flex-1 items-center flex">
          <Select
            value={component.animation?.speed || 'linear'}
            onChange={(value) =>
              updateComponent({
                ...component,
                animation: { ...component.animation, speed: value as any },
              })
            }
            options={[
              { label: '匀速', value: 'linear' },
              { label: '缓慢', value: 'ease' },
              { label: '缓入', value: 'ease-in' },
              { label: '缓出', value: 'ease-out' },
              { label: '缓入缓出', value: 'ease-in-out' },
            ]}
            placeholder="选择播放速度"
            className="w-full"
          />
        </div>
      </div>
      <div className="item flex justify-between gap-2 items-center px-2">
        <div className="shrink-0 w-[25%]">
          <Label>动画时长</Label>
        </div>
        <div className="flex-1 items-center flex">
          <InputGroup>
            <InputGroupInput
              placeholder="请输入动画时长"
              type="number"
              value={component.animation?.duration}
              onChange={(e) => {
                const value = Number(e.target.value);
                updateComponent({
                  ...component,
                  animation: { ...component.animation, duration: value },
                });
              }}
            />
            <InputGroupText className="pr-2">秒</InputGroupText>
          </InputGroup>
        </div>
      </div>
      <div className="item flex justify-between gap-2 items-center px-2">
        <div className="shrink-0 w-[25%]">
          <Label>延迟动画</Label>
        </div>
        <div className="flex-1 items-center flex">
          <InputGroup>
            <InputGroupInput
              placeholder="请输入延迟动画"
              type="number"
              value={component.animation?.delay}
              onChange={(e) => {
                const value = Number(e.target.value);
                updateComponent({
                  ...component,
                  animation: { ...component.animation, delay: value },
                });
              }}
            />
            <InputGroupText className="pr-2">秒</InputGroupText>
          </InputGroup>
        </div>
      </div>
      <Accordion type="multiple" defaultValue={['1']}>
        <AccordionItem value="1">
          <AccordionTrigger>强调动画</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <div className="grid grid-cols-3 gap-3 mt-2">
              {animationList[0].children.map((item) => (
                <AnimateBox
                  key={item.value}
                  className={item.value}
                  label={item.label}
                  currentAnimate={component.animation?.name || ''}
                  setCurrentAnimate={updateComponentAnimation}
                  hoverClass={hoverClass}
                  setHoverClass={setHoverClass}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>移入动画</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <div className="grid grid-cols-3 gap-3 mt-2">
              {animationList[1].children.map((item) => (
                <AnimateBox
                  key={item.value}
                  className={item.value}
                  label={item.label}
                  currentAnimate={component.animation?.name || ''}
                  setCurrentAnimate={updateComponentAnimation}
                  hoverClass={hoverClass}
                  setHoverClass={setHoverClass}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        {/* <AccordionItem value="item-3">
          <AccordionTrigger>Return Policy</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              We stand behind our products with a comprehensive 30-day return policy. If you&apos;re
              not completely satisfied, simply return the item in its original condition.
            </p>
            <p>
              Our hassle-free return process includes free return shipping and full refunds
              processed within 48 hours of receiving the returned item.
            </p>
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>
    </div>
  );
};

export default AnimateConfig;

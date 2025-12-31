import { ComponentSchema } from '@repo/core/types';
import { Label } from '@repo/ui/components/label';
import { Separator } from '@repo/ui/components/separator';
import { Slider } from '@repo/ui/components/slider';

const RotateConfig = ({
  style,
  updateCmpStyle,
}: {
  style: ComponentSchema['style'];
  updateCmpStyle: (key: string, value: number) => void;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Label className="font-bold">旋转°</Label>
      <div className="flex gap-2 w-full flex-wrap">
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Label>X轴</Label>
          <Slider
            className="flex-1"
            max={360}
            value={[style?.rotateX!]}
            onValueChange={(value) => updateCmpStyle('rotateX', value[0])}
          />
          <span>{style?.rotateX!}°</span>
        </div>
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Label>Y轴</Label>
          <Slider className="flex-1" max={360} value={[style?.rotateY!]} onValueChange={(value) => updateCmpStyle('rotateY', value[0])} />
          <span>{style?.rotateY!}°</span>
        </div>
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Label>Z轴</Label>
          <Slider className="flex-1" max={360} value={[style?.rotateZ!]} onValueChange={(value) => updateCmpStyle('rotateZ', value[0])} />
          <span>{style?.rotateZ!}°</span>
        </div>
      </div>
      <Separator />
      <Label className="font-bold">倾斜°</Label>
      <div className="flex gap-2 w-full flex-wrap">
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Label>X轴</Label>
          <Slider className="flex-1" max={180} min={-180} value={[style?.skewX!]} onValueChange={(value) => updateCmpStyle('skewX', value[0])} />
          <span>{style?.skewX!}°</span>
        </div>
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Label>Y轴</Label>
          <Slider className="flex-1" max={180} min={-180} value={[style?.skewY!]} onValueChange={(value) => updateCmpStyle('skewY', value[0])} />
          <span>{style?.skewY!}°</span>
        </div>
      </div>
      <Separator />
      <Label className="font-bold">缩放</Label>
      <div className="flex gap-2 w-full flex-wrap">
        <div className="flex items-center gap-4 w-[48%] shrink-0">
          <Slider className="flex-1" max={10} min={0.1} step={0.1} value={[style?.scale!]} onValueChange={(value) => updateCmpStyle('scale', value[0])} />
          <span>{style?.scale!}</span>
        </div>
      </div>
    </div>
  );
};

export default RotateConfig;

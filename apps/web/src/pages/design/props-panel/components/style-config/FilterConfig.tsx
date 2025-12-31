import { Slider } from '@repo/ui/components/slider';
import { Switch } from '@repo/ui/components/switch';
import { useState } from 'react';

const FilterConfig = () => {
  const [filter, setFilter] = useState({
    contrast: 0,
    saturation: 0,
    brightness: 0,
    opacity: 0,
  });
  return (
    <div className={`filter-options flex flex-col gap-3 text-sm font-medium`}>
      <div className="flex items-center gap-8">
        <span className="w-[60px]">启用</span>
        <div className="flex items-center gap-4 flex-1">
          <Switch />
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="w-[60px]">对比度</span>
        <div className="flex items-center gap-4 flex-1">
          <Slider
            className="flex-1"
            value={[filter?.contrast || 0]}
            onValueChange={(value) => setFilter({ ...filter, contrast: value[0] })}
          />
          <span>{filter?.contrast}</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="w-[60px]">饱和度</span>
        <div className="flex items-center gap-4 flex-1">
          <Slider
            className="flex-1"
            value={[filter?.saturation || 0]}
            onValueChange={(value) => setFilter({ ...filter, saturation: value[0] })}
          />
          <span>{filter?.saturation}</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="w-[60px]">亮度</span>
        <div className="flex items-center gap-4 flex-1">
          <Slider
            className="flex-1"
            value={[filter?.brightness || 0]}
            onValueChange={(value) => setFilter({ ...filter, brightness: value[0] })}
          />
          <span>{filter?.brightness}</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="w-[60px]">透明度</span>
        <div className="flex items-center gap-4 flex-1">
          <Slider
            className="flex-1"
            value={[filter?.opacity || 0]}
            onValueChange={(value) => setFilter({ ...filter, opacity: value[0] })}
          />
          <span>{filter?.opacity}</span>
        </div>
      </div>
    </div>
  );
};

export default FilterConfig;

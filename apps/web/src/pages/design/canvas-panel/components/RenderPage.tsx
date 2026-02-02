import { PageSchema } from '@repo/core/types';
import RenderCmp from './RenderCmp';
import HelperLine from './HelperLine';

interface RenderPageProps {
  zoom: number;
  left: number;
  top: number;
  width: number;
  height: number;
  background: {
    useType: string;
    color: string;
    image: string;
  };
  filter: PageSchema['filter'];
}

const RenderPage = ({ zoom, left, top, width, height, background, filter }: RenderPageProps) => {
  const getFilterStyle = (filter?: PageSchema['filter']) => {
    if (!filter?.open) return {};
    return {
      filter: `contrast(${filter.contrast}%) brightness(${filter.brightness}%) saturate(${filter.saturation}%) opacity(${filter.opacity}%) hue-rotate(${filter.hueRotate}deg) blur(${filter.blur}px) grayscale(${filter.grayscale}%) invert(${filter.invert}%)`,
    };
  };
  return (
    <div className="filter-wrap" style={{ ...getFilterStyle(filter) }}>
      <div
        className="canvas-content"
        id="canvas-content"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left,
          top,
          width,
          height,
          ...(background.useType === '1'
            ? {
                backgroundImage: `url(${background.image})`,
                backgroundSize: '100% 100%',
              }
            : { backgroundColor: background.color }),
        }}
      >
        <RenderCmp />
        <HelperLine />
      </div>
    </div>
  );
};

export default RenderPage;

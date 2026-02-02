import { useDesignStateStore, useDesignStore } from '@/store';
import { useDesignComponentsStore } from '@/store/design/components';
import { useDesignDatasourceStore } from '@/store/design/datasource';
import { useRequest } from 'ahooks';
import pageApi, { PageProps } from '@/api/page';
import { useParams } from 'react-router';
import { PageSchema } from '@repo/core/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  usePreviewFitScale,
  usePreviewFullScale,
  usePreviewScrollXScale,
  usePreviewScrollYScale,
} from '@/composable/use-preview-scale';
import { useEffect, useRef, useState } from 'react';
import RenderCmp from '../design/canvas-panel/components/RenderCmp';

const Preview = () => {
  const pageSchema = useDesignStore((state) => state.pageSchema);
  const setPageSchema = useDesignStore((state) => state.setPageSchema);
  const components = useDesignComponentsStore((state) => state.components);
  const state = useDesignStateStore((state) => state.state);
  const datasource = useDesignDatasourceStore((state) => state.datasource);

  const queryParams = useParams();

  const { loading } = useRequest(() => pageApi.getPageById(queryParams.id!), {
    onSuccess: (data: PageProps & { schema: PageSchema }) => {
      if (data) {
        setPageSchema({
          ...pageSchema,
          ...data.schema,
        });
      }
    },
    refreshDeps: [queryParams.id],
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const getZoom = () => {
    if (pageSchema.adapterType === '1') {
      return usePreviewFitScale(pageSchema.width, pageSchema.height, previewContainerRef.current);
    } else if (pageSchema.adapterType === '3') {
      return usePreviewScrollYScale(
        pageSchema.width,
        pageSchema.height,
        previewContainerRef.current,
        (scale) => {
          setPageScale(scale);
        },
      );
    } else if (pageSchema.adapterType === '4') {
      return usePreviewScrollXScale(
        pageSchema.width,
        pageSchema.height,
        previewContainerRef.current,
        (scale) => {
          setPageScale(scale);
        },
      );
    } else if (pageSchema.adapterType === '2') {
      return usePreviewFullScale(pageSchema.width, pageSchema.height, previewContainerRef.current);
    }
    setPageScale({ width: 1, height: 1 });
    previewContainerRef.current!.style.transform = 'scale(1)';
    return {
      calcRate: () => {},
      windowResize: () => {},
      unWindowResize: () => {},
      scale: { width: 1, height: 1 },
    };
  };
  const getFilterStyle = (filter?: PageSchema['filter']) => {
    if (!filter?.open) return {};
    return {
      filter: `contrast(${filter.contrast}%) brightness(${filter.brightness}%) saturate(${filter.saturation}%) opacity(${filter.opacity}%) hue-rotate(${filter.hueRotate}deg) blur(${filter.blur}px) grayscale(${filter.grayscale}%) invert(${filter.invert}%)`,
    };
  };

  const transformOrigin = {
    '1': 'origin-center',
    '2': 'origin-center',
    '3': 'origin-top-left',
    '4': 'origin-top-left',
    '5': 'origin-center',
  };

  const [pageScale, setPageScale] = useState({
    width: 1,
    height: 1,
  });
  useEffect(() => {
    const { calcRate, windowResize, unWindowResize } = getZoom();
    calcRate();
    windowResize();
    return () => {
      unWindowResize();
    };
  }, [pageSchema, previewContainerRef.current]);

  const showScroll = pageSchema.adapterType === '3' || pageSchema.adapterType === '4';

  return (
    <div
      className={`bg-[#18181b] h-dvh w-dvw ${showScroll ? 'overflow-x-hidden overflow-y-auto' : `${pageSchema.adapterType !== '5' ? 'overflow-hidden flex justify-center items-center' : ''} `} relative `}
    >
      {!showScroll && (
        <div
          className={`preview-container ${transformOrigin[pageSchema.adapterType as keyof typeof transformOrigin]}`}
          ref={previewContainerRef}
        >
          <div className="filter-wrap" style={{ ...getFilterStyle() }}>
            <div
              className="canvas-content"
              id="canvas-content"
              style={{
                position: 'relative',
                width: pageSchema.width,
                height: pageSchema.height,
                ...(pageSchema.background.useType === '1'
                  ? {
                      backgroundImage: `url(${pageSchema.background.image})`,
                      backgroundSize: '100% 100%',
                    }
                  : { backgroundColor: pageSchema.background.color }),
              }}
            >
              <RenderCmp />
            </div>
          </div>
        </div>
      )}
      {showScroll && (
        <div
          className="wrapper"
          style={{
            width:
              pageSchema.adapterType === '3'
                ? window.innerWidth
                : pageSchema.width * pageScale.width,
            height:
              pageSchema.adapterType === '3'
                ? pageSchema.height * pageScale.height
                : window.innerHeight,
          }}
        >
          <div
            className={`preview-container ${transformOrigin[pageSchema.adapterType as keyof typeof transformOrigin]}`}
            ref={previewContainerRef}
          >
            <div className="filter-wrap" style={{ ...getFilterStyle() }}>
              <div
                className="canvas-content"
                id="canvas-content"
                style={{
                  position: 'relative',
                  width: pageSchema.width,
                  height: pageSchema.height,
                  ...(pageSchema.background.useType === '1'
                    ? {
                        backgroundImage: `url(${pageSchema.background.image})`,
                        backgroundSize: '100% 100%',
                      }
                    : { backgroundColor: pageSchema.background.color }),
                }}
              >
                <RenderCmp />
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default Preview;

import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import CanvasDom from './components/CanvasDom';
import Toolbar from './components/Toolbar';
import { useDesignStore } from '@/store/modules/design';
import ShadowView from 'react-shadow';
import shadowStyles from './assets/ShadowDom.less?inline';
import { useTheme } from '@/composable/use-theme';
import Ruler from '@scena/react-ruler';
import { useShallow } from 'zustand/react/shallow';

const RULER_SIZE = 20;

const CONTAINER_SIZE = {
  width: 4000,
  height: 4000,
};

const CanvasPanel = () => {
  const pageSchemaSubset = useDesignStore(
    useShallow((state) => ({
      width: state.pageSchema.width,
      height: state.pageSchema.height,
      background: state.pageSchema.background,
    })),
  );
  const setCanvasPanel = useDesignStore((state) => state.setCanvasPanel);
  const config = useDesignStore((state) => state.config);
  const { theme } = useTheme();

  const verticalRulerRef = useRef<Ruler>(null);
  const horizontalRulerRef = useRef<Ruler>(null);

  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const handleResize = useCallback(() => {
    verticalRulerRef.current?.resize();
    horizontalRulerRef.current?.resize();
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollX(target.scrollLeft);
    setScrollY(target.scrollTop);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.01 : 0.01;
        const prevZoom = config.canvasPanel.zoom;
        setCanvasPanel({ zoom: Math.min(Math.max((prevZoom ?? 1) + delta, 0.1), 2) });
      }
    },
    [config.canvasPanel.zoom],
  );

  // 实际使用的缩放值（未初始化时使用1）
  const effectiveZoom = config.canvasPanel.zoom ?? 1;

  // 画布在容器中的偏移量（考虑缩放后的画布尺寸）
  const CANVAS_OFFSET = useMemo(() => {
    const scaledWidth = pageSchemaSubset.width * effectiveZoom;
    const scaledHeight = pageSchemaSubset.height * effectiveZoom;
    return {
      x: (CONTAINER_SIZE.width - scaledWidth) / 2,
      y: (CONTAINER_SIZE.height - scaledHeight) / 2,
    };
  }, [effectiveZoom]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const computedUnit = useMemo(() => {
    if (effectiveZoom > 1.5) return 25;
    else if (effectiveZoom > 0.75 && effectiveZoom <= 1.5) return 50;
    else if (effectiveZoom > 0.4 && effectiveZoom <= 0.75) return 100;
    else if (effectiveZoom > 0.2 && effectiveZoom <= 0.4) return 200;
    else return 400;
  }, [effectiveZoom]);

  const autoCenter = useCallback(() => {
    if (!canvasRef.current) return;
    const { width } = canvasRef.current.getBoundingClientRect();
    const scale = (width - 40) / pageSchemaSubset.width;
    setCanvasPanel({ zoom: Number(Number(scale)) });
  }, [canvasRef.current]);

  useEffect(() => {
    autoCenter();
  }, [autoCenter]);

  // 计算使画布居中所需的滚动位置
  const getCenterScrollPosition = useCallback(() => {
    if (!canvasRef.current) return { scrollLeft: 0, scrollTop: 0 };
    const container = canvasRef.current;
    const scaledWidth = pageSchemaSubset.width * effectiveZoom;
    const scaledHeight = pageSchemaSubset.height * effectiveZoom;

    // 画布中心在容器中的位置
    const canvasCenterX = CANVAS_OFFSET.x + scaledWidth / 2;
    const canvasCenterY = CANVAS_OFFSET.y + scaledHeight / 2;

    // 滚动到使画布居中的位置
    const scrollLeft = canvasCenterX - container.clientWidth / 2;
    const scrollTop = canvasCenterY - container.clientHeight / 2;

    return { scrollLeft, scrollTop };
  }, [CANVAS_OFFSET]);

  useEffect(() => {
    // 延迟调用 resize，确保 Shadow DOM 完全渲染
    const timer = setTimeout(() => {
      handleResize();
      // 滚动到中心位置
      if (canvasRef.current) {
        const { scrollLeft, scrollTop } = getCenterScrollPosition();
        canvasRef.current.scrollLeft = scrollLeft;
        canvasRef.current.scrollTop = scrollTop;
      }
    }, 100);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize, getCenterScrollPosition]);

  return (
    <div className="canvas-panel w-full flex flex-col h-[calc(100vh-50px)]">
      <div className="canvas-container h-[calc(100%-50px)]">
        <ShadowView.div className={`ruler-container h-full`}>
          <style>{shadowStyles}</style>
          <div className={`${theme === 'dark' ? 'dark ruler-wrapper' : 'ruler-wrapper'} `}>
            <div className="ruler-top-row" style={{ height: RULER_SIZE }}>
              <div
                className="ruler-corner"
                style={{
                  width: RULER_SIZE,
                  height: RULER_SIZE,
                  backgroundColor: theme === 'dark' ? '#333' : '#fff',
                }}
              />
              <div className="ruler-horizontal-wrapper">
                <Ruler
                  ref={horizontalRulerRef}
                  type="horizontal"
                  zoom={effectiveZoom}
                  scrollPos={(scrollX - CANVAS_OFFSET.x) / effectiveZoom}
                  backgroundColor={theme === 'dark' ? '#1e1e1e' : '#fff'}
                  lineColor={theme === 'dark' ? '#555' : '#333'}
                  textColor={theme === 'dark' ? '#999' : '#333'}
                  textFormat={(scale) => `${scale}`}
                  textOffset={[0, 7]}
                  unit={computedUnit}
                />
              </div>
            </div>

            <div className="ruler-content-row">
              <div className="ruler-vertical-wrapper" style={{ width: RULER_SIZE }}>
                <Ruler
                  ref={verticalRulerRef}
                  type="vertical"
                  zoom={effectiveZoom}
                  scrollPos={(scrollY - CANVAS_OFFSET.y) / effectiveZoom}
                  backgroundColor={theme === 'dark' ? '#1e1e1e' : '#fff'}
                  lineColor={theme === 'dark' ? '#555' : '#333'}
                  textColor={theme === 'dark' ? '#999' : '#333'}
                  textFormat={(scale) => `${scale}`}
                  textOffset={[7, 0]}
                  unit={computedUnit}
                />
              </div>

              {/* 画布区域 */}
              <CanvasDom
                canvasRef={canvasRef}
                effectiveZoom={effectiveZoom}
                CANVAS_OFFSET={CANVAS_OFFSET}
                onScroll={handleScroll}
                onWheel={handleWheel}
              />
            </div>
          </div>
        </ShadowView.div>
      </div>
      <div className="toolbar-container shrink-0 border-t h-[50px] flex items-center px-4 dark:bg-[#18181c] bg-white">
        <Toolbar />
      </div>
    </div>
  );
};

export default CanvasPanel;

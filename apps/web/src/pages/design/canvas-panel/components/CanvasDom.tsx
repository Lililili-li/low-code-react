import ShadowView from 'react-shadow';
import Ruler from '@scena/react-ruler';
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import hotkeys from 'hotkeys-js';
import shadowStyles from './ShadowDom.css?inline';
import { PageSchema } from '@repo/core/types';
import { DesignState } from '@/store/modules/design';
import { useTheme } from '@/composable/use-theme';
import CmpHotKeysService from '@repo/core/hot-keys';
import { useMouseDrag } from '@/composable/use-mouse';

const RULER_SIZE = 20;

const CONTAINER_SIZE = {
  width: 4000,
  height: 4000,
};

const cmpHotKeysService = new CmpHotKeysService();

// 画布在容器中的起始偏移（居中）

const CanvasDom = ({
  children,
  onDrop,
  pageSchema,
  setCanvasPanel,
  config,
}: {
  children: React.ReactNode;
  onDrop?: (e: React.DragEvent) => void;
  pageSchema: PageSchema;
  setPageSchema: (pageSchema: PageSchema) => void;
  setCanvasPanel: (canvasPanel: { zoom: number; lockZoom?: boolean }) => void;
  config: DesignState['config'];
}) => {

  

  const { isDragging, delta, handleMouseDown } = useMouseDrag({
    onDragStart: (e) => {
      console.log('开始拖拽');
    },
    onDragMove: (e, delta) => {
      console.log('移动中', delta.deltaX, delta.deltaY);
    },
    onDragEnd: (e, delta) => {
      console.log('拖拽结束，总距离:', delta.distance);
    },
  });
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
        console.log(prevZoom);
        setCanvasPanel({ zoom: Math.min(Math.max((prevZoom ?? 1) + delta, 0.1), 2) });
      }
    },
    [config.canvasPanel.zoom],
  );

  // 实际使用的缩放值（未初始化时使用1）
  const effectiveZoom = config.canvasPanel.zoom ?? 1;

  // 画布在容器中的偏移量（考虑缩放后的画布尺寸）
  const CANVAS_OFFSET = useMemo(() => {
    const scaledWidth = pageSchema.width * effectiveZoom;
    const scaledHeight = pageSchema.height * effectiveZoom;
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
    const scale = (width - 40) / pageSchema.width;
    setCanvasPanel({ zoom: Number(Number(scale)) });
  }, [canvasRef.current]);

  useEffect(() => {
    autoCenter();
  }, [autoCenter]);

  // 计算使画布居中所需的滚动位置
  const getCenterScrollPosition = useCallback(() => {
    if (!canvasRef.current) return { scrollLeft: 0, scrollTop: 0 };
    const container = canvasRef.current;
    const scaledWidth = pageSchema.width * effectiveZoom;
    const scaledHeight = pageSchema.height * effectiveZoom;

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

  // 画布聚焦/失焦时切换 hotkeys 作用域
  const handleFocus = useCallback(() => {
    hotkeys.setScope('canvas');
  }, []);

  const handleBlur = useCallback(() => {
    hotkeys.setScope('all');
  }, []);

  // 注册画布快捷键
  useEffect(() => {
    const cmpHotKeysMap = cmpHotKeysService.getHotKeysMap();
    cmpHotKeysMap.forEach((item) => {
      hotkeys(item.key, 'canvas', (e) => {
        e.preventDefault();
        item.action();
      });
    });
    // 移动画布
    hotkeys('space', 'canvas', (e) => {
      e.preventDefault();
      console.log('移动');
    });

    return () => {
      cmpHotKeysMap.forEach((item) => {
        hotkeys.unbind(item.key, 'canvas');
      });
    };
  }, []);

  return (
    <ShadowView.div className={`ruler-container h-full`}>
      <style>{shadowStyles}</style>
      <div className={`${theme === 'dark' ? 'dark ruler-wrapper' : 'ruler-wrapper'} `}>
        {/* 顶部区域：角落 + 水平标尺 */}
        <div className="ruler-top-row" style={{ height: RULER_SIZE }}>
          {/* 左上角 */}
          <div
            className="ruler-corner"
            style={{
              width: RULER_SIZE,
              height: RULER_SIZE,
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
            }}
          />
          {/* 水平标尺 */}
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

        {/* 下方区域：垂直标尺 + 画布 */}
        <div className="ruler-content-row">
          {/* 垂直标尺 */}
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
          <div
            ref={canvasRef}
            className="canvas-area"
            onWheel={handleWheel}
            onScroll={handleScroll}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            tabIndex={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseDown={handleMouseDown}
          >
            <div
              className="canvas-scroll-container"
              style={{ width: CONTAINER_SIZE.width, height: CONTAINER_SIZE.height }}
            >
              <div
                className="canvas-content"
                style={{
                  transform: `scale(${effectiveZoom})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  left: CANVAS_OFFSET.x,
                  top: CANVAS_OFFSET.y,
                  width: pageSchema.width,
                  height: pageSchema.height,
                  ...(pageSchema.background.useType === '1'
                    ? { backgroundImage: `url(${pageSchema.background.image})` }
                    : { backgroundColor: pageSchema.background.color }),
                }}
              >
                {isDragging && <p>移动距离: {delta.distance.toFixed(2)}px</p>}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShadowView.div>
  );
};

export default CanvasDom;

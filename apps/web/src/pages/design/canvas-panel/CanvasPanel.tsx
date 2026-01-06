import React, { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import CanvasDom from './components/CanvasDom';
import Toolbar from './components/Toolbar';
import { useDesignStore } from '@/store/modules/design';
import ShadowView from 'react-shadow';
import AnimationCss from 'animate.css?inline'
import ReactContexifyCss from 'react-contexify/ReactContexify.css?inline';
import shadowStyles from './assets/ShadowDom.less?inline';
import { useTheme } from '@/composable/use-theme';
import Ruler from '@scena/react-ruler';
import { useShallow } from 'zustand/react/shallow';
import { eventBus } from '@repo/shared/index';


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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLDivElement;
    setScrollX(target.scrollLeft);
    setScrollY(target.scrollTop);
  }, []);

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
  const isInitialMountRef = useRef(true);

  const computedUnit = useMemo(() => {
    if (effectiveZoom > 1.5) return 25;
    else if (effectiveZoom > 0.75 && effectiveZoom <= 1.5) return 50;
    else if (effectiveZoom > 0.4 && effectiveZoom <= 0.75) return 100;
    else if (effectiveZoom > 0.2 && effectiveZoom <= 0.4) return 200;
    else return 400;
  }, [effectiveZoom]);

  // 使用 callback ref 监听 DOM 挂载
  const setCanvasRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // 保存到 ref 中供其他地方使用
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;

        // 只在初始挂载时计算 zoom
        if (isInitialMountRef.current) {
          const { width } = node.getBoundingClientRect();
          const scale = (width - 40) / pageSchemaSubset.width;
          setCanvasPanel({ zoom: Number(scale) });
          isInitialMountRef.current = false;
        }
      }
    },
    [pageSchemaSubset.width, setCanvasPanel],
  );

  // 初始挂载后自动居中
  useEffect(() => {
    if (isInitialMountRef.current || !canvasRef.current) return;

    const timer = setTimeout(() => {
      if (!canvasRef.current) return;
      const currentZoom = config.canvasPanel.zoom ?? 1;
      const scaledWidth = pageSchemaSubset.width * currentZoom;
      const scaledHeight = pageSchemaSubset.height * currentZoom;
      // 重新计算 CANVAS_OFFSET
      const offsetX = (CONTAINER_SIZE.width - scaledWidth) / 2;
      const offsetY = (CONTAINER_SIZE.height - scaledHeight) / 2;
      const canvasCenterX = offsetX + scaledWidth / 2;
      const canvasCenterY = offsetY + scaledHeight / 2;
      const scrollLeft = canvasCenterX - canvasRef.current.clientWidth / 2;
      const scrollTop = canvasCenterY - canvasRef.current.clientHeight / 2;
      canvasRef.current.scrollLeft = scrollLeft;
      canvasRef.current.scrollTop = scrollTop;
    }, 100);

    return () => clearTimeout(timer);
  }, [effectiveZoom, pageSchemaSubset.width, pageSchemaSubset.height, config.canvasPanel.zoom]);

  const autoCenter = () => {
    if (canvasRef.current) {
      const { width } = canvasRef.current.getBoundingClientRect();
      const scale = (width - 40) / pageSchemaSubset.width;
      setCanvasPanel({ zoom: Number(scale) });
    }
    verticalRulerRef.current?.resize();
    horizontalRulerRef.current?.resize();
  };

  // 独立管理滚轮事件监听器
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        if (config.canvasPanel.lockZoom) return
        const delta = e.deltaY > 0 ? -0.01 : 0.01;
        const prevZoom = config.canvasPanel.zoom;
        setCanvasPanel({ zoom: Math.min(Math.max((prevZoom ?? 1) + delta, 0.1), 2) });
      }
    };

    canvasElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasElement.removeEventListener('wheel', handleWheel);
    };
  }, [config.canvasPanel, setCanvasPanel]);

  // 窗口 resize 时重新计算
  const handleResize = useCallback(() => autoCenter(), [pageSchemaSubset.width, setCanvasPanel]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    eventBus.on('handleResize', () => autoCenter());
    return () => eventBus.off('handleResize');
  }, []);

  return (
    <div className="canvas-panel w-full flex flex-col h-[calc(100vh-50px)]">
      <div className="canvas-container h-[calc(100%-50px)]">
        <ShadowView.div className={`ruler-container h-full`} id="shadow-host">
          <style>{AnimationCss}</style>
          <style>{shadowStyles}</style>
          <style>{ReactContexifyCss}</style>
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
                canvasRef={setCanvasRef}
                effectiveZoom={effectiveZoom}
                CANVAS_OFFSET={CANVAS_OFFSET}
                onScroll={handleScroll}
                setScrollX={setScrollX}
                setScrollY={setScrollY}
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

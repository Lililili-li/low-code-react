import { useDesignStore } from "@/store/modules/design";
import { useCanvasEvent } from "./use-canvas-event";
import { useEffect, useState, useRef } from "react";
import CmpHotKeysService from "@repo/core/hot-keys";
import hotkeys from 'hotkeys-js';
import { ComponentSchema } from '@repo/core/types';

const cmpHotKeysService = new CmpHotKeysService()

export function useCanvasHotKeys() {
  const currentCmpId = useDesignStore((state) => state.currentCmpId);
  const zoom = useDesignStore((state) => state.config.canvasPanel.zoom);
  const selectedCmpIds = useDesignStore((state) => state.selectedCmpIds);
  const pageComponents = useDesignStore((state) => state.pageSchema.components);
  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);

  const {
    deleteComponent,
    copyComponent,
    cutComponent,
    pasteComponent,
    visibleComponent,
    lockComponent,
    splitComponent,
    combinationComponent,
    moveComponent
  } = useCanvasEvent(updateCurrentCmp);

  const [spacePressed, setSpacePressed] = useState(false);

  const contextRef = useRef({
    currentCmp: undefined as ComponentSchema | undefined,
    zoom: 1,
    selectedCmpIds: [] as string[],
    pageComponents: [] as ComponentSchema[],
  });

  // 同步最新值到 ref（这个 useEffect 可以频繁执行，不影响快捷键注册）
  useEffect(() => {
    contextRef.current = {
      currentCmp: pageComponents.find((item) => item.id === currentCmpId),
      zoom,
      selectedCmpIds,
      pageComponents,
    };
  }, [currentCmpId, zoom, selectedCmpIds, pageComponents]);

  // 快捷键注册只执行一次（空依赖数组）
  useEffect(() => {
    const handlers = {
      copy: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) copyComponent(currentCmp);
      },
      cut: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) cutComponent(currentCmp);
      },
      paste: () => {
        const { zoom } = contextRef.current;
        pasteComponent(zoom);
      },
      visible: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) visibleComponent(currentCmp);
      },
      lock: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) lockComponent(currentCmp);
      },
      delete: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) deleteComponent(currentCmp);
      },
      group: () => {
        const { currentCmp, selectedCmpIds, pageComponents } = contextRef.current;
        if (currentCmp?.group) {
          splitComponent(currentCmp, pageComponents);
        } else {
          combinationComponent(selectedCmpIds, pageComponents);
        }
      },
      moveUp: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) moveComponent('moveUp', currentCmp)
      },
      moveDown: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) moveComponent('moveDown', currentCmp)
      },
      moveLeft: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) moveComponent('moveLeft', currentCmp)
      },
      moveRight: () => {
        const { currentCmp } = contextRef.current;
        if (currentCmp) moveComponent('moveRight', currentCmp)
      }
    };

    const cmpHotKeysMap = cmpHotKeysService.getHotKeysMap();

    cmpHotKeysMap.forEach((item) => {
      const handler = handlers[item.id as keyof typeof handlers];
      if (handler) {
        hotkeys(item.key, 'canvas', (e) => {
          e.preventDefault();
          handler();
        });
      }
    });

    hotkeys('space', { keyup: true, keydown: true, scope: 'canvas' }, (e) => {
      e.preventDefault();
      setSpacePressed(e.type === 'keydown');
    });

    hotkeys('*', { keydown: true, scope: 'canvas' }, (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const id = cmpHotKeysMap.find(item => item.key === e.key)?.id
        const handler = handlers[id as keyof typeof handlers];
        handler()
      }
    });

    return () => {
      cmpHotKeysMap.forEach((item) => {
        hotkeys.unbind(item.key, 'canvas');
      });
      hotkeys.unbind('space', 'canvas');
    };
  }, []); // ✅ 空依赖数组，只注册一次！

  const setScope = (key: string) => {
    hotkeys.setScope(key);
  };

  const clearScope = () => {
    hotkeys.setScope('all');
  };

  return { spacePressed, setScope, clearScope };
}
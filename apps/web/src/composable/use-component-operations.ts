import { ComponentSchema } from '@repo/core/types'
import useClipboard from './use-clipboard'
import { useDesignStore } from '@/store/modules/design'
import { useEffect, useRef } from 'react'
import { isNumber } from '@repo/shared/index'
import { createHistoryRecord, useHistoryStore } from '@/store/modules/history'

let isCopy = false

interface LayerLevelProps {
  type: 'top' | 'bottom' | 'up' | 'down',
  component: ComponentSchema
}

export function useComponentOperations() {

  const { copy } = useClipboard()
  const shadowHost = document.getElementById('shadow-host');

  const mouseState = useRef({
    x: 0,
    y: 0
  })

  const updateCurrentCmp = useDesignStore((state) => state.updateCurrentCmp);
  const selectCmpIds = useDesignStore((state) => state.selectedCmpIds)
  const setSelectedCmpIds = useDesignStore(state => state.setSelectedCmpIds)
  const removeComponent = useDesignStore((state) => state.removeComponent)
  const removeSelectComponents = useDesignStore((state) => state.removeSelectComponents)
  const addComponent = useDesignStore((state) => state.addComponent)
  const addSelectComponent = useDesignStore((state) => state.addSelectComponent)
  const setCurrentCmpId = useDesignStore((state) => state.setCurrentCmpId)
  const zoom = useDesignStore((state) => state.config.canvasPanel.zoom)
  const pageComponents = useDesignStore((state) => state.pageSchema.components)
  const pageSchema = useDesignStore((state) => state.pageSchema)


  const pushHistory = useHistoryStore((state) => state.push)

  // 复制组件
  const copyComponent = (component: ComponentSchema) => {
    const isMultiple = selectCmpIds.length > 1
    if (isMultiple) {
      let components = [] as ComponentSchema[]
      selectCmpIds.forEach((id, index) => {
        const selectCmp = pageComponents.find(item => item.id === id)
        if (!selectCmp) return
        const copyCmp = { ...selectCmp }
        copyCmp.id = (new Date().getTime() + index).toString()
        copyCmp.name = selectCmp.name + '副本-' + (index + 1)
        components.push(copyCmp)
      })
      copy(JSON.stringify(components))
      components = []
    } else {
      if (!component) return
      copy(JSON.stringify(component))
    }
    isCopy = true
  }

  // 剪切组件
  const cutComponent = (component?: ComponentSchema, selectedCmpIdsParams = selectCmpIds, pageComponentsParams = pageComponents) => {
    const isMultiple = selectedCmpIdsParams.length > 1
    if (isMultiple) {
      let components = [] as ComponentSchema[]
      selectedCmpIdsParams.forEach(id => {
        const selectCmp = pageComponentsParams.find(item => item.id === id)
        if (!selectCmp) return
        components.push(selectCmp)
      })
      removeSelectComponents(selectedCmpIdsParams, true)
      copy(JSON.stringify(components))
      setSelectedCmpIds([])
      components = []
    } else {
      if (!component?.id) return
      removeComponent(component?.id, true)
      setCurrentCmpId('')
      copy(JSON.stringify(component))
    }
    isCopy = false
  }

  // 粘贴组件
  const pasteComponent = async (currentZoom?: number) => {
    try {
      const cmpJson = await navigator.clipboard.readText()
      if (!cmpJson) {
        console.log('剪切板为空');
        return
      }
      const canvasContent = shadowHost?.shadowRoot?.querySelector(
        '#canvas-content',
      ) as HTMLElement;

      if (!canvasContent) return;
      const rect = canvasContent.getBoundingClientRect();
      const parsedData = JSON.parse(cmpJson) as ComponentSchema | ComponentSchema[]
      if (Array.isArray(parsedData)) { // 多选时，粘贴到当前选中组件的后面
        const components = parsedData
        pasteMultiple(rect, components, currentZoom)
        setSelectedCmpIds(components.map(item => item.id))
      } else {
        const cmp = parsedData
        paste(rect, cmp, 0, currentZoom)
        setCurrentCmpId(cmp.id)
        setSelectedCmpIds([cmp.id])
      }
    } catch (error) {
      console.error('粘贴组件失败:', error);
    }
  }

  // 粘贴组件方法
  const paste = (rect: DOMRect, component: ComponentSchema, index: number, currentZoom?: number) => {
    const calcZoom = isNumber(currentZoom) ? currentZoom : zoom
    const x = (mouseState.current.x - rect.left - (((component.style?.width as number) || 0) * calcZoom) / 2) / calcZoom;
    const y = (mouseState.current.y - rect.top - (((component.style?.height as number) || 0) * calcZoom) / 2) / calcZoom;
    if (isCopy) {
      component.id = new Date().getTime().toString()
      component.name = component.name + ' (副本)'
    }
    const newComponent = {
      ...component,
      style: { ...component.style, left: index > 0 ? x + index * 10 : x, top: index > 0 ? y + index * 10 : y }
    }
    addComponent(newComponent, true)
  }

  const pasteMultiple = (rect: DOMRect, components: ComponentSchema[], currentZoom?: number) => {
    const calcZoom = isNumber(currentZoom) ? currentZoom : zoom
    const newComponents = components.map((component, idx) => {
      const x = (mouseState.current.x - rect.left - (((component.style?.width as number) || 0) * calcZoom) / 2) / calcZoom;
      const y = (mouseState.current.y - rect.top - (((component.style?.height as number) || 0) * calcZoom) / 2) / calcZoom;

      const newComponent = {
        ...component,
        style: {
          ...component.style,
          left: idx > 0 ? x + idx * 10 : x,
          top: idx > 0 ? y + idx * 10 : y
        }
      }

      if (isCopy) {
        newComponent.id = (new Date().getTime() + idx).toString()
        newComponent.name = component.name + ' (副本)'
      }

      return newComponent
    })

    addSelectComponent(newComponents, true)
  }

  // 删除组件
  const deleteComponent = (component?: ComponentSchema, selectCmpIdsParams: string[] = selectCmpIds) => {
    const isMultiple = selectCmpIdsParams.length > 1
    if (isMultiple) {
      removeSelectComponents(selectCmpIdsParams, true)
      setSelectedCmpIds([])
    } else {
      if (!component?.id) return;
      removeComponent(component?.id, true);
      setCurrentCmpId('');
    }
  }

  // 更新组件层级
  const setLayerLevel = ({ type, component }: LayerLevelProps) => {
    const isMultiple = selectCmpIds.length > 1
    const updateLevel = (component: ComponentSchema) => {
      if (type === 'top') {
        updateCurrentCmp({ ...component!, style: { ...component?.style, zIndex: 99999 } })
      } else if (type === 'bottom') {
        updateCurrentCmp({ ...component!, style: { ...component?.style, zIndex: -99999 } })
      } else if (type === 'up') {
        const currentZIndex = Number(component?.style?.zIndex) || 0;
        updateCurrentCmp({ ...component!, style: { ...component?.style, zIndex: currentZIndex + 1 } })
      } else {
        const currentZIndex = Number(component?.style?.zIndex) || 0;
        updateCurrentCmp({ ...component!, style: { ...component?.style, zIndex: currentZIndex - 1 } })
      }
    }
    if (isMultiple) {
      selectCmpIds.forEach(id => {
        const selectCmp = pageComponents.find(item => item.id === id)
        if (!selectCmp) return
        updateLevel(selectCmp)
      })
    } else {
      if (!component?.id) return;
      updateLevel(component)
    }

  }

  // 锁定组件
  const lockComponent = (currentCmp: ComponentSchema) => {
    const isMultiple = selectCmpIds.length > 1
    if (isMultiple) {
      selectCmpIds.forEach(id => {
        const selectCmp = pageComponents.find(item => item.id === id)
        if (!selectCmp) return
        updateCurrentCmp({ ...selectCmp, lock: !selectCmp?.lock }, true)
      })
    } else {
      updateCurrentCmp({ ...currentCmp, lock: !currentCmp?.lock }, true)
    }
  }

  // 隐藏显示组件
  const visibleComponent = (currentCmp: ComponentSchema) => {
    updateCurrentCmp({ ...currentCmp, visible: !currentCmp.visible }, true)
  }

  // 拆分组件
  const splitComponent = (component: ComponentSchema, _?: any) => {
    if (!component.group) return
    const selectIds: string[] = []
    component.children?.forEach(cmp => {
      const newStyle = { ...cmp.style }
      if (cmp.style?.left === 0) {
        newStyle.left = component.style?.left
      }
      if (cmp.style?.top === 0) {
        newStyle.top = component.style?.top
      }
      if (cmp.style?.left !== component.style?.left || cmp.style?.top !== component.style?.top) {
        newStyle.left = newStyle.left !== 0 ? Number((cmp.style?.left as number) + (component.style?.left as number)) : newStyle.left;
        newStyle.top = newStyle.top !== 0 ? Number((cmp.style?.top as number) + (component.style?.top as number)) : newStyle.top;
      }
      selectIds.push(cmp.id);
      addComponent({ ...cmp, style: newStyle }, true)
    })
    setCurrentCmpId(component.children?.[0]?.id ?? '')
    setSelectedCmpIds(selectIds)
    removeComponent(component.id, true);
  }

  // 组合组件
  const combinationComponent = (selectCmpIdsParams: string[] = selectCmpIds, pageComponentsParams: ComponentSchema[] = pageComponents) => {
    const component = {
      group: true,
      id: new Date().getTime().toString(),
      name: '组合组件_' + Date.now(),
      visible: true,
      lock: false,
      children: [] as ComponentSchema[],
      style: {
        width: 0,
        height: 0,
        left: Infinity,
        top: Infinity,
        scale: 1,
        skewX: 0,
        skewY: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0
      }
    } as ComponentSchema;
    let maxWidth = 0;
    let maxHeight = 0;
    selectCmpIdsParams.forEach(id => {
      const selectCmp = pageComponentsParams.find(item => item.id === id)
      if (!selectCmp) return
      component.style!.top = Math.min((component.style!.top as number), (selectCmp.style?.top as number))
      component.style!.left = Math.min((component.style!.left as number), (selectCmp.style?.left as number))
      const right = (selectCmp.style?.left as number) + (selectCmp.style?.width as number);
      const bottom = (selectCmp.style?.top as number) + (selectCmp.style?.height as number);
      maxWidth = Math.max(maxWidth, right);
      maxHeight = Math.max(maxHeight, bottom);
      component.children?.push(selectCmp); // 将组件添加到分组组件中
      removeComponent(id) // 从画布中删除
    })
    const newChildren = component.children?.map(child => {
      const newStyle = { ...child.style };
      if (child.style?.left === component.style?.left) {
        newStyle.left = 0;
      }
      if (child.style?.top === component.style?.top) {
        newStyle.top = 0;
      }
      if (child.style?.left !== component.style?.left || child.style?.top !== component.style?.top) {
        newStyle.left = newStyle.left !== 0 ? Number((child.style?.left as number) - (component.style?.left as number)) : newStyle.left;
        newStyle.top = newStyle.top !== 0 ? Number((child.style?.top as number) - (component.style?.top as number)) : newStyle.top;
      }
      return { ...child, style: newStyle };
    })
    component.style!.width = maxWidth - (component.style!.left as number);
    component.style!.height = maxHeight - (component.style!.top as number);
    const groupComponent = { ...component, children: newChildren }
    addComponent(groupComponent, true)
    setCurrentCmpId(component.id)
    setSelectedCmpIds([component.id])
  }

  // 更新组件位置 // 水平方向以及垂直方向
  const updatePosition = (dir: 'horizontal' | 'vertical', align: 'start' | 'center' | 'end', component: ComponentSchema) => {
    const isGroup = component?.group;
    const isHorizontal = dir === 'horizontal';
    const prop = isHorizontal ? 'left' : 'top';
    const dimension = isHorizontal ? 'width' : 'height';
    const pageSize = isHorizontal ? pageSchema.width : pageSchema.height;

    const calculatePosition = (align: 'start' | 'center' | 'end'): number => {
      const componentSize = (component.style?.[dimension] as number) || 0;
      switch (align) {
        case 'start':
          return 0;
        case 'center':
          return (pageSize - componentSize) / 2;
        case 'end':
          return pageSize - componentSize;
      }
    };

    const newPosition = calculatePosition(align);
    const distance = (component.style?.[prop] as number) - newPosition;

    if (isGroup) {
      const updatedChildren = component.children?.map(child => ({
        ...child,
        style: {
          ...child.style,
          [prop]: (child.style?.[prop] as number) - distance
        }
      }));
      updateCurrentCmp({
        ...component,
        children: updatedChildren,
        style: { ...component.style, [prop]: newPosition }
      });
    } else {
      updateCurrentCmp({
        ...component,
        style: { ...component.style, [prop]: newPosition }
      });
    }
  };

  // 组件翻转 // 水平方向以及垂直方向
  const transformComponent = (dir: 'horizontal' | 'vertical', component: ComponentSchema) => {
    const isGroup = component?.group;
    const rotateAxis = dir === 'horizontal' ? 'rotateY' : 'rotateX';
    const currentRotation = component.style?.[rotateAxis] || 0;
    const newRotation = currentRotation === 180 ? 0 : 180;

    const updatedStyle = {
      ...component.style,
      [rotateAxis]: newRotation
    };

    if (isGroup) {
      const updatedChildren = component.children?.map(child => ({
        ...child,
        style: {
          ...child.style,
          [rotateAxis]: newRotation
        }
      }));

      updateCurrentCmp({
        ...component,
        children: updatedChildren,
        style: updatedStyle
      });
    } else {
      updateCurrentCmp({
        ...component,
        style: updatedStyle
      });
    }
  };

  // 快捷键移动组件
  const moveComponent = (dir: 'moveUp' | 'moveDown' | 'moveLeft' | 'moveRight', component?: ComponentSchema, selectCmpIds: string[] = [], pageComponents: ComponentSchema[] = []) => {
    const isMultiple = selectCmpIds.length > 1 || false
    const updatePosition = (component: ComponentSchema) => {
      const newPosition = { left: component.style?.left, top: component.style?.top } as { left: number, top: number }
      if (dir === 'moveUp') {
        newPosition.top = (component.style?.top as number) - 1
        updateCurrentCmp({ ...component, style: { ...component.style, top: (component.style?.top as number) - 1 } })
      } else if (dir === 'moveDown') {
        newPosition.top = (component.style?.top as number) + 1
        updateCurrentCmp({ ...component, style: { ...component.style, top: (component.style?.top as number) + 1 } })
      } else if (dir === 'moveLeft') {
        newPosition.top = (component.style?.left as number) - 1
        updateCurrentCmp({ ...component, style: { ...component.style, left: (component.style?.left as number) - 1 } })
      } else {
        newPosition.top = (component.style?.left as number) + 1
        updateCurrentCmp({ ...component, style: { ...component.style, left: (component.style?.left as number) + 1 } })
      }
      return newPosition
    }
    if (isMultiple) {
      selectCmpIds.forEach(id => {
        const selectCmp = pageComponents.find(item => item.id === id)
        if (!selectCmp) return
        updatePosition(selectCmp)
      })
    } else {
      if (!component?.id) return;
      const oldPosition = { left: (component.style?.left as number), top: (component.style?.top as number) }
      const newPosition = updatePosition(component)
      pushHistory(createHistoryRecord.move(component, oldPosition, newPosition))
    }
  }

  // 注册鼠标事件
  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      mouseState.current.x = e.clientX
      mouseState.current.y = e.clientY
    }
    document.addEventListener('mousemove', mouseMoveHandler)
    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler)
    }
  }, [])

  return {
    copyComponent,
    cutComponent,
    pasteComponent,
    deleteComponent,
    setLayerLevel,
    lockComponent,
    splitComponent,
    combinationComponent,
    updatePosition,
    transformComponent,
    visibleComponent,
    moveComponent
  }
}
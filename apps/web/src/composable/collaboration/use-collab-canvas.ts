import { useDesignComponentsStore } from '@/store/design/components'
import { useDesignStore } from '@/store/design'
import { ComponentSchema } from '@repo/core/types'
import { isPlainObject, isString } from 'lodash-es'
import { useCallback, useEffect, useRef } from 'react'
import * as Y from 'yjs'

type CanvasComponentDoc = Y.Map<unknown>

function createYPropValue(value: unknown): unknown {
  if (isString(value)) {
    return new Y.Text(value)
  }

  if (isPlainObject(value)) {
    const nested = new Y.Map<unknown>()
    const recordValue = value as Record<string, unknown>

    for (const [nestedKey, nestedValue] of Object.entries(recordValue)) {
      nested.set(nestedKey, createYPropValue(nestedValue))
    }

    return nested
  }

  return value
}

/**
 * 将任意 Y 类型递归序列化为普通 JS 对象，方便 React 消费。
 */
export function serializeYValue(value: unknown): unknown {
  if (value instanceof Y.Map) {
    const obj: Record<string, unknown> = {}
    value.forEach((v, k) => {
      obj[k] = serializeYValue(v)
    })
    return obj
  }

  if (value instanceof Y.Array) {
    return value.map(serializeYValue)
  }

  if (value instanceof Y.Text) {
    return value.toString()
  }

  return value
}


function createCanvasComponentDoc(schema: ComponentSchema): CanvasComponentDoc {
  const yComp = new Y.Map<unknown>()

  for (const [key, def] of Object.entries(schema)) {
    if (typeof def === 'string') {
      yComp.set(key, new Y.Text(def))
    } else if (isPlainObject(def)) {
      const nested = new Y.Map<unknown>()
      for (const [nestedKey, nestedDef] of Object.entries(def)) {
        nested.set(nestedKey, createYPropValue(nestedDef))
      }
      yComp.set(key, nested)
    } else {
      yComp.set(key, createYPropValue(def))
    }
  }

  return yComp
}

export function useCollabCanvas(
  doc: Y.Doc | null,
  yCanvasComponents: Y.Array<CanvasComponentDoc> | null,
  roomName: string,
  isSynced: boolean,
) {

  const components = useDesignComponentsStore((state) => state.components);
  const setComponents = useDesignComponentsStore((state) => state.setComponents);
  const schemaPageId = useDesignStore((state) => state.schemaPageId)
  const componentObserversRef = useRef(new Map<CanvasComponentDoc, () => void>())
  const hasSeededRef = useRef(false)


  const findCanvasComponentById = useCallback((id: string) => {
    if (!yCanvasComponents) {
      return { index: -1, component: null as CanvasComponentDoc | null }
    }
    
    const index = components.findIndex((item) => item.id === id)
    return {
      index,
    }
  }, [yCanvasComponents, components])

  const syncCanvas = useCallback(() => {
    if (!yCanvasComponents) return
    const result = yCanvasComponents
      .toArray()
      .map(serializeYValue)
      .filter((item): item is ComponentSchema => item !== null)
    setComponents(result)
    
  }, [setComponents, yCanvasComponents])


  const syncChangedComponent = useCallback((componentDoc: CanvasComponentDoc) => {
    const nextComponent = serializeYValue(componentDoc) as ComponentSchema
    if (!nextComponent) return

    setComponents((prev) => {
      const index = prev.findIndex((item) => item.id === nextComponent.id)
      if (index < 0) {
        return prev
      }

      const next = prev.slice()
      next[index] = nextComponent
      return next
    })
  }, [setComponents])

  const syncComponentObservers = useCallback(() => {
    if (!yCanvasComponents) return
    const componentDocs = new Set(yCanvasComponents.toArray())

    componentObserversRef.current.forEach((observer, componentDoc) => {
      if (componentDocs.has(componentDoc)) return
      componentDoc.unobserveDeep(observer)
      componentObserversRef.current.delete(componentDoc)
    })

    componentDocs.forEach((componentDoc) => {
      if (componentObserversRef.current.has(componentDoc)) return

      const observer = () => syncChangedComponent(componentDoc)
      componentDoc.observeDeep(observer)
      componentObserversRef.current.set(componentDoc, observer)
    })
  }, [syncChangedComponent, yCanvasComponents])

  const handleArrayChange = useCallback(() => {
    syncComponentObservers()
    syncCanvas()
  }, [syncCanvas, syncComponentObservers])

  useEffect(() => {
    hasSeededRef.current = false
  }, [doc, yCanvasComponents, roomName])

  useEffect(() => {
    if (!yCanvasComponents) return
    syncComponentObservers()
    syncCanvas()
    yCanvasComponents.observe(handleArrayChange)

    return () => {
      yCanvasComponents.unobserve(handleArrayChange)
      componentObserversRef.current.forEach((observer, componentDoc) => {
        componentDoc.unobserveDeep(observer)
      })
      componentObserversRef.current.clear()
    }
  }, [handleArrayChange, syncCanvas, syncComponentObservers, yCanvasComponents])

  useEffect(() => {
    if (!doc || !yCanvasComponents || !isSynced || hasSeededRef.current) return

    // 只在当前页面 schema 已经加载完成后，才允许用本地 store 初始化 Yjs。
    if (schemaPageId !== roomName) return

    if (yCanvasComponents.length > 0) {
      hasSeededRef.current = true
      syncCanvas()
      return
    }

    if (components.length === 0) {
      hasSeededRef.current = true
      return
    }

    const nextDocs = components.map(createCanvasComponentDoc)
    
    hasSeededRef.current = true

    doc.transact(() => {
      yCanvasComponents.push(nextDocs)
    })
  }, [components, doc, isSynced, roomName, schemaPageId, syncCanvas, yCanvasComponents])

  const addCanvasComponent = useCallback((schema: ComponentSchema) => {
    if (!doc || !yCanvasComponents) return undefined
    const yComp = createCanvasComponentDoc(schema)

    doc.transact(() => {
      yCanvasComponents.push([yComp])
    })

  }, [doc, yCanvasComponents])

  const moveCanvasComponent = useCallback((id: string, x: number, y: number) => {
    if (!doc || !yCanvasComponents) return

    const { index } = findCanvasComponentById(id)
    if (index < 0) return

    const yComp = yCanvasComponents?.get(index)
    if (!yComp) return
    
    doc.transact(() => {
      const yStyle = yComp.get('style')

      if (yStyle instanceof Y.Map) {
        yStyle.set('left', x)
        yStyle.set('top', y)
        return
      }

      const nextStyle = isPlainObject(yStyle)
        ? {
          ...(yStyle as Record<string, unknown>),
          left: x,
          top: y,
        }
        : { left: x, top: y }

      yComp.set('style', createYPropValue(nextStyle))
    })
  }, [doc, findCanvasComponentById, yCanvasComponents])

  const updateCanvasComponentProp = useCallback((id: string, propKey: string, value: unknown) => {
    if (!doc) return

    const { component: yComp } = findCanvasComponentById(id)
    if (!yComp) return

    const yProps = yComp.get('props')
    if (!(yProps instanceof Y.Map)) return

    const current = yProps.get(propKey)
    if (current instanceof Y.Text) {
      doc.transact(() => {
        current.delete(0, current.length)
        current.insert(0, String(value))
      })
      return
    }

    yProps.set(propKey, value)
  }, [doc, findCanvasComponentById])

  const deleteCanvasComponent = useCallback((id: string) => {
    if (!yCanvasComponents) return

    const { index } = findCanvasComponentById(id)
    if (index < 0) return

    yCanvasComponents.delete(index, 1)
  }, [findCanvasComponentById, yCanvasComponents])

  const clearCanvasComponents = useCallback(() => {
    if (!doc || !yCanvasComponents || yCanvasComponents.length === 0) return

    doc.transact(() => {
      yCanvasComponents.delete(0, yCanvasComponents.length)
    })
  }, [doc, yCanvasComponents])

  return {
    addCanvasComponent,
    moveCanvasComponent,
    updateCanvasComponentProp,
    deleteCanvasComponent,
    clearCanvasComponents,
  }
}
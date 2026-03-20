import type * as Y from 'yjs'
import { useCollabCanvas, serializeYValue } from './use-collab-canvas'
import { useCollabPresence } from './use-collab-presence'
import type { AwarenessUser, CanvasSelection, CursorPosition } from './use-collab-presence'
import { useCollabRoom } from './use-collab-room'
import { useUserStore } from '@/store'

export { serializeYValue }

interface UseYjsResult {
  users: AwarenessUser[]
  cursors: Array<AwarenessUser & CursorPosition>
  canvasSelections: CanvasSelection[]

  updateCursor: (anchor: { x: number; y: number }, head: { x: number; y: number }) => void
  addCanvasComponent: (schema: any) => string | undefined
  moveCanvasComponent: (id: string, x: number, y: number) => void
  updateCanvasComponentProp: (id: string, propKey: string, value: unknown) => void
  deleteCanvasComponent: (id: string) => void
  clearCanvasComponents: () => void
  selectCanvasComponent: (id: string | null) => void
  undoManage: Y.UndoManager | null
}

export function useYjs(roomName: string): UseYjsResult {
  const user = useUserStore((state) => state.user)
  
  const { doc, provider, yCanvasComponents, undoManage, isSynced } = useCollabRoom(roomName)
  const {
    users,
    cursors,
    canvasSelections,
    updateCursor,
    selectCanvasComponent,
  } = useCollabPresence(provider, user)
  const {
    addCanvasComponent,
    moveCanvasComponent,
    updateCanvasComponentProp,
    deleteCanvasComponent,
    clearCanvasComponents,
  } = useCollabCanvas(doc, yCanvasComponents, roomName, isSynced)

  return {
    users,
    cursors,
    canvasSelections,
    updateCursor,
    addCanvasComponent,
    moveCanvasComponent,
    updateCanvasComponentProp,
    deleteCanvasComponent,
    clearCanvasComponents,
    selectCanvasComponent,
    undoManage,
  }
}

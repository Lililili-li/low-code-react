import * as Y from 'yjs'
import { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { useCollaborateStore } from '@/store'

interface CollabRoomState {
  doc: Y.Doc
  provider: WebsocketProvider
  yCanvasComponents: Y.Array<Y.Map<unknown>>
  undoManage: Y.UndoManager
}

export function useCollabRoom(roomName: string) {
  const [room, setRoom] = useState<CollabRoomState | null>(null)
  const [isSynced, setIsSynced] = useState(false)

  const setConnected = useCollaborateStore((state) => state.setConnected)

  useEffect(() => {
    if (!roomName) {
      setRoom(null)
      setIsSynced(false)
      setConnected(false)
      return
    }

    setIsSynced(false)
    const doc = new Y.Doc()
    const yCanvasComponents = doc.getArray<Y.Map<unknown>>('canvas-components')
    const undoManage = new Y.UndoManager(yCanvasComponents)
    const provider = new WebsocketProvider(
      'ws://localhost:3000/collab/page',
      roomName,
      doc,
    )

    const handleStatus = ({ status }: { status: string }) => {
      setConnected(status === 'connected')
    }

    const handleSync = (synced: boolean) => {
      setIsSynced(synced)
    }

    provider.on('status', handleStatus)
    provider.on('sync', handleSync)
    setRoom({
      doc,
      provider,
      yCanvasComponents,
      undoManage,
    })

    return () => {
      provider.off('status', handleStatus)
      provider.off('sync', handleSync)
      provider.destroy()
      doc.destroy()
      setRoom(null)
      setIsSynced(false)
      setConnected(false)
      undoManage.clear()
    }
  }, [roomName])

  return {
    doc: room?.doc ?? null,
    provider: room?.provider ?? null,
    yCanvasComponents: room?.yCanvasComponents ?? null,
    undoManage: room?.undoManage ?? null,
    isSynced,
  }
}
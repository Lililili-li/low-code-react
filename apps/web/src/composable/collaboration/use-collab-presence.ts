import { useCallback, useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { useCollaborateStore } from '@/store'

interface CollabUser {
  id: string | null
  user_name: string
  avatar: string | null
}

export interface AwarenessUser {
  id: string
  name: string
  avatar: string | null
}

export interface CursorPosition {
  anchor: { x: number; y: number }
  head: { x: number; y: number }
}

export interface CanvasSelection extends AwarenessUser {
  selectedId: string
}

interface AwarenessState {
  user?: AwarenessUser
  cursor?: CursorPosition | null
  canvasUser?: {
    selectedId?: string | null
  }
}

export function useCollabPresence(
  provider: WebsocketProvider | null,
  user: CollabUser,
) {
  const [users, setUsers] = useState<AwarenessUser[]>([])
  const [cursors, setCursors] = useState<Array<AwarenessUser & CursorPosition>>([])
  const [canvasSelections, setCanvasSelections] = useState<CanvasSelection[]>([])
  const setCollaborateUsers = useCollaborateStore((state) => state.setCollaborator)
  const clearCollaborateUsers = useCollaborateStore((state) => state.clearCollaborator)

  useEffect(() => {
    if (!provider) {
      setUsers([])
      setCursors([])
      setCanvasSelections([])
      clearCollaborateUsers()
      return
    }

    const { awareness } = provider

    const syncAwareness = () => {
      const myClientId = awareness.clientID
      const entries = Array.from(
        awareness.getStates().entries(),
      ) as Array<[number, AwarenessState]>

      const nextUsers = Array.from(
        new Map(
          entries
            .filter(([, state]) => Boolean(state.user?.id))
            .map(([, state]) => [state.user!.id, state.user!]),
        ).values(),
      )
      
      setUsers(nextUsers)
      setCollaborateUsers(nextUsers)

      setCursors(
        entries
          .filter(([id, state]) => id !== myClientId && state.user && state.cursor != null)
          .map(([, state]) => ({
            ...state.user!,
            ...state.cursor!,
          }))
      )

      setCanvasSelections(
        entries
          .filter(([id, state]) => id !== myClientId && state.user && state.canvasUser?.selectedId)
          .map(([, state]) => ({
            ...state.user!,
            selectedId: state.canvasUser!.selectedId!,
          }))
      )
    }

    const handleStatus = ({ status }: { status: string }) => {
      if (status !== 'connected') {
        syncAwareness()
      }
    }

    const teardownPresence = () => {
      awareness.setLocalState(null)
      provider.disconnect()
    }

    provider.on('status', handleStatus)
    awareness.on('update', syncAwareness)
    awareness.setLocalStateField('user', {
      id: user.id ?? '',
      name: user.user_name,
      avatar: user.avatar,
    })
    syncAwareness()

    window.addEventListener('pagehide', teardownPresence)
    window.addEventListener('beforeunload', teardownPresence)

    return () => {
      window.removeEventListener('pagehide', teardownPresence)
      window.removeEventListener('beforeunload', teardownPresence)
      provider.off('status', handleStatus)
      awareness.off('update', syncAwareness)
      awareness.setLocalState(null)
      setUsers([])
      setCursors([])
      setCanvasSelections([])
      clearCollaborateUsers()
    }
  }, [provider, user.id, user.user_name, user.avatar, setCollaborateUsers, clearCollaborateUsers])

  const updateCursor = useCallback((anchor: { x: number; y: number }, head: { x: number; y: number }) => {
    if (!provider) return
    provider.awareness.setLocalStateField('cursor', { anchor, head })
  }, [provider])

  const selectCanvasComponent = useCallback((id: string | null) => {
    if (!provider) return
    provider.awareness.setLocalStateField('canvasUser', { selectedId: id ?? null })
  }, [provider])

  return {
    users,
    cursors,
    canvasSelections,
    updateCursor,
    selectCanvasComponent,
  }
}

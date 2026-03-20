import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface CollaborateUser {
  id: string
  name: string
  avatar: string | null
}

interface CollaborateState {
  collaborator: CollaborateUser[]
  connected: boolean
}

interface CollaborateActions {
  setCollaborator: (collaborator: CollaborateUser[]) => void
  clearCollaborator: () => void
  setConnected: (connected: boolean) => void
}

export const useCollaborateStore = create<CollaborateState & CollaborateActions>()(
  immer((set) => ({
    collaborator: [],
    connected: false,
    setCollaborator: (collaborator: CollaborateUser[]) => {
      set((state) => {
        state.collaborator = collaborator
      })
    },
    clearCollaborator: () => {
      set((state) => {
        state.collaborator = []
      })
    },
    setConnected: (connected: boolean) => {
      set((state) => {
        state.connected = connected
      })
    },
  }))
)

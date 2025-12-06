import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
export interface UserState {
  user: {
    avatar: string | null
    account: string,
    user_name: string,
    is_active: boolean,
    team_id: number,
    access_token: string
  }
}

interface UserActions {
  setUser: (user: UserState['user']) => void
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    immer((set) => ({
      user: {
        avatar: null,
        account: '',
        user_name: '',
        is_active: true,
        team_id: 0,
        access_token: ""
      },
      setUser: (user: UserState['user']) => {
        set((state) => {
          state.user = user
        })
      }
    })),
    {
      name: "user-storage", // localStorage key
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const user = JSON.parse(str);
          return { state: { user }, version: 0 };
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value.state.user));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

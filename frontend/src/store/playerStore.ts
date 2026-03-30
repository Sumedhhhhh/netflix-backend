import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  volume: number;
  muted: boolean;
  preferredLevel: number; // -1 = Auto
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPreferredLevel: (level: number) => void;
  toggleMuted: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      volume: 1,
      muted: false,
      preferredLevel: -1,

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) });
      },

      setMuted: (muted: boolean) => {
        set({ muted });
      },

      toggleMuted: () => {
        const { muted } = get();
        set({ muted: !muted });
      },

      setPreferredLevel: (level: number) => {
        set({ preferredLevel: level });
      },
    }),
    {
      name: 'player-storage',
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        preferredLevel: state.preferredLevel,
      }),
    }
  )
);

// store/tutorialStore.ts
import { create } from 'zustand';

interface TutorialState {
  isActive: boolean;
  start: () => void;
  end: () => void;
}

export const useTutorialStore = create<TutorialState>((set) => ({
  isActive: false,
  start: () => set({ isActive: true }),
  end: () => set({ isActive: false }),
}));

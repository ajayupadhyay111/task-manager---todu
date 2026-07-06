"use client";
import { create } from "zustand";

type UI = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (b: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;
  quickAddOpen: boolean;
  quickAddKind: "task" | "client" | "project" | "note";
  setQuickAdd: (b: boolean, kind?: UI["quickAddKind"]) => void;
  focusMode: boolean;
  toggleFocus: () => void;
};

export const useUIStore = create<UI>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (b) => set({ mobileNavOpen: b }),
  paletteOpen: false,
  setPaletteOpen: (b) => set({ paletteOpen: b }),
  quickAddOpen: false,
  quickAddKind: "task",
  setQuickAdd: (b, kind) => set((s) => ({ quickAddOpen: b, quickAddKind: kind ?? s.quickAddKind })),
  focusMode: false,
  toggleFocus: () => set((s) => ({ focusMode: !s.focusMode })),
}));

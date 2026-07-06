"use client";
import { Toaster } from "sonner";
import { CommandPaletteProvider } from "./command/command-palette";
import { QuickAddProvider } from "./quick-add/quick-add";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { PWARegister } from "./pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <QuickAddProvider>
        <KeyboardShortcuts />
        <PWARegister />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(20,22,29,0.9)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E8EAF0",
              borderRadius: "14px",
            },
          }}
        />
      </QuickAddProvider>
    </CommandPaletteProvider>
  );
}

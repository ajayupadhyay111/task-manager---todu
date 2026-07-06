"use client";
import { useUIStore } from "@/lib/store";
import { Sidebar } from "./sidebar";
import { AnimatePresence, motion } from "framer-motion";

export function MobileDrawer({ open }: { open: boolean }) {
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-[300px] lg:hidden"
          >
            <Sidebar onNavigate={() => setOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

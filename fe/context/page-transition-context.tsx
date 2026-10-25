"use client";

import React, { createContext, useContext, useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageTransitionContextType {
  navigate: (href: string) => void;
  isPending: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  navigate: () => {},
  isPending: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [activeHref, setActiveHref] = useState<string | null>(null);

  // When pathname updates to the target route, clear the active transition
  useEffect(() => {
    setActiveHref(null);
  }, [pathname]);

  const navigate = (href: string) => {
    if (!href || href === pathname) return;
    setActiveHref(href);
    startTransition(() => {
      router.push(href);
    });
  };

  // Safety fallback: if navigation takes longer than 2.5s, auto-close loader
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeHref) {
      timer = setTimeout(() => {
        setActiveHref(null);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [activeHref]);

  const showLoader = Boolean(activeHref || isPending);

  return (
    <PageTransitionContext.Provider value={{ navigate, isPending: showLoader }}>
      {children}

      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="page-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/60 backdrop-blur-xs pointer-events-none select-none"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card/95 border border-primary/20 shadow-2xl backdrop-blur-md space-y-4 max-w-xs w-[85%]"
            >
              {/* PLN Logo with Animated Glow Pulse */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className="relative h-16 w-40 flex items-center justify-center"
                >
                  <img
                    src="/logo.png"
                    alt="PLN Nusantara Power"
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,163,224,0.3)]"
                  />
                </motion.div>
              </div>

              {/* Glowing Energy Progress Bar & Text */}
              <div className="flex flex-col items-center space-y-2.5 w-full pt-1">
                <div className="w-full bg-primary/15 h-1.5 rounded-full overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-primary to-blue-600 rounded-full w-1/2"
                    animate={{
                      x: ["-100%", "250%"],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.1,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Memuat Halaman...</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}


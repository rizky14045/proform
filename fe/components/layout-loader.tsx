"use client";

import { Loader2 } from "lucide-react";

const LayoutLoader = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col space-y-4 select-none">
      <div className="relative h-16 w-40 flex items-center justify-center animate-pulse">
        <img
          src="/logo.png"
          alt="PLN Nusantara Power"
          className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,163,224,0.3)]"
        />
      </div>
      <div className="w-44 bg-primary/15 h-1.5 rounded-full overflow-hidden relative">
        <div className="h-full bg-gradient-to-r from-cyan-500 via-primary to-blue-600 rounded-full w-1/2 animate-pulse" />
      </div>
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        Memuat Halaman...
      </span>
    </div>
  );
};

export default LayoutLoader;

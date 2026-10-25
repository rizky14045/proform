"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { X } from "lucide-react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import thumbnail from "@/public/images/all-img/thumbnail.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const AddBlock = ({
  className,
  title = "UP Sembalang",
  desc = "Sistem Revamp Terpadu Logistik & Pengadaan PT PLN Nusantara Power.",
}: {
  className?: string;
  image?: any;
  title?: string;
  desc?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-900 to-sky-800 text-white p-3.5 rounded-xl m-3 hidden xl:block shadow-sm border border-blue-700/40",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
          {title}
        </div>
      </div>
      <div className="text-[11px] text-blue-100/90 leading-relaxed mb-2.5">
        {desc}
      </div>
      <div className="pt-2 border-t border-blue-700/50 flex justify-between items-center text-[10px] text-blue-200">
        <span>TTE BSrE Online</span>
        <span className="font-semibold text-emerald-300">● SISTEM SIAP</span>
      </div>
    </div>
  );
};

export default AddBlock;

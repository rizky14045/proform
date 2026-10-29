"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { User } from "@/types";

const ProfileInfo = () => {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [session]);

  const handleLogout = async () => {
    await authService.performFullLogout();
  };

  const displayName = currentUser?.name || session?.user?.name || "Administrator Sistem";
  const displayEmail = currentUser?.email || session?.user?.email || "admin@interlogs.pln.co.id";
  const roleName = currentUser?.role?.name || (session?.user as any)?.role || "Administrator";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted/50 transition-colors">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
              {displayName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[120px]">
              {roleName}
            </span>
          </div>
          <Icon icon="heroicons:chevron-down-20-solid" className="w-4 h-4 text-muted-foreground hidden md:block" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-1" align="end">
        <DropdownMenuLabel className="flex gap-2.5 items-center p-2.5">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="text-sm font-bold text-foreground truncate">
              {displayName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {displayEmail}
            </div>
            <div className="text-[10px] font-semibold text-primary uppercase mt-0.5">
              {roleName}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuGroup>
          <Link href="/user-profile" className="cursor-pointer">
            <DropdownMenuItem className="flex items-center gap-2.5 text-sm font-medium text-foreground px-3 py-2 cursor-pointer hover:bg-muted rounded-md">
              <Icon icon="heroicons:user-circle" className="w-4 h-4 text-primary" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2.5 text-sm font-medium text-red-600 dark:text-red-400 px-3 py-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
        >
          <Icon icon="heroicons:arrow-left-on-rectangle" className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileInfo;

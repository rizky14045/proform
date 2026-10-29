"use client";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AddBlock from "../common/add-block";
import { authService } from "@/services/auth.service";
import { User } from "@/types";

const LogoutFooter = () => {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, [session]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await authService.performFullLogout();
  };

  const displayName = currentUser?.name || session?.user?.name || "Administrator";
  const displayEmail = currentUser?.email || session?.user?.email || "admin@interlogs.pln.co.id";

  return (
    <>
      <AddBlock />

      <div className="bg-default-50 dark:bg-default-200 items-center flex gap-3 px-4 py-2 mt-5">
        <div className="flex-1 overflow-hidden">
          <div className="text-default-700 font-semibold text-sm capitalize mb-0.5 truncate">
            {displayName}
          </div>
          <div className="text-xs text-default-600 truncate">
            {displayEmail}
          </div>
        </div>
        <div className="flex-none">
          <button
            type="button"
            title="Keluar dari sistem"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="text-default-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex h-9 w-9 rounded items-center dark:bg-default-300 justify-center dark:text-default-900 transition-colors cursor-pointer"
          >
            <Icon
              icon={isLoggingOut ? "heroicons:arrow-path" : "heroicons:arrow-right-start-on-rectangle-20-solid"}
              className={`h-5 w-5 ${isLoggingOut ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default LogoutFooter;

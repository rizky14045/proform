import { useSidebar } from "@/store";

const SidebarLogo = ({ hovered }: { hovered?: boolean }) => {
  const { sidebarType, setCollapsed, collapsed } = useSidebar();
  return (
    <div className="px-4 py-4 border-b border-default-100">
      <div className="flex items-center">
        <div className="flex flex-1 items-center gap-x-3">
          <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
            <img
              src="/ico.ico"
              alt="INTERLOGS Logo"
              className="h-full w-full object-contain"
            />
          </div>
          {(!collapsed || hovered) && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-base font-bold text-primary tracking-tight leading-tight">
                INTERLOGS
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
                UP Muara Tawar
              </span>
            </div>
          )}
        </div>
        {sidebarType === "classic" && (!collapsed || hovered) && (
          <div className="flex-none lg:block hidden">
            <div
              onClick={() => setCollapsed(!collapsed)}
              className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-border rounded-full transition-all duration-150 cursor-pointer ${
                collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900 bg-default-900 dark:ring-offset-default-300"
              }`}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;

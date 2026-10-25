import { cn } from "@/lib/utils";
const FooterLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <footer
      className={cn(
        "bg-card relative py-4 px-6 border-border  border-t",
        className
      )}
    >
      {children}
    </footer>
  );
};

export default FooterLayout;

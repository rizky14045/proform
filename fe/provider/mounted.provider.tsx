"use client";
import { memo } from "react";

import { useMounted } from "@/hooks/use-mounted";
import PageLoader from "@/components/loader/page-loader";

function MountedProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  if (!mounted) {
    return <PageLoader />;
  }
  return children;
}

export default memo(MountedProvider);

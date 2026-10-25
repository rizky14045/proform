"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { cn, getDynamicPath } from "@/lib/utils";
const pages = [
  {
    text: "overview",
    value: "overview",
  },
  {
    text: "task",
    value: "task",
  },
  {
    text: "docs",
    value: "documents",
  },
  {
    text: "files",
    value: "files",
  },
  {
    text: "activity",
    value: "activity",
  },
  {
    text: "team",
    value: "team",
  },
  {
    text: "discussion",
    value: "discussion",
  },
  {
    text: "settings",
    value: "settings",
  },
];
const PageLink = ({ id }: { id: string }) => {
  const locationName = usePathname();
  const { lang } = useParams();

  const normalizedPath = getDynamicPath(locationName);

  return pages.map((item) => {
    const itemPath = `/projects/${id}/${item.value}`;
    return (
      <Link
        key={item.value}
        href={`/${lang}${itemPath}`}
        className={cn(
          "text-sm font-semibold text-default-500 capitalize pb-3 border-b border-transparent cursor-pointer",
          {
            "border-primary text-primary": normalizedPath === itemPath,
          }
        )}
      >
        {item.text}
      </Link>
    );
  });
};

export default PageLink;

import type { Metadata } from "next";

type TGetSeoMetaProps = Metadata | void;

export const getSeoMeta = (props: TGetSeoMetaProps): Metadata => {
  const {
    title,
    applicationName = "INTERLOGS UP Muara Tawar",
    description = "Sistem Revamp Logistik & Pengadaan Terpadu PT PLN Nusantara Power UP Muara Tawar",
    icons = {
      icon: "/ico.ico",
      shortcut: "/ico.ico",
      apple: "/ico.ico",
    },
    ...restProps
  } = props || {};
  const finalTitle = title
    ? `${title} | INTERLOGS PLN Nusantara Power`
    : "INTERLOGS - PT PLN Nusantara Power UP Muara Tawar";

  return {
    title: finalTitle,
    applicationName,
    description,
    icons,
    ...restProps,
  };
};

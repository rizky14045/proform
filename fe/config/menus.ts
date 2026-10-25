import {
  DashBoard,
  Files,
  Cart,
  Graph,
  ClipBoard,
  ClipBoard2,
  Note,
  Note2,
  Note3,
  Building,
  Building2,
  Sheild,
  Monitor,
  ListFill,
} from "@/components/svg";

export interface MenuItemProps {
  title: string;
  icon?: any;
  href?: string;
  roles?: string[]; // Role codes yang diizinkan mengakses menu ini
  child?: MenuItemProps[];
  isHeader?: boolean;
}

// Master Menu INTERLOGS UP Sembalang (Diselaraskan dengan User Manual PT PLN Nusantara Power)
// Semua menu dibuat flat (langsung link) tanpa child accordion
export const interlogsMenus: MenuItemProps[] = [
  {
    isHeader: true,
    title: "MENU UTAMA",
    roles: ["ALL"],
  },
  {
    title: "Dashboard",
    icon: DashBoard,
    href: "/dashboard",
    roles: ["ALL"],
  },

  // 1. UNIT PEMINTA (USER) & PERENCANAAN
  {
    isHeader: true,
    title: "PERENCANAAN & USULAN",
    roles: ["ADMIN", "GM", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "Usulan Pengadaan (UPM)",
    icon: Files,
    href: "/procurement",
    roles: ["ADMIN", "GM", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },

  // 2. ENJINIRING ESTIMATE (HPE & RKS)
  {
    isHeader: true,
    title: "ENJINIRING & RKS",
    roles: ["ADMIN", "GM", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "HPE & Dokumen RKS",
    icon: Note,
    href: "/procurement/hpe-rks",
    roles: ["ADMIN", "GM", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },

  // 3. PROSES PENGADAAN (SOURCING & TENDER)
  {
    isHeader: true,
    title: "PENGADAAN & TENDER",
    roles: ["ADMIN", "GM", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_LOGISTIK", "MGR_KEUANGAN", "SPV_KEUANGAN"],
  },
  {
    title: "Proses Tender & Sourcing",
    icon: Cart,
    href: "/procurement/tender",
    roles: ["ADMIN", "GM", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_LOGISTIK", "MGR_KEUANGAN", "SPV_KEUANGAN"],
  },

  // 4. KONTRAK & PURCHASE ORDER
  {
    isHeader: true,
    title: "KONTRAK & PO",
    roles: ["ADMIN", "GM", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_LOGISTIK", "SPV_GUDANG", "STAFF_GUDANG", "MGR_KEUANGAN"],
  },
  {
    title: "Purchase Order (PO)",
    icon: Building2,
    href: "/procurement/po",
    roles: ["ADMIN", "GM", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_LOGISTIK", "SPV_GUDANG", "STAFF_GUDANG", "MGR_KEUANGAN"],
  },

  // 5. GUDANG & PENERIMAAN MATERIAL / JASA
  {
    isHeader: true,
    title: "GUDANG & PENERIMAAN",
    roles: ["ADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK"],
  },
  {
    title: "Logistik Gudang & BAST",
    icon: Building,
    href: "/warehouse",
    roles: ["ADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK"],
    child: [
      {
        title: "Penerimaan Barang (GR)",
        href: "/warehouse/receipts",
        icon: Cart,
        roles: ["ADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_LOGISTIK"],
      },
      {
        title: "Berita Acara (BAPHB / BAST)",
        href: "/warehouse/acts",
        icon: Files,
        roles: ["ADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK"],
      },
    ],
  },

  // 6. EVALUASI KINERJA REKANAN
  {
    isHeader: true,
    title: "EVALUASI VENDOR",
    roles: ["ADMIN", "GM", "MGR_USER", "SPV_USER", "SPV_GUDANG", "SPV_PENGADAAN", "MGR_LOGISTIK"],
  },
  {
    title: "Evaluasi Rekanan",
    icon: ListFill,
    href: "/procurement/evaluasi",
    roles: ["ADMIN", "GM", "MGR_USER", "SPV_USER", "SPV_GUDANG", "SPV_PENGADAAN", "MGR_LOGISTIK"],
  },

  // 7. EXECUTIVE DOCKET & TTE BSRE (BSSN)
  {
    isHeader: true,
    title: "PENGESAHAN EKSEKUTIF",
    roles: ["ADMIN", "GM", "MGR_LOGISTIK", "MGR_USER", "MGR_KEUANGAN"],
  },
  {
    title: "Executive Docket & TTE",
    icon: Sheild,
    href: "/executive-docket",
    roles: ["ADMIN", "GM", "MGR_LOGISTIK", "MGR_USER", "MGR_KEUANGAN"],
  },

  // 8. MASTER DATA SISTEM
  {
    isHeader: true,
    title: "PENGATURAN & MASTER DATA",
    roles: ["ADMIN", "SPV_INVENTORY", "STAFF_INVENTORY", "SPV_PENGADAAN", "SPV_GUDANG"],
  },
  {
    title: "Master Data Sistem",
    icon: Monitor,
    href: "/master",
    roles: ["ADMIN", "SPV_INVENTORY", "STAFF_INVENTORY", "SPV_PENGADAAN", "SPV_GUDANG"],
    child: [
      {
        title: "Kelola Pengguna",
        href: "/master/users",
        icon: ListFill,
        roles: ["ADMIN"],
      },
      {
        title: "Kode Jabatan (Roles)",
        href: "/master/roles",
        icon: Sheild,
        roles: ["ADMIN"],
      },
      {
        title: "Master Rekanan (Suppliers)",
        href: "/master/suppliers",
        icon: Building2,
        roles: ["ADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
      },
      {
        title: "Master Stock Code",
        href: "/master/stock-codes",
        icon: Cart,
        roles: ["ADMIN", "SPV_INVENTORY", "STAFF_INVENTORY", "SPV_GUDANG", "STAFF_GUDANG"],
      },
      {
        title: "Parameter Umum",
        href: "/master/generals",
        icon: Note,
        roles: ["ADMIN"],
      },
    ],
  },

  // 9. AUDIT & TRACKING
  {
    isHeader: true,
    title: "AUDIT & PELACAKAN",
    roles: ["ALL"],
  },
  {
    title: "Tracking Permohonan",
    icon: Graph,
    href: "/tracking",
    roles: ["ALL"],
  },
  {
    title: "Audit Logs Sistem",
    icon: ClipBoard,
    href: "/audit/logs",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "MGR_KEUANGAN", "MGR_USER"],
  },
];

// Helper Function: Filter menu berdasarkan role pengguna aktif
export function getMenusForRole(roleCode?: string): MenuItemProps[] {
  const role = (roleCode || "ADMIN").toUpperCase();
  if (role === "ADMIN" || role === "SUPERADMIN") {
    return interlogsMenus;
  }

  const result: MenuItemProps[] = [];

  for (let i = 0; i < interlogsMenus.length; i++) {
    const item = interlogsMenus[i];

    // Cek apakah item ini diizinkan untuk role ini
    const isAllowed =
      !item.roles ||
      item.roles.includes("ALL") ||
      item.roles.includes(role);

    if (!isAllowed) {
      continue;
    }

    // Jika item adalah Header, cek apakah di grup ini ada setidaknya 1 menu berikutnya yang diizinkan
    if (item.isHeader) {
      let hasVisibleChild = false;
      for (let j = i + 1; j < interlogsMenus.length; j++) {
        const nextItem = interlogsMenus[j];
        if (nextItem.isHeader) break;
        if (!nextItem.roles || nextItem.roles.includes("ALL") || nextItem.roles.includes(role)) {
          hasVisibleChild = true;
          break;
        }
      }
      if (hasVisibleChild) {
        result.push(item);
      }
      continue;
    }

    // Jika ada child (untuk backward-compatibility jika ada), filter child-nya
    if (item.child && item.child.length > 0) {
      const filteredChildren = item.child.filter((child) => {
        return !child.roles || child.roles.includes("ALL") || child.roles.includes(role);
      });

      if (filteredChildren.length > 0) {
        result.push({
          ...item,
          child: filteredChildren,
        });
      }
    } else {
      result.push(item);
    }
  }

  return result;
}

// Konfigurasi bawaan yang dipakai komponen template
export const menusConfig = {
  mainNav: interlogsMenus,
  sidebarNav: {
    modern: interlogsMenus,
    classic: interlogsMenus,
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];

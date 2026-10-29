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

// Master Menu INTERLOGS UP Sembalang (Diselaraskan 100% dengan User Manual INTERLOGS V6)
// Semua menu dibuat flat (langsung link) tanpa accordion berjenjang demi kecepatan dan kenyamanan navigasi
export const interlogsMenus: MenuItemProps[] = [
  // ================= 1. MENU UTAMA =================
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
  {
    title: "Approval Dokumen",
    icon: ClipBoard2,
    href: "/approval",
    roles: ["ALL"],
  },

  // ================= 2. MASTER DATA (BAB 3) =================
  {
    isHeader: true,
    title: "MASTER DATA SISTEM",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Master Pengguna (User)",
    icon: ListFill,
    href: "/master/users",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Kode Jabatan (Role)",
    icon: Sheild,
    href: "/master/roles",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Akses Spesial (User Role)",
    icon: Sheild,
    href: "/master/user-roles",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Parameter Umum",
    icon: Note,
    href: "/master/generals",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Struktur Organisasi",
    icon: Building,
    href: "/master/structures",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Struktur Approval",
    icon: ClipBoard,
    href: "/master/approval-structures",
    roles: ["ADMIN", "SUPERADMIN"],
  },
  {
    title: "Master Rekanan (Supplier)",
    icon: Building2,
    href: "/master/suppliers",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Master Stock Code",
    icon: Cart,
    href: "/master/stock-codes",
    roles: ["ADMIN", "SUPERADMIN", "SPV_INVENTORY", "STAFF_INVENTORY", "SPV_GUDANG"],
  },
  {
    title: "Master Dokumen",
    icon: Files,
    href: "/master/documents",
    roles: ["ADMIN", "SUPERADMIN"],
  },

  // ================= 3. TRANSAKSI UMUM (BAB 4) =================
  {
    isHeader: true,
    title: "TRANSAKSI UMUM",
    roles: ["ALL"],
  },
  {
    title: "Alih Tugas Sementara",
    icon: ListFill,
    href: "/transactions/alih-tugas",
    roles: ["ALL"],
  },
  {
    title: "Kelola Bank Garansi",
    icon: Building2,
    href: "/transactions/bank-garansi",
    roles: ["ADMIN", "SUPERADMIN", "MGR_KEUANGAN", "SPV_KEUANGAN", "SPV_PENGADAAN"],
  },
  {
    title: "Penilaian Kinerja Supplier",
    icon: ClipBoard,
    href: "/procurement/evaluasi",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_USER", "SPV_USER", "SPV_GUDANG", "SPV_PENGADAAN", "MGR_LOGISTIK"],
  },
  {
    title: "Checklist Dokumen Supplier",
    icon: Note2,
    href: "/transactions/checklist-supplier",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Tracking Pengadaan",
    icon: Graph,
    href: "/tracking",
    roles: ["ALL"],
  },

  // ================= 4. TRANSAKSI USERS (BAB 4.6) =================
  {
    isHeader: true,
    title: "TRANSAKSI USER (UNIT PEMINTA)",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK"],
  },
  {
    title: "Usulan Pengadaan (UPM)",
    icon: Files,
    href: "/procurement",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_USER", "SPV_USER", "STAFF_USER", "MGR_LOGISTIK"],
  },
  {
    title: "Distribusi Permintaan User",
    icon: ListFill,
    href: "/transactions/users/distribusi-permintaan",
    roles: ["ADMIN", "SUPERADMIN", "MGR_USER", "SPV_USER"],
  },
  {
    title: "Usulan Permintaan Tahap 2",
    icon: Note,
    href: "/transactions/users/usulan-permintaan-2",
    roles: ["ADMIN", "SUPERADMIN", "MGR_USER", "SPV_USER", "STAFF_USER"],
  },
  {
    title: "Usulan Addendum User",
    icon: ClipBoard2,
    href: "/transactions/users/usulan-permintaan-addendum",
    roles: ["ADMIN", "SUPERADMIN", "MGR_USER", "SPV_USER", "STAFF_USER"],
  },
  {
    title: "Evaluasi Teknis Penawaran",
    icon: Note3,
    href: "/transactions/users/evaluasi-teknis",
    roles: ["ADMIN", "SUPERADMIN", "MGR_USER", "SPV_USER", "STAFF_USER"],
  },

  // ================= 5. TRANSAKSI INVENTORY (BAB 4.7) =================
  {
    isHeader: true,
    title: "TRANSAKSI INVENTORY & PERENCANAAN",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "Distribusi Perencana",
    icon: ListFill,
    href: "/transactions/inventory/distribusi-perencana",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_INVENTORY"],
  },
  {
    title: "Usulan Pengadaan (RO)",
    icon: Cart,
    href: "/transactions/inventory/usulan-pengadaan",
    roles: ["ADMIN", "SUPERADMIN", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "HPE & Dokumen RKS",
    icon: Note,
    href: "/procurement/hpe-rks",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "Kelola Dokumen RKS",
    icon: Files,
    href: "/transactions/inventory/rks",
    roles: ["ADMIN", "SUPERADMIN", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "Adendum Dokumen RKS",
    icon: Note2,
    href: "/transactions/inventory/adendum-rks",
    roles: ["ADMIN", "SUPERADMIN", "SPV_INVENTORY", "STAFF_INVENTORY"],
  },
  {
    title: "Review VFM Perencanaan",
    icon: Graph,
    href: "/transactions/inventory/review-vfm",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_INVENTORY"],
  },
  {
    title: "Izin Penunjukan Langsung",
    icon: Sheild,
    href: "/transactions/inventory/izin-penunjukan-langsung",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "SPV_INVENTORY"],
  },

  // ================= 6. TRANSAKSI PENGADAAN (BAB 4.8) =================
  {
    isHeader: true,
    title: "TRANSAKSI PENGADAAN & KONTRAK",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_KEUANGAN"],
  },
  {
    title: "Distribusi Pengadaan Pelaksana",
    icon: ListFill,
    href: "/transactions/pengadaan/distribusi-pengadaan",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_PENGADAAN"],
  },
  {
    title: "SP Mulai Kerja (SPMK)",
    icon: ClipBoard2,
    href: "/transactions/pengadaan/spmk",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Penyusunan HPS (OE)",
    icon: Note,
    href: "/transactions/pengadaan/hps",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Permintaan Penawaran (RFQ)",
    icon: Files,
    href: "/transactions/pengadaan/permintaan-penawaran",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Pengumuman Pengadaan",
    icon: Monitor,
    href: "/transactions/pengadaan/pengumuman-penawaran",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Aanwijzing (Penjelasan)",
    icon: ClipBoard,
    href: "/transactions/pengadaan/aanwijzing",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Pembukaan & Evaluasi Penawaran",
    icon: Cart,
    href: "/procurement/tender",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Pembukaan Penawaran 1 Sampul",
    icon: Files,
    href: "/transactions/pengadaan/pembukaan-penawaran-1",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Evaluasi Penawaran 1 Sampul",
    icon: Note2,
    href: "/transactions/pengadaan/evaluasi-penawaran-1",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Pembukaan Penawaran 2 Sampul",
    icon: Files,
    href: "/transactions/pengadaan/pembukaan-penawaran-2",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Evaluasi Penawaran 2 Sampul",
    icon: Note2,
    href: "/transactions/pengadaan/evaluasi-penawaran-2",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "BA Negosiasi Harga (BANH)",
    icon: Graph,
    href: "/transactions/pengadaan/negosiasi-harga",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "BA Hasil Pengadaan (BAHP)",
    icon: ClipBoard2,
    href: "/transactions/pengadaan/hasil-pengadaan",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Review VFM Pengadaan",
    icon: Graph,
    href: "/transactions/pengadaan/review-vfm",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_PENGADAAN"],
  },
  {
    title: "Kontrak Payung (Umbrella)",
    icon: Building2,
    href: "/transactions/pengadaan/kontrak-payung",
    roles: ["ADMIN", "SUPERADMIN", "MGR_LOGISTIK", "SPV_PENGADAAN"],
  },
  {
    title: "Purchase Order (PO)",
    icon: Building2,
    href: "/procurement/po",
    roles: ["ADMIN", "SUPERADMIN", "GM", "SPV_PENGADAAN", "STAFF_PENGADAAN", "MGR_LOGISTIK"],
  },
  {
    title: "Addendum Kontrak PO",
    icon: Note3,
    href: "/transactions/pengadaan/addendum-po",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"],
  },
  {
    title: "Delivery Order (PO DO)",
    icon: Cart,
    href: "/transactions/pengadaan/po-do",
    roles: ["ADMIN", "SUPERADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN", "SPV_GUDANG"],
  },

  // ================= 7. TRANSAKSI GUDANG (BAB 4.9) =================
  {
    isHeader: true,
    title: "TRANSAKSI GUDANG & MATERIAL",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER", "MGR_LOGISTIK"],
  },
  {
    title: "Distribusi Penerimaan Gudang",
    icon: ListFill,
    href: "/transactions/gudang/distribusi-penerimaan",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG"],
  },
  {
    title: "Pemeriksaan Fisik Barang",
    icon: Note2,
    href: "/transactions/gudang/pemeriksaan-penerimaan",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG"],
  },
  {
    title: "BA Pemeriksaan Hasil Barang (BAPHB)",
    icon: Files,
    href: "/transactions/gudang/pemeriksaan-barang",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER"],
  },
  {
    title: "Penerimaan Barang (Goods Receipt)",
    icon: Cart,
    href: "/warehouse/receipts",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_LOGISTIK"],
  },
  {
    title: "Penyelesaian Pekerjaan Jasa",
    icon: ClipBoard2,
    href: "/transactions/gudang/penyelesaian-pekerjaan",
    roles: ["ADMIN", "SUPERADMIN", "MGR_USER", "SPV_USER", "STAFF_USER"],
  },
  {
    title: "Berita Acara Serah Terima (BAST)",
    icon: Files,
    href: "/warehouse/acts",
    roles: ["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_USER", "SPV_USER", "MGR_LOGISTIK"],
  },

  // ================= 8. LAPORAN & MONITORING (BAB 5) =================
  {
    isHeader: true,
    title: "LAPORAN & MONITORING",
    roles: ["ALL"],
  },
  {
    title: "Monitoring Pengadaan",
    icon: Graph,
    href: "/report/monitoring",
    roles: ["ALL"],
  },
  {
    title: "Laporan Revisi Dokumen",
    icon: Note,
    href: "/report/laporan-revisi",
    roles: ["ALL"],
  },
  {
    title: "Laporan Bank Garansi",
    icon: Building2,
    href: "/report/report-bank-garansi",
    roles: ["ADMIN", "SUPERADMIN", "MGR_KEUANGAN", "SPV_KEUANGAN", "MGR_LOGISTIK"],
  },
  {
    title: "Monitoring Masa Berlaku BG",
    icon: ClipBoard,
    href: "/report/monitoring-bank-garansi",
    roles: ["ADMIN", "SUPERADMIN", "MGR_KEUANGAN", "SPV_KEUANGAN", "MGR_LOGISTIK"],
  },
  {
    title: "Arsip Dokumen Digital",
    icon: Files,
    href: "/report/arsip",
    roles: ["ALL"],
  },

  // ================= 9. EKSEKUTIF & AUDIT =================
  {
    isHeader: true,
    title: "PENGESAHAN & AUDIT",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "MGR_USER", "MGR_KEUANGAN"],
  },
  {
    title: "Executive Docket & TTE",
    icon: Sheild,
    href: "/executive-docket",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "MGR_USER", "MGR_KEUANGAN"],
  },
  {
    title: "Audit Trail Sistem",
    icon: ClipBoard,
    href: "/audit/logs",
    roles: ["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "MGR_KEUANGAN"],
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

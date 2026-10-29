"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Search, Plus, Pencil, Trash2, AlertCircle, Menu, Layers } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { Role, PaginationMeta } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import toast from "react-hot-toast";

interface MenuItem {
  menu_type: string;
  sub_menu: string;
  menu_name: string;
}

const MENU_OPTIONS: { [key: string]: { [key: string]: string[] } } = {
  "Master Data": {
    "User Management": ["User", "Role", "User Role"],
    "General & Hierarchy": ["General", "Structure", "Approval Structure"],
    "Logistics & Vendor": ["Supplier", "Stock Code", "Master Dokumen"],
  },
  "Transaksi Common": {
    "Administrasi": ["Alih Tugas", "Bank Garansi", "Penilaian Kinerja Supplier", "Checklist Supplier"],
  },
  "Transaksi Users": {
    "Permintaan": ["Usulan Permintaan I", "Distribusi Permintaan", "Usulan Permintaan II", "Usulan Permintaan Addendum", "Evaluasi Teknis"],
  },
  "Transaksi Inventory": {
    "Perencanaan": ["Distribusi Perencana", "Usulan Pengadaan (RO)", "Harga Perkiraan Engineering (HPE)", "RKS & Adendum RKS", "Review VFM Perencanaan", "Izin Penunjukan Langsung"],
  },
  "Transaksi Pengadaan": {
    "Tender & PO": ["Distribusi Pengadaan", "SPMK", "HPS", "Permintaan Penawaran", "Pengumuman Penawaran", "Aanwijzing", "Pembukaan Penawaran", "Evaluasi Penawaran", "Negosiasi Harga", "Hasil Pengadaan (BAHP)", "Review VFM", "Kontrak Payung", "Purchase Order", "Addendum PO", "PO DO"],
  },
  "Transaksi Gudang": {
    "Penerimaan": ["Distribusi Penerimaan", "Pemeriksaan Penerimaan", "Pemeriksaan Barang", "Penerimaan Barang (BAPHB)", "Penyelesaian Pekerjaan", "Pemeriksaan Jasa (BAST)"],
  },
};

export default function MasterRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form Role according to PDF Manual 3.2.2
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    status: "ACTIVE",
  });

  // Menu item picker state
  const [selectedMenuType, setSelectedMenuType] = useState("Master Data");
  const [selectedSubMenu, setSelectedSubMenu] = useState("User Management");
  const [selectedMenuName, setSelectedMenuName] = useState("User");
  const [menuList, setMenuList] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadData();
  }, [search, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getRoles({ search, page, limit });
      if (res?.data) {
        setRoles(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({ id: "", name: "", description: "", status: "ACTIVE" });
    setMenuList([]);
    setSelectedMenuType("Master Data");
    setSelectedSubMenu("User Management");
    setSelectedMenuName("User");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (r: any) => {
    setDialogMode("EDIT");
    setForm({
      id: r.id,
      name: r.name || "",
      description: r.description || "",
      status: r.status || "ACTIVE",
    });
    // Default standard menus based on role
    setMenuList([
      { menu_type: "Master Data", sub_menu: "User Management", menu_name: "User" },
      { menu_type: "Transaksi Users", sub_menu: "Permintaan", menu_name: "Usulan Permintaan I" },
    ]);
    setIsDialogOpen(true);
  };

  const handleAddMenuToList = () => {
    if (!selectedMenuType || !selectedSubMenu || !selectedMenuName) return;
    const exists = menuList.some(
      (m) => m.menu_type === selectedMenuType && m.sub_menu === selectedSubMenu && m.menu_name === selectedMenuName
    );
    if (exists) {
      toast.error("Menu ini sudah ditambahkan ke daftar");
      return;
    }
    setMenuList([...menuList, { menu_type: selectedMenuType, sub_menu: selectedSubMenu, menu_name: selectedMenuName }]);
  };

  const handleRemoveMenu = (index: number) => {
    setMenuList(menuList.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({ id: "", name: "", description: "", status: "ACTIVE" });
      setMenuList([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const code = form.name.trim().toUpperCase().replace(/\s+/g, "_");
      const payload = { ...form, code };
      if (dialogMode === "CREATE") {
        await masterService.createRole(payload);
        toast.success("Data peran (Role) baru berhasil disimpan!");
      } else {
        await masterService.updateRole(form.id, payload);
        toast.success("Data peran (Role) berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan peran");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteRole(deleteTarget.id);
      toast.success(`${deleteTarget.name} berhasil dihapus!`);
      setDeleteTarget(null);
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus peran");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" /> Master Role (Bab 3.2)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Penetapan peran jabatan dan kewenangan akses menu pengguna PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Peran Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List Role</CardTitle>
                <CardDescription className="text-xs">
                  Daftar peran yang sudah terdaftar pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama peran..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                  <tr>
                    <th className="py-3 px-4">Nama Peran (Role Name)</th>
                    <th className="py-3 px-4">Deskripsi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Memuat data peran...</td></tr>
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada peran terdaftar.</td></tr>
                  ) : (
                    roles.map((r: any) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-bold text-foreground">{r.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{r.description || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={r.status === "ACTIVE" || r.is_active ? "bg-emerald-100 text-emerald-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {r.status === "ACTIVE" || r.is_active ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(r)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: r.id, name: r.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <DataTablePagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                isLoading={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* DIALOG FORM ROLE (Bab 3.2.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-primary" />
                {dialogMode === "CREATE" ? "Form Role - Tambah Data" : "Form Role - Ubah Data"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION 1: ROLE INFO */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-primary" />
                  1. Informasi Peran (Role)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Role Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Supervisor Pengadaan"
                      className="text-xs mt-1 font-medium"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk memasukkan nama peran</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Status *</Label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Non-Aktif</option>
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk menentukan status data peran</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Deskripsi kewenangan dan tanggung jawab peran..."
                    className="text-xs mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk menambahkan deskripsi peran</p>
                </div>
              </div>

              {/* SECTION 2: MENU ASSIGNMENT */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Menu className="w-4 h-4 text-primary" />
                  2. Hak Akses Menu Aplikasi
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label className="text-xs font-semibold">Menu Type</Label>
                    <select
                      value={selectedMenuType}
                      onChange={(e) => {
                        setSelectedMenuType(e.target.value);
                        const subTypes = Object.keys(MENU_OPTIONS[e.target.value] || {});
                        setSelectedSubMenu(subTypes[0] || "");
                        setSelectedMenuName(MENU_OPTIONS[e.target.value]?.[subTypes[0]]?.[0] || "");
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    >
                      {Object.keys(MENU_OPTIONS).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Sub Menu</Label>
                    <select
                      value={selectedSubMenu}
                      onChange={(e) => {
                        setSelectedSubMenu(e.target.value);
                        setSelectedMenuName(MENU_OPTIONS[selectedMenuType]?.[e.target.value]?.[0] || "");
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    >
                      {Object.keys(MENU_OPTIONS[selectedMenuType] || {}).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Menu Name</Label>
                    <div className="flex gap-2 mt-1">
                      <select
                        value={selectedMenuName}
                        onChange={(e) => setSelectedMenuName(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                      >
                        {(MENU_OPTIONS[selectedMenuType]?.[selectedSubMenu] || []).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddMenuToList}
                        className="h-9 px-3 text-xs shrink-0 gap-1 bg-primary text-primary-foreground font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add To List
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Table Menu List */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Menu Type</th>
                        <th className="py-2.5 px-3">Sub Menu</th>
                        <th className="py-2.5 px-3">Menu Name</th>
                        <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {menuList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            Belum ada hak akses menu ditambahkan ke daftar peran ini.
                          </td>
                        </tr>
                      ) : (
                        menuList.map((m, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-medium text-foreground">{m.menu_type}</td>
                            <td className="py-2 px-3 text-muted-foreground">{m.sub_menu}</td>
                            <td className="py-2 px-3 font-semibold text-primary">{m.menu_name}</td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMenu(idx)}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION FOOTER: [Back], [Cancel], [Delete], [Save] */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs"
                >
                  Back (Kembali)
                </Button>

                <div className="flex items-center gap-2">
                  {dialogMode === "EDIT" && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteTarget({ id: form.id, name: form.name })}
                      className="text-xs gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete (Hapus)
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    className="text-xs"
                  >
                    Cancel (Kosongkan)
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs font-semibold"
                  >
                    {isSubmitting ? "Menyimpan..." : "Save (Simpan)"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ALERT DIALOG HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Peran
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data peran <strong>{deleteTarget?.name}</strong>?
                Data peran yang sudah pernah digunakan pada form User Role tidak dapat dihapus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleExecuteDelete} className="bg-red-600 hover:bg-red-700 text-xs">
                Ya, Hapus Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

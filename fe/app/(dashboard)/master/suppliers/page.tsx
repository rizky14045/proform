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
import { Truck, Search, Plus, Pencil, Trash2, AlertCircle, Building2, PhoneCall, Mail, MapPin } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { Supplier, PaginationMeta } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import toast from "react-hot-toast";

export default function MasterSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form state according to PDF Manual 3.7.2
  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    pic_name: "",
    address: "",
    address_2: "",
    address_3: "",
    phone: "",
    fax: "",
    email: "",
    status: "ACTIVE",
    // Informasi Pesanan
    order_pic_name: "",
    order_pic_email: "",
    order_pic_phone: "",
    order_pic_address: "",
    order_pic_address_2: "",
    order_pic_address_3: "",
  });

  useEffect(() => {
    loadData();
  }, [search, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getSuppliers({ search, page, limit });
      if (res?.data) {
        setSuppliers(res.data);
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
    setForm({
      id: "",
      code: "",
      name: "",
      pic_name: "",
      address: "",
      address_2: "",
      address_3: "",
      phone: "",
      fax: "",
      email: "",
      status: "ACTIVE",
      order_pic_name: "",
      order_pic_email: "",
      order_pic_phone: "",
      order_pic_address: "",
      order_pic_address_2: "",
      order_pic_address_3: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setDialogMode("EDIT");
    setForm({
      id: s.id,
      code: s.code || "",
      name: s.name || "",
      pic_name: s.pic_name || "",
      address: s.address || "",
      address_2: s.address_2 || "",
      address_3: s.address_3 || "",
      phone: s.phone || "",
      fax: s.fax || "",
      email: s.email || "",
      status: s.status || "ACTIVE",
      order_pic_name: s.order_pic_name || "",
      order_pic_email: s.order_pic_email || "",
      order_pic_phone: s.order_pic_phone || "",
      order_pic_address: s.order_pic_address || "",
      order_pic_address_2: s.order_pic_address_2 || "",
      order_pic_address_3: s.order_pic_address_3 || "",
    });
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({
        id: "",
        code: "",
        name: "",
        pic_name: "",
        address: "",
        address_2: "",
        address_3: "",
        phone: "",
        fax: "",
        email: "",
        status: "ACTIVE",
        order_pic_name: "",
        order_pic_email: "",
        order_pic_phone: "",
        order_pic_address: "",
        order_pic_address_2: "",
        order_pic_address_3: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        address: [form.address, form.address_2, form.address_3].filter(Boolean).join(" \n"),
        order_pic_address: [form.order_pic_address, form.order_pic_address_2, form.order_pic_address_3].filter(Boolean).join(" \n"),
      };
      if (dialogMode === "CREATE") {
        await masterService.createSupplier(payload);
        toast.success("Data supplier berhasil disimpan!");
      } else {
        await masterService.updateSupplier(form.id, payload);
        toast.success("Data supplier berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan data supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteSupplier(deleteTarget.id);
      toast.success(`${deleteTarget.name} berhasil dihapus!`);
      setDeleteTarget(null);
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus supplier");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" /> Master Supplier (Bab 3.7)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Pendaftaran vendor, kontraktor, dan rekanan resmi penyedia barang/jasa PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Supplier Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List Supplier</CardTitle>
                <CardDescription className="text-xs">
                  Daftar rekanan yang terdaftar pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode / nama supplier..."
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
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Nama Rekanan / Perusahaan</th>
                    <th className="py-3 px-4">Nama Kontak (PIC)</th>
                    <th className="py-3 px-4">No. Telp / Fax</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat data supplier...</td></tr>
                  ) : suppliers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada supplier terdaftar.</td></tr>
                  ) : (
                    suppliers.map((s: any) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-medium">{s.code}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{s.name}</td>
                        <td className="py-3 px-4">{s.pic_name || "-"}</td>
                        <td className="py-3 px-4 text-xs">
                          <div>{s.phone || "-"}</div>
                          {s.fax && <div className="text-muted-foreground">Fax: {s.fax}</div>}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">{s.email || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {s.status === "ACTIVE" ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(s)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: s.id, name: s.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
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

        {/* DIALOG FORM SUPPLIER (Bab 3.7.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Building2 className="w-5 h-5 text-primary" />
                {dialogMode === "CREATE" ? "Form Supplier - Tambah Data" : "Form Supplier - Ubah Data"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* BAGIAN 1: INFORMASI POKOK */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-primary" />
                  1. Informasi Pokok Supplier
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Kode *</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUP-001"
                      className="text-xs mt-1 font-mono uppercase"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk memasukkan kode supplier</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Nama *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. PT Mitra Rekayasa Mandiri"
                      className="text-xs mt-1 font-medium"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Nama perusahaan atau badan usaha supplier</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Nama Kontak</Label>
                    <Input
                      value={form.pic_name}
                      onChange={(e) => setForm({ ...form, pic_name: e.target.value })}
                      placeholder="Nama PIC yang dapat dihubungi"
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Email *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="info@rekanan.com"
                      className="text-xs mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">No. Telp. *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="021-xxxxxxx / 0812xxxxxxx"
                      className="text-xs mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Fax</Label>
                    <Input
                      value={form.fax}
                      onChange={(e) => setForm({ ...form, fax: e.target.value })}
                      placeholder="021-xxxxxxx"
                      className="text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Alamat 1 - 3</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Alamat Baris 1 (Gedung, Jalan, No)"
                    className="text-xs"
                  />
                  <Input
                    value={form.address_2}
                    onChange={(e) => setForm({ ...form, address_2: e.target.value })}
                    placeholder="Alamat Baris 2 (Kelurahan, Kecamatan, Kota)"
                    className="text-xs"
                  />
                  <Input
                    value={form.address_3}
                    onChange={(e) => setForm({ ...form, address_3: e.target.value })}
                    placeholder="Alamat Baris 3 (Provinsi, Kode Pos)"
                    className="text-xs"
                  />
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
                </div>
              </div>

              {/* BAGIAN 2: INFORMASI PESANAN */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-primary" />
                  2. Informasi Pesanan (Purchase Order PIC)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Nama Kontak (Pesanan)</Label>
                    <Input
                      value={form.order_pic_name}
                      onChange={(e) => setForm({ ...form, order_pic_name: e.target.value })}
                      placeholder="PIC supplier untuk pesanan/PO"
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Email (Pesanan)</Label>
                    <Input
                      type="email"
                      value={form.order_pic_email}
                      onChange={(e) => setForm({ ...form, order_pic_email: e.target.value })}
                      placeholder="po-order@rekanan.com"
                      className="text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">No. Telp (Pesanan)</Label>
                    <Input
                      value={form.order_pic_phone}
                      onChange={(e) => setForm({ ...form, order_pic_phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Alamat 1 - 3 (Informasi Pesanan)</Label>
                  <Input
                    value={form.order_pic_address}
                    onChange={(e) => setForm({ ...form, order_pic_address: e.target.value })}
                    placeholder="Alamat Pesanan Baris 1"
                    className="text-xs"
                  />
                  <Input
                    value={form.order_pic_address_2}
                    onChange={(e) => setForm({ ...form, order_pic_address_2: e.target.value })}
                    placeholder="Alamat Pesanan Baris 2"
                    className="text-xs"
                  />
                  <Input
                    value={form.order_pic_address_3}
                    onChange={(e) => setForm({ ...form, order_pic_address_3: e.target.value })}
                    placeholder="Alamat Pesanan Baris 3"
                    className="text-xs"
                  />
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
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Supplier
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data supplier <strong>{deleteTarget?.name}</strong>?
                Data yang sudah pernah digunakan dalam transaksi tidak dapat dihapus.
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

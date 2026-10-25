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
  DialogFooter,
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
import { Truck, Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { Supplier } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function MasterSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    npwp: "",
    email: "",
    phone: "",
    address: "",
    category: "BARANG",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getSuppliers(search);
      if (res?.data) setSuppliers(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({ id: "", code: "", name: "", npwp: "", email: "", phone: "", address: "", category: "BARANG", status: "ACTIVE" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setDialogMode("EDIT");
    setForm({
      id: s.id,
      code: s.code || "",
      name: s.name || "",
      npwp: s.npwp || "",
      email: s.email || "",
      phone: s.phone || "",
      address: s.address || "",
      category: s.category || "BARANG",
      status: s.status || "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (dialogMode === "CREATE") {
        await masterService.createSupplier(form);
        toast.success("Rekanan (Supplier) baru berhasil didaftarkan!");
      } else {
        await masterService.updateSupplier(form.id, form);
        toast.success("Data rekanan berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan data rekanan");
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
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus rekanan");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" /> Master Rekanan (Suppliers)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Pendaftaran vendor, kontraktor, dan rekanan resmi penyedia barang/jasa UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Daftarkan Rekanan Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Daftar Mitra Rekanan</CardTitle>
                <CardDescription className="text-xs">
                  Modul ini diakses oleh Tim Pengadaan dan Administrator.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama / kode rekanan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                    <th className="py-3 px-4">Kode Rekanan</th>
                    <th className="py-3 px-4">Nama Perusahaan / Rekanan</th>
                    <th className="py-3 px-4">NPWP</th>
                    <th className="py-3 px-4">Email & Kontak</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat data rekanan...</td></tr>
                  ) : suppliers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada rekanan terdaftar.</td></tr>
                  ) : (
                    suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-medium">{s.code}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{s.name}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{s.npwp || "-"}</td>
                        <td className="py-3 px-4 text-xs">
                          <div>{s.email}</div>
                          <div className="text-muted-foreground">{s.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge color="secondary">{s.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{s.status}</Badge>
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
          </CardContent>
        </Card>

        {/* DIALOG FORM SUPPLIERS */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "CREATE" ? "Daftarkan Rekanan Baru" : "Ubah Data Rekanan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Kode Rekanan *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUP-001"
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">NPWP Perusahaan</Label>
                  <Input
                    value={form.npwp}
                    onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                    placeholder="00.000.000.0-000.000"
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Nama Perusahaan / Rekanan *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="PT Mitra Nusantara Sejahtera"
                  className="text-xs mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email Resmi *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@rekanan.com"
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">No. Telepon / Fax</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="021-..."
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Kategori Rekanan</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                >
                  <option value="BARANG">Penyedia Barang / Material</option>
                  <option value="JASA">Penyedia Jasa Konstruksi / Maintenance</option>
                  <option value="KONSULTAN">Jasa Konsultansi / Supervisi</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Alamat Lengkap Perusahaan</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Rekanan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ALERT DIALOG HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Rekanan
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data rekanan <strong>{deleteTarget?.name}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batalkan</AlertDialogCancel>
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

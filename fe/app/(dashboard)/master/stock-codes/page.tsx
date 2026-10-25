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
import { Package, Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { StockCode } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function MasterStockCodesPage() {
  const [stockCodes, setStockCodes] = useState<StockCode[]>([]);
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
    uoi: "PCS",
    category: "MEKANIKAL",
    soh: 0,
    bin_location: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getStockCodes(search);
      if (res?.data) setStockCodes(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({ id: "", code: "", name: "", uoi: "PCS", category: "MEKANIKAL", soh: 0, bin_location: "", description: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sc: StockCode) => {
    setDialogMode("EDIT");
    setForm({
      id: sc.id,
      code: sc.code || "",
      name: sc.name || "",
      uoi: sc.uoi || "PCS",
      category: sc.category || "MEKANIKAL",
      soh: sc.soh || 0,
      bin_location: sc.bin_location || "",
      description: sc.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, soh: Number(form.soh) || 0 };
      if (dialogMode === "CREATE") {
        await masterService.createStockCode(payload);
        toast.success("Stock Code katalog baru berhasil disimpan!");
      } else {
        await masterService.updateStockCode(form.id, payload);
        toast.success("Data Stock Code berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan stock code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteStockCode(deleteTarget.id);
      toast.success(`${deleteTarget.name} berhasil dihapus!`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus stock code");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SPV_INVENTORY", "STAFF_INVENTORY", "SPV_GUDANG", "STAFF_GUDANG"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" /> Master Stock Code Material
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Standarisasi katalog material, satuan, kategori suku cadang, dan pemetaan bin lokasi gudang UP Muara Tawar
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Stock Code
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Katalog Stock Code Aktif</CardTitle>
                <CardDescription className="text-xs">
                  Dikelola oleh Tim Perencanaan Inventori (Kataloger) dan Administrasi Gudang.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari stock code / nama barang..."
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
                    <th className="py-3 px-4">Stock Code</th>
                    <th className="py-3 px-4">Nama Barang / Material</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Satuan (UOI)</th>
                    <th className="py-3 px-4">Stock on Hand (SOH)</th>
                    <th className="py-3 px-4">Lokasi Bin Rak</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat katalog stock code...</td></tr>
                  ) : stockCodes.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada katalog stock code.</td></tr>
                  ) : (
                    stockCodes.map((sc) => (
                      <tr key={sc.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{sc.code}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{sc.name}</td>
                        <td className="py-3 px-4"><Badge variant="outline">{sc.category}</Badge></td>
                        <td className="py-3 px-4">{sc.uoi || "PCS"}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{sc.soh}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{sc.bin_location || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(sc)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: sc.id, name: `${sc.code} - ${sc.name}` })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
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

        {/* DIALOG FORM STOCK CODE */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "CREATE" ? "Tambah Stock Code Baru" : "Ubah Data Stock Code"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Stock Code *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. 1001-FLT-OIL"
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Satuan (UOI) *</Label>
                  <Input
                    value={form.uoi}
                    onChange={(e) => setForm({ ...form, uoi: e.target.value.toUpperCase() })}
                    placeholder="PCS / SET / LTR"
                    className="text-xs mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Nama Barang / Material *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Deskripsi barang katalog..."
                  className="text-xs mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Kategori Material</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                  >
                    <option value="MEKANIKAL">Mekanikal</option>
                    <option value="ELEKTRIKAL">Elektrikal</option>
                    <option value="INSTRUMEN">Instrumen & Kontrol</option>
                    <option value="KIMIA">Bahan Kimia / Gas</option>
                    <option value="UMUM">Material Umum / Habis Pakai</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Stock on Hand (SOH)</Label>
                  <Input
                    type="number"
                    value={form.soh}
                    onChange={(e) => setForm({ ...form, soh: Number(e.target.value) || 0 })}
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Lokasi Bin Rak Gudang</Label>
                <Input
                  value={form.bin_location}
                  onChange={(e) => setForm({ ...form, bin_location: e.target.value.toUpperCase() })}
                  placeholder="e.g. G1-RACK-A3"
                  className="text-xs mt-1 font-mono"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Stock Code"}
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
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Stock Code
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data stock code <strong>{deleteTarget?.name}</strong>?
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


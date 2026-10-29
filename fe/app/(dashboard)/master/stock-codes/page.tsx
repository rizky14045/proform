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
import { Package, Search, Plus, Pencil, Trash2, AlertCircle, Warehouse, Layers, Tag, BarChart3 } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { StockCode, PaginationMeta } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import toast from "react-hot-toast";

export default function MasterStockCodesPage() {
  const [stockCodes, setStockCodes] = useState<StockCode[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form state according to PDF Manual 3.8.2
  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    uoi: "PCS",
    soh: 0,
    description_1: "",
    description_2: "",
    description_3: "",
    description_4: "",
    mnemonic: "",
    part_number: "",
    warehouse_code: "GUDANG_SEMBALANG_UTAMA",
    bin_location: "",
    dues_in: 0,
    dues_out: 0,
    rop: 0,
    roq: 0,
    invent_cost_pr: 0,
    invent_value: 0,
    reorder_qty: 0,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, [search, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getStockCodes({ search, page, limit });
      if (res?.data) {
        setStockCodes(res.data);
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
      uoi: "PCS",
      soh: 0,
      description_1: "",
      description_2: "",
      description_3: "",
      description_4: "",
      mnemonic: "",
      part_number: "",
      warehouse_code: "GUDANG_SEMBALANG_UTAMA",
      bin_location: "",
      dues_in: 0,
      dues_out: 0,
      rop: 0,
      roq: 0,
      invent_cost_pr: 0,
      invent_value: 0,
      reorder_qty: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sc: any) => {
    setDialogMode("EDIT");
    setForm({
      id: sc.id,
      code: sc.code || "",
      name: sc.name || "",
      uoi: sc.uoi || "PCS",
      soh: Number(sc.soh) || 0,
      description_1: sc.description || "",
      description_2: sc.description_2 || "",
      description_3: sc.description_3 || "",
      description_4: sc.description_4 || "",
      mnemonic: sc.mnemonic || "",
      part_number: sc.part_number || "",
      warehouse_code: sc.warehouse_code || "GUDANG_SEMBALANG_UTAMA",
      bin_location: sc.bin_location || "",
      dues_in: Number(sc.dues_in) || 0,
      dues_out: Number(sc.dues_out) || 0,
      rop: Number(sc.rop) || 0,
      roq: Number(sc.roq) || 0,
      invent_cost_pr: Number(sc.invent_cost_pr) || 0,
      invent_value: Number(sc.invent_value) || 0,
      reorder_qty: Number(sc.reorder_qty) || 0,
      is_active: sc.is_active !== undefined ? sc.is_active : true,
    });
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({
        id: "",
        code: "",
        name: "",
        uoi: "PCS",
        soh: 0,
        description_1: "",
        description_2: "",
        description_3: "",
        description_4: "",
        mnemonic: "",
        part_number: "",
        warehouse_code: "GUDANG_SEMBALANG_UTAMA",
        bin_location: "",
        dues_in: 0,
        dues_out: 0,
        rop: 0,
        roq: 0,
        invent_cost_pr: 0,
        invent_value: 0,
        reorder_qty: 0,
        is_active: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        description: [form.description_1, form.description_2, form.description_3, form.description_4].filter(Boolean).join(" | "),
      };
      if (dialogMode === "CREATE") {
        await masterService.createStockCode(payload);
        toast.success("Stock code baru berhasil ditambahkan!");
      } else {
        await masterService.updateStockCode(form.id, payload);
        toast.success("Data stock code berhasil diperbarui!");
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
      setIsDialogOpen(false);
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
              <Package className="h-6 w-6 text-primary" /> Master Stock Code (Bab 3.8)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Katalog material suku cadang, satuan UOI, SOH, bin lokasi, ROP, dan nilai inventori PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Stock Code Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List Stock Code</CardTitle>
                <CardDescription className="text-xs">
                  Daftar katalog stock code yang sudah tercatat pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari stock code / nama material..."
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
                    <th className="py-3 px-4">Nama Stock Code</th>
                    <th className="py-3 px-4">UOI (Satuan)</th>
                    <th className="py-3 px-4">SOH</th>
                    <th className="py-3 px-4">No. Part / Mnemonic</th>
                    <th className="py-3 px-4">Bin Lokasi</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat katalog stock code...</td></tr>
                  ) : stockCodes.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada katalog stock code.</td></tr>
                  ) : (
                    stockCodes.map((sc: any) => (
                      <tr key={sc.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{sc.code}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{sc.name}</td>
                        <td className="py-3 px-4">{sc.uoi || "PCS"}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{Number(sc.soh || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                          {sc.part_number ? `PN: ${sc.part_number}` : (sc.mnemonic || "-")}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{sc.bin_location || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(sc)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: sc.id, name: sc.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
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

        {/* DIALOG FORM STOCK CODE (Bab 3.8.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Package className="w-5 h-5 text-primary" />
                {dialogMode === "CREATE" ? "Form Stock Code - Tambah Data" : "Form Stock Code - Ubah Data"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION 1: IDENTITAS STOCK CODE */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Tag className="w-4 h-4 text-primary" />
                  1. Identitas Stock Code & Material
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Kode *</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. 1001-FLT-09"
                      className="text-xs mt-1 font-mono uppercase"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Kode unik stock code katalog</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-semibold">Nama *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Filter Element Oil Separator GT"
                      className="text-xs mt-1 font-medium"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Nama barang / material stock code</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">UOI (Unit of Issue) *</Label>
                    <Input
                      value={form.uoi}
                      onChange={(e) => setForm({ ...form, uoi: e.target.value.toUpperCase() })}
                      placeholder="PCS / SET / EA / LTR / KG"
                      className="text-xs mt-1 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">SOH (Stock on Hand)</Label>
                    <Input
                      type="number"
                      value={form.soh}
                      onChange={(e) => setForm({ ...form, soh: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Mnemonic</Label>
                    <Input
                      value={form.mnemonic}
                      onChange={(e) => setForm({ ...form, mnemonic: e.target.value })}
                      placeholder="Nomor mnemonic"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">No. Part</Label>
                    <Input
                      value={form.part_number}
                      onChange={(e) => setForm({ ...form, part_number: e.target.value })}
                      placeholder="Nomor part pabrikan"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Deskripsi 1 - 4</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={form.description_1}
                      onChange={(e) => setForm({ ...form, description_1: e.target.value })}
                      placeholder="Deskripsi 1: Spesifikasi teknis utama"
                      className="text-xs"
                    />
                    <Input
                      value={form.description_2}
                      onChange={(e) => setForm({ ...form, description_2: e.target.value })}
                      placeholder="Deskripsi 2: Dimensi & ukuran"
                      className="text-xs"
                    />
                    <Input
                      value={form.description_3}
                      onChange={(e) => setForm({ ...form, description_3: e.target.value })}
                      placeholder="Deskripsi 3: Standar material / grade"
                      className="text-xs"
                    />
                    <Input
                      value={form.description_4}
                      onChange={(e) => setForm({ ...form, description_4: e.target.value })}
                      placeholder="Deskripsi 4: Merk / aplikasi mesin"
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOKASI PENYIMPANAN & LOGISTIK */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Warehouse className="w-4 h-4 text-primary" />
                  2. Lokasi Gudang & Pengaturan Pengadaan (ROP / ROQ)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Gudang</Label>
                    <select
                      value={form.warehouse_code}
                      onChange={(e) => setForm({ ...form, warehouse_code: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    >
                      <option value="GUDANG_SEMBALANG_UTAMA">Gudang Utama UP Sembalang</option>
                      <option value="GUDANG_TURBIN">Gudang Spare Part Turbin & Boiler</option>
                      <option value="GUDANG_KIMIA">Gudang Bahan Kimia & Pelumas</option>
                      <option value="GUDANG_TRANSIT">Gudang Transit Penerimaan</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Bin Lokasi</Label>
                    <Input
                      value={form.bin_location}
                      onChange={(e) => setForm({ ...form, bin_location: e.target.value.toUpperCase() })}
                      placeholder="e.g. RAK-A3-B2"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Dues In</Label>
                    <Input
                      type="number"
                      value={form.dues_in}
                      onChange={(e) => setForm({ ...form, dues_in: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Dues Out</Label>
                    <Input
                      type="number"
                      value={form.dues_out}
                      onChange={(e) => setForm({ ...form, dues_out: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">ROP (Reorder Point)</Label>
                    <Input
                      type="number"
                      value={form.rop}
                      onChange={(e) => setForm({ ...form, rop: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono text-amber-600 font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">ROQ (Reorder Quantity)</Label>
                    <Input
                      type="number"
                      value={form.roq}
                      onChange={(e) => setForm({ ...form, roq: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Invent Cost PR (Rp)</Label>
                    <Input
                      type="number"
                      value={form.invent_cost_pr}
                      onChange={(e) => setForm({ ...form, invent_cost_pr: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Invent Value (Rp)</Label>
                    <Input
                      type="number"
                      value={form.invent_value}
                      onChange={(e) => setForm({ ...form, invent_value: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Reorder Qty</Label>
                    <Input
                      type="number"
                      value={form.reorder_qty}
                      onChange={(e) => setForm({ ...form, reorder_qty: Number(e.target.value) || 0 })}
                      placeholder="0"
                      className="text-xs mt-1 font-mono"
                    />
                  </div>
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
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Stock Code
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data stock code <strong>{deleteTarget?.name}</strong>?
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

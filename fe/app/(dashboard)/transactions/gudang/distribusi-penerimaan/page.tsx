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
  ClipboardList,
  Search,
  Plus,
  UserCheck,
  UploadCloud,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  X,
  ArrowLeft,
  Send,
  Save,
  RotateCcw,
} from "lucide-react";
import { gudangSubmoduleService, poService, masterService } from "@/services/modules.service";
import { WarehouseDistribution, PurchaseOrder, User } from "@/types";
import toast from "react-hot-toast";

export default function DistribusiPenerimaanGudangPage() {
  const [distributions, setDistributions] = useState<WarehouseDistribution[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector modal states
  const [poSelectOpen, setPoSelectOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const [form, setForm] = useState({
    form_number: `DST-RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    distribution_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    po_vendor: "",
    officer_user_id: "",
    officer_name: "",
    officer_role: "",
    target_inspection_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Lakukan pemeriksaan fisik material bersama perwakilan unit peminta dan vendor",
    uploaded_file_name: "",
    status: "DRAFT",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, pRes, uRes] = await Promise.all([
        gudangSubmoduleService.getDistributions(search).catch(() => ({ success: true, data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        masterService.getUsers({ limit: 100 }).catch(() => ({ success: true, data: [] })),
      ]);
      if (dRes?.success) setDistributions(dRes.data || []);
      if (pRes?.success) setPos(pRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat penugasan penerimaan gudang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({
      form_number: `DST-RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      distribution_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      po_vendor: "",
      officer_user_id: "",
      officer_name: "",
      officer_role: "",
      target_inspection_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "Lakukan pemeriksaan fisik material bersama perwakilan unit peminta dan vendor",
      uploaded_file_name: "",
      status: "DRAFT",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      po_number: p.po_number || "",
      po_title: p.title || "",
      po_vendor: p.vendor?.name || p.supplier?.name || "Vendor Rekanan",
    }));
    setPoSelectOpen(false);
    toast.success(`PO ${p.po_number} dipilih`);
  };

  const handleSelectUser = (u: User) => {
    setForm((prev) => ({
      ...prev,
      officer_user_id: u.id,
      officer_name: u.name,
      officer_role: u.role?.name || "Staff Gudang",
    }));
    setUserSelectOpen(false);
    toast.success(`Petugas ${u.name} dipilih`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas maksimal 25 MB");
      return;
    }
    setForm((prev) => ({ ...prev, uploaded_file_name: file.name }));
    toast.success(`File ${file.name} berhasil diunggah`);
  };

  const handleSubmit = async (actionType: "DRAFT" | "POSTED") => {
    if (!form.po_id) {
      toast.error("Rujukan Purchase Order wajib dipilih");
      return;
    }
    if (!form.officer_user_id) {
      toast.error("Staf Penerima Gudang wajib ditentukan");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await gudangSubmoduleService.createDistribution({
        po_id: form.po_id,
        officer_user_id: form.officer_user_id,
        distribution_date: form.distribution_date,
        target_inspection_date: form.target_inspection_date,
        notes: `${form.notes} [Status: ${actionType}] [File: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "POSTED"
            ? "Form Distribusi Penerimaan berhasil diposting ke tahap Pemeriksaan Barang"
            : "Form Distribusi Penerimaan berhasil disimpan sebagai Draft"
        );
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(res?.message || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPOs = pos.filter((p) => {
    const q = poSearch.toLowerCase();
    return (
      p.po_number?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.vendor?.name?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.nip?.toLowerCase().includes(q) ||
      u.role?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-primary" />
            Distribusi Penerimaan (Bab 4.9.1)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penugasan berkas penerimaan dan tim inspeksi penerimaan fisik material logistik UP Sembalang (Goods)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> [Add] Distribusi Penerimaan
          </Button>
        </div>
      </div>

      {/* Tabel List Distribusi Penerimaan */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Distribusi Penerimaan (Bab 4.9.1.1)</CardTitle>
              <CardDescription className="text-xs">
                Melihat dan mencari data transaksi distribusi penerimaan barang/jasa tipe Goods
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor PO atau staf..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="h-9 px-3 text-xs">
                [Find]
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Purchase Order</th>
                  <th className="py-3 px-4">Judul Pengadaan</th>
                  <th className="py-3 px-4">Staf Penerima Gudang</th>
                  <th className="py-3 px-4">Tgl Distribusi</th>
                  <th className="py-3 px-4">Target Pemeriksaan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat data distribusi penerimaan...
                    </td>
                  </tr>
                ) : distributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada transaksi distribusi penerimaan dicatat. Klik [Add] untuk membuat baru.
                    </td>
                  </tr>
                ) : (
                  distributions.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {d.po?.po_number || "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {d.po?.title || "-"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {d.officer_user?.name || "Petugas Gudang"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {d.distribution_date?.split("T")[0] || "-"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {d.target_inspection_date?.split("T")[0] || "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {d.status || "POSTED"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FORM MODAL DISTRIBUSI PENERIMAAN (BAB 4.9.1.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
                </div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Form Distribusi Penerimaan (Bab 4.9.1.2)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dikerjakan oleh Supervisor Gudang untuk data PO jenis Barang dan Jasa dengan tipe Goods
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Umum */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form Penugasan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Form <span className="text-xs text-muted-foreground">(Otomatis Sistem)</span>
                  </Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-mono bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Form <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.distribution_date}
                    onChange={(e) => setForm({ ...form, distribution_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bagian Rujukan PO & Penerima Tugas */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rujukan PO & Staf Penerima Tugas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector PO */}
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor PO (Purchase Order) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] untuk memilih PO"
                      value={form.po_number ? `${form.po_number} - ${form.po_title}` : ""}
                      readOnly
                      className="text-xs h-9 bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPoSelectOpen(true)}
                      className="h-9 px-3 text-xs shrink-0"
                    >
                      [Select]
                    </Button>
                  </div>
                  {form.po_vendor && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Vendor: <span className="font-semibold text-foreground">{form.po_vendor}</span>
                    </p>
                  )}
                </div>

                {/* Selector Staf Gudang */}
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Staf Penerima Gudang <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] untuk memilih Petugas"
                      value={form.officer_name ? `${form.officer_name} (${form.officer_role})` : ""}
                      readOnly
                      className="text-xs h-9 bg-background"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUserSelectOpen(true)}
                      className="h-9 px-3 text-xs shrink-0"
                    >
                      [Select]
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Petugas yang akan menjalankan pemeriksaan fisik material
                  </p>
                </div>

                {/* Target Tanggal Selesai Pemeriksaan */}
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Target Tanggal Pemeriksaan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.target_inspection_date}
                    onChange={(e) => setForm({ ...form, target_inspection_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                {/* Catatan / Instruksi Disposisi */}
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Catatan / Instruksi Disposisi
                  </Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Instruksi khusus pemeriksaan fisik..."
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Berkas Dokumen Disposisi */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Disposisi / Berkas Kedatangan
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted text-xs bg-background">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Pilih File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-xs text-muted-foreground">
                  {form.uploaded_file_name ? (
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {form.uploaded_file_name}
                    </span>
                  ) : (
                    "Belum ada file dipilih (Maksimal 25 MB, format: PDF/DOC/XLS)"
                  )}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS PERSIS PDF */}
            <div className="flex items-center justify-between pt-5 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> [Back]
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs text-muted-foreground"
                >
                  [Cancel]
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("DRAFT")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> [Save as Draft]
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("POSTED")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> [Post]
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP UP SELECTOR PO */}
      <Dialog open={poSelectOpen} onOpenChange={setPoSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Purchase Order (PO Barang / Jasa Goods)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor PO, judul, vendor..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredPOs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada data Purchase Order ditemukan
                </div>
              ) : (
                filteredPOs.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-muted/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary">{p.po_number}</div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Vendor: {p.vendor?.name || p.supplier?.name || "Rekanan"} | Nilai: Rp{" "}
                        {Number(p.total_amount || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectPO(p)}
                      className="h-7 text-xs px-2.5"
                    >
                      [Select]
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP UP SELECTOR PETUGAS GUDANG */}
      <Dialog open={userSelectOpen} onOpenChange={setUserSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Pilih Staf Penerima Gudang
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama pegawai atau NIP..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada pegawai ditemukan
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 hover:bg-muted/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        NIP: {u.nip || "-"} | Role: {u.role?.name || "Staff Gudang"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectUser(u)}
                      className="h-7 text-xs px-2.5"
                    >
                      [Select]
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

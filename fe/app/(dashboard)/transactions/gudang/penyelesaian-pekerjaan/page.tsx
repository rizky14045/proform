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
  ClipboardCheck,
  Search,
  Plus,
  Building2,
  Calendar,
  UploadCloud,
  FileText,
  Wrench,
  Percent,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
} from "lucide-react";
import { gudangSubmoduleService, poService } from "@/services/modules.service";
import { JobCompletion, PurchaseOrder } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface ServiceItem {
  id: string;
  service_name: string;
  pr_number: string;
  total_value: number;
  completion_date: string;
  sla_progress: number;
}

export default function PenyelesaianPekerjaanJasaPage() {
  const [completions, setCompletions] = useState<JobCompletion[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector modal
  const [poSelectOpen, setPoSelectOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");

  const [form, setForm] = useState({
    form_number: `LPJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    completion_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    vendor_name: "",
    actual_handover_date: new Date().toISOString().split("T")[0],
    sla_percentage: 100,
    uploaded_file_name: "",
    status: "DRAFT",
    notes: "Pekerjaan jasa pemeliharaan telah diselesaikan 100% sesuai KAK dan lulus uji komisioning",
  });

  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "srv-1",
      service_name: "Jasa Overhaul & Balancing Rotor Generator Turbin Blok 1",
      pr_number: "PR-2026-SRV-0012",
      total_value: 125000000,
      completion_date: new Date().toISOString().split("T")[0],
      sla_progress: 100,
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        gudangSubmoduleService.getCompletions(search).catch(() => ({ success: true, data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ success: true, data: [] })),
      ]);
      if (cRes?.success) setCompletions(cRes.data || []);
      if (pRes?.data) setPos(pRes.data || []);
    } catch {
      toast.error("Gagal memuat laporan penyelesaian pekerjaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({
      form_number: `LPJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      completion_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      vendor_name: "",
      actual_handover_date: new Date().toISOString().split("T")[0],
      sla_percentage: 100,
      uploaded_file_name: "",
      status: "DRAFT",
      notes: "Pekerjaan jasa pemeliharaan telah diselesaikan 100% sesuai KAK dan lulus uji komisioning",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      po_number: p.po_number || "",
      po_title: p.title || "",
      vendor_name: p.vendor?.name || p.supplier?.name || "Vendor Rekanan",
    }));

    setServices([
      {
        id: "srv-po",
        service_name: p.title || "Jasa Pemeliharaan / Konstruksi",
        pr_number: `PR-PO-${p.po_number?.substring(0, 10) || "JASA"}`,
        total_value: Number(p.total_amount || 75000000),
        completion_date: new Date().toISOString().split("T")[0],
        sla_progress: 100,
      },
    ]);

    setPoSelectOpen(false);
    toast.success(`PO ${p.po_number} dipilih`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, uploaded_file_name: res.fileName }));
    }
  };

  const handleSubmit = async (actionType: "DRAFT" | "SUBMITTED") => {
    const validation = validateForm([
      { field: "po_id", label: "Rujukan Purchase Order", value: form.po_id, required: true },
      { field: "actual_handover_date", label: "Tanggal Serah Terima Pekerjaan", value: form.actual_handover_date, required: true, type: "date" },
      { field: "sla_percentage", label: "Persentase Penyelesaian / SLA", value: form.sla_percentage, required: true, type: "percentage" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await gudangSubmoduleService.createCompletion({
        po_id: form.po_id,
        completion_number: form.form_number,
        completion_date: form.actual_handover_date,
        progress_percentage: Number(form.sla_percentage),
        status: actionType === "SUBMITTED" ? "VERIFIED" : "DRAFT",
        notes: `${form.notes} [Tgl Serah Terima: ${form.actual_handover_date}] [File: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "SUBMITTED"
            ? "Laporan Penyelesaian Pekerjaan Jasa dikirim untuk persetujuan [Send For Approval]"
            : "Laporan Penyelesaian Pekerjaan Jasa berhasil disimpan sebagai Draft"
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Penyelesaian Pekerjaan (Bab 4.9.5)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pencatatan realisasi fisik 100%, serah terima hasil pekerjaan jasa, dan evaluasi pemenuhan Service Level Agreement (SLA)
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> [Add] Penyelesaian Pekerjaan
        </Button>
      </div>

      {/* Tabel List */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Penyelesaian Pekerjaan (Bab 4.9.5.1)</CardTitle>
              <CardDescription className="text-xs">
                Melihat dan mencari data transaksi penyelesaian pekerjaan jasa yang sudah tercatat
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor LPJ..."
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
                  <th className="py-3 px-4">No. Form Selesai</th>
                  <th className="py-3 px-4">No. Purchase Order</th>
                  <th className="py-3 px-4 text-center">% Realisasi Fisik</th>
                  <th className="py-3 px-4">Tgl Serah Terima</th>
                  <th className="py-3 px-4">Catatan Uji Kelaikan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat laporan penyelesaian pekerjaan...
                    </td>
                  </tr>
                ) : completions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada transaksi penyelesaian pekerjaan jasa. Klik [Add] untuk membuat baru.
                    </td>
                  </tr>
                ) : (
                  completions.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{c.completion_number}</td>
                      <td className="py-3 px-4 font-mono">{c.po?.po_number || "-"}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {c.progress_percentage}%
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{c.completion_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground max-w-sm truncate">{c.notes || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {c.status}
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

      {/* FORM MODAL PENYELESAIAN PEKERJAAN (BAB 4.9.5.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
              </div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                Form Penyelesaian Pekerjaan (Bab 4.9.5.2)
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dikerjakan oleh Staff User peminta untuk mengesahkan penyelesaian pekerjaan jasa sebelum proses BAST
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form Laporan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    value={form.completion_date}
                    onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Rujukan PO Jasa (Purchase Order) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] PO Jasa"
                      value={form.po_number || ""}
                      readOnly
                      className="text-xs h-9 bg-background font-mono font-semibold"
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
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Serah Terima Pekerjaan (Tgl Serah Terima) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.actual_handover_date}
                    onChange={(e) => setForm({ ...form, actual_handover_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Persentase Penyelesaian / SLA (%) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={form.sla_percentage}
                      onChange={(e) => setForm({ ...form, sla_percentage: Number(e.target.value) })}
                      className="text-xs h-9 pr-8 font-bold text-emerald-600"
                      required
                    />
                    <Percent className="w-3.5 h-3.5 absolute right-2.5 top-3 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Vendor / Pelaksana Jasa</Label>
                  <Input
                    value={form.vendor_name || "Pilih PO Jasa terlebih dahulu"}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Detail Jasa */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Detail Nama Jasa Sesuai PO
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {services.length} Lingkup Jasa
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Nama Jasa Pekerjaan</th>
                      <th className="py-2.5 px-3">Nomor PR / Kontrak</th>
                      <th className="py-2.5 px-3 text-right">Nilai Pekerjaan</th>
                      <th className="py-2.5 px-3">Tanggal Selesai</th>
                      <th className="py-2.5 px-3 text-center">% Realisasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{srv.service_name}</td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{srv.pr_number}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          Rp {srv.total_value.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{srv.completion_date}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="outline" className="text-emerald-600 font-bold">
                            {srv.sla_progress}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Kelaikan */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Catatan Hasil Pengujian / Komisioning Jasa
              </h3>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Deskripsi hasil uji beban, kebersihan lokasi kerja pasca pemeliharaan, dsb."
                className="text-xs h-9"
              />
            </div>

            {/* Upload Laporan Hasil Pekerjaan */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Laporan Hasil Pekerjaan / Berita Acara Uji Beban
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
                  onClick={() => handleSubmit("SUBMITTED")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> [Send For Approval]
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
              Pilih Purchase Order Jasa
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
    </div>
  );
}

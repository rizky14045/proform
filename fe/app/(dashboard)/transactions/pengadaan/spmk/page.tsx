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
  Upload,
  FileText,
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, poService, masterService } from "@/services/modules.service";
import { SPMK, PurchaseOrder, Supplier } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

export default function SPMKPage() {
  const [spmks, setSpmks] = useState<SPMK[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showPoSelectModal, setShowPoSelectModal] = useState(false);
  const [showSupplierSelectModal, setShowSupplierSelectModal] = useState(false);
  const [poFilter, setPoFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Form Fields per Bab 4.8.2.2
  const [form, setForm] = useState({
    spmk_number: "",
    issue_date: new Date().toISOString().split("T")[0],
    po_id: "",
    selected_po_display: "",
    po_title: "",
    vendor_id: "",
    selected_vendor_display: "",
    start_date: new Date().toISOString().split("T")[0],
    completion_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    work_description: "Pelaksanaan pekerjaan pengadaan dan instalasi suku cadang pembangkit",
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, supRes] = await Promise.all([
        pengadaanSubmoduleService.getSPMKs(search),
        poService.getAllPO({ limit: 50 }),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (sRes?.success) setSpmks(sRes.data || []);
      if (pRes?.success) setPos(pRes.data || []);
      if (supRes?.success) setSuppliers(supRes.data || []);
    } catch {
      toast.error("Gagal memuat SPMK");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `SPMK/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      spmk_number: autoNumber,
      issue_date: new Date().toISOString().split("T")[0],
      po_id: "",
      selected_po_display: "",
      po_title: "",
      vendor_id: "",
      selected_vendor_display: "",
      start_date: new Date().toISOString().split("T")[0],
      completion_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      work_description: "Pelaksanaan pekerjaan pengadaan dan instalasi suku cadang pembangkit",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      selected_po_display: `${p.po_number} - ${p.title}`,
      po_title: p.title,
      vendor_id: p.supplier_id || prev.vendor_id,
      selected_vendor_display: p.supplier ? `${p.supplier.name} (${p.supplier.code})` : prev.selected_vendor_display,
    }));
    setShowPoSelectModal(false);
    toast.success(`Paket PO ${p.po_number} terpilih`);
  };

  const handleSelectSupplier = (s: Supplier) => {
    setForm((prev) => ({
      ...prev,
      vendor_id: s.id,
      selected_vendor_display: `${s.name} (${s.code})`,
    }));
    setShowSupplierSelectModal(false);
    toast.success(`Rekanan ${s.name} terpilih`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, file_name: res.fileName, file_uploaded: true }));
    }
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file terlebih dahulu");
    } else {
      toast.success("File telah lolos verifikasi keamanan dan tersimpan");
    }
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    const validation = validateForm([
      { field: "spmk_number", label: "Nomor Dokumen SPMK", value: form.spmk_number, required: true, minLength: 3 },
      { field: "vendor_id", label: "Rekanan / Penyedia Ditunjuk", value: form.vendor_id, required: true },
      { field: "issue_date", label: "Tanggal Penerbitan SPMK", value: form.issue_date, required: true, type: "date" },
      { field: "start_date", label: "Tanggal Mulai Kerja", value: form.start_date, required: true, type: "date" },
      { field: "completion_date", label: "Tanggal Selesai Pekerjaan", value: form.completion_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await pengadaanSubmoduleService.createSPMK({
        po_id: form.po_id,
        vendor_id: form.vendor_id,
        spmk_number: form.spmk_number,
        issue_date: form.issue_date,
        start_date: form.start_date,
        completion_date: form.completion_date,
        work_description: form.work_description,
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Surat Perintah Mulai Kerja (SPMK) berhasil dikirim untuk Approval!"
            : "Surat Perintah Mulai Kerja (SPMK) berhasil disimpan sebagai Draft"
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

  const handleSendForRevision = () => {
    toast("Form dikembalikan ke pembuat SPMK untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredPos = pos.filter(
    (p) =>
      p.po_number.toLowerCase().includes(poFilter.toLowerCase()) ||
      p.title.toLowerCase().includes(poFilter.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierFilter.toLowerCase()) ||
      s.code.toLowerCase().includes(supplierFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
              PT PLN Nusantara Power UP Sembalang
            </Badge>
            <Badge variant="secondary" className="text-xs">Bab 4.8.2</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Surat Perintah Mulai Kerja (SPMK)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan surat perintah mulai kerja resmi kepada rekanan pelaksana proyek atau pengadaan barang di UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Terbitkan SPMK
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar SPMK Diterbitkan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring pelaksanaan pekerjaan rekanan berdasarkan tanggal SPMK
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor SPMK / Rekanan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="text-xs h-9">
                Cari
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Nomor SPMK</th>
                  <th className="py-3 px-4">Rekanan / Perusahaan</th>
                  <th className="py-3 px-4">Deskripsi Pekerjaan</th>
                  <th className="py-3 px-4">Tgl Mulai</th>
                  <th className="py-3 px-4">Tgl Selesai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Memuat data SPMK...
                    </td>
                  </tr>
                ) : spmks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada Surat Perintah Mulai Kerja yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  spmks.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{s.spmk_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {s.vendor?.name || "PT Mitra Rekanan"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-sm truncate">
                        {s.work_description || "-"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{s.start_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.completion_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          {s.status || "ISSUED"}
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

      {/* MODAL FORM SP MULAI KERJA (BAB 4.8.2.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  Form SP Mulai Kerja (SPMK)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.2.2 — Surat Perintah Mulai Kerja kepada Rekanan / Penyedia Jasa
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                UP Sembalang
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {/* SECTION 1: HEADER INFORMASI POKOK */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Identitas Surat SPMK
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form / Surat SPMK *</Label>
                  <Input
                    value={form.spmk_number}
                    onChange={(e) => setForm({ ...form, spmk_number: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Nomor dapat disesuaikan dengan format resmi UP</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Terbit SPMK *</Label>
                  <Input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN PENGADAAN & DATA PERUSAHAAN REKANAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Paket Pengadaan & Rekanan Pelaksana
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pop-up Search Rujukan PO / Paket Pengadaan */}
                <div>
                  <Label className="text-xs font-semibold">Paket Pengadaan / PO Terkait *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_po_display || "Klik Cari untuk memilih paket PO..."}
                      readOnly
                      placeholder="Pilih Paket PO..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowPoSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPoSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                {/* Pop-up Search Data Perusahaan Rekanan */}
                <div>
                  <Label className="text-xs font-semibold">Rekanan / Perusahaan Pelaksana *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_vendor_display || "Klik Cari untuk memilih rekanan..."}
                      readOnly
                      placeholder="Pilih Rekanan..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowSupplierSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowSupplierSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tanggal Mulai Kerja *</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tanggal Selesai Kerja *</Label>
                  <Input
                    type="date"
                    value={form.completion_date}
                    onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Lingkup Pekerjaan / Pengadaan *</Label>
                  <Input
                    value={form.work_description}
                    onChange={(e) => setForm({ ...form, work_description: e.target.value })}
                    placeholder="Contoh: Pelaksanaan overhaul turbin dan penggantian suku cadang filter"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN SPMK (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen SPMK Bertandatangan (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="text-xs h-9 bg-background file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadFile}
                  className="text-xs h-9 shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
              {form.file_name && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">File dipilih:</span>
                  <span className="font-mono font-medium text-foreground">{form.file_name}</span>
                  {form.file_uploaded ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Berhasil Diunggah
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                      Belum Di-upload
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.2.2 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendForRevision}
                  className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Send For Revision
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSubmit("SAVE")}
                  disabled={isSubmitting}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("SEND_FOR_APPROVAL")}
                  disabled={isSubmitting}
                  className="text-xs bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Send For Approval
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL CARI PAKET PO TERKAIT */}
      <Dialog open={showPoSelectModal} onOpenChange={setShowPoSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Paket Pengadaan / PO Terkait
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor PO atau judul pekerjaan..."
                value={poFilter}
                onChange={(e) => setPoFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PO</th>
                    <th className="py-2.5 px-3">Nama Pengadaan</th>
                    <th className="py-2.5 px-3">Rekanan</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredPos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen PO yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredPos.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{p.po_number}</td>
                        <td className="py-2.5 px-3 font-medium">{p.title}</td>
                        <td className="py-2.5 px-3 font-semibold">{p.supplier?.name || "-"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPO(p)}
                            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-white"
                          >
                            [Select]
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL CARI DATA REKANAN / PERUSAHAAN (BAB 4.8.2.2 LANGKAH 6) */}
      <Dialog open={showSupplierSelectModal} onOpenChange={setShowSupplierSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pilih Data Rekanan / Perusahaan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama rekanan atau kode..."
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Kode Rekanan</th>
                    <th className="py-2.5 px-3">Nama Perusahaan</th>
                    <th className="py-2.5 px-3">PIC</th>
                    <th className="py-2.5 px-3">Kota</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Tidak ada data rekanan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{s.code}</td>
                        <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                        <td className="py-2.5 px-3">{s.pic_name || "-"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{s.city || "-"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectSupplier(s)}
                            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-white"
                          >
                            [Select]
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

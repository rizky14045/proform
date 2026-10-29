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
  Files,
  Search,
  Plus,
  Send,
  Upload,
  FileText,
  Building2,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, oeService, masterService } from "@/services/modules.service";
import { QuotationRequest, OwnerEstimate, Supplier } from "@/types";
import toast from "react-hot-toast";

export default function PermintaanPenawaranRFQPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [estimates, setEstimates] = useState<OwnerEstimate[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showHpsSelectModal, setShowHpsSelectModal] = useState(false);
  const [showSupplierSelectModal, setShowSupplierSelectModal] = useState(false);
  const [hpsFilter, setHpsFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Form Fields per Bab 4.8.4.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    oe_id: "",
    selected_hps_display: "",
    work_title: "",
    vendor_id: "",
    selected_vendor_display: "",
    doc_pickup_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    method: "TERTUTUP",
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, oeRes, sRes] = await Promise.all([
        pengadaanSubmoduleService.getQuotations(search),
        oeService.getAllOE(""),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (qRes?.success) setQuotations(qRes.data || []);
      if (oeRes?.success) setEstimates(oeRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
    } catch {
      toast.error("Gagal memuat permintaan penawaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `PP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      oe_id: "",
      selected_hps_display: "",
      work_title: "",
      vendor_id: "",
      selected_vendor_display: "",
      doc_pickup_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      method: "TERTUTUP",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setIsDialogOpen(true);
  };

  const handleSelectHPS = (oe: OwnerEstimate) => {
    setForm((prev) => ({
      ...prev,
      oe_id: oe.id,
      request_id: oe.request_id || oe.id,
      selected_hps_display: `${oe.oe_number} - ${oe.request?.title || "Paket Pengadaan"}`,
      work_title: oe.request?.title || "Pekerjaan Pengadaan",
    }));
    setShowHpsSelectModal(false);
    toast.success(`HPS ${oe.oe_number} terpilih`);
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

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file dokumen RKS / Lampiran terlebih dahulu!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen lampiran penawaran berhasil diunggah!");
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    if (!form.request_id || !form.work_title) {
      toast.error("Silakan lengkapi dokumen HPS dan judul pekerjaan bertanda (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await pengadaanSubmoduleService.createQuotation({
        request_id: form.request_id,
        rfq_number: form.form_number,
        issue_date: form.form_date,
        closing_date: form.submission_deadline,
        method: form.method,
        status: actionType === "POST" ? "POSTED" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "POST"
            ? "Permintaan Penawaran berhasil di-POST dan diterbitkan!"
            : "Permintaan Penawaran berhasil disimpan sebagai Draft"
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
    toast("Form dikembalikan ke pembuat untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredEstimates = estimates.filter(
    (oe) =>
      oe.oe_number.toLowerCase().includes(hpsFilter.toLowerCase()) ||
      (oe.request?.title && oe.request.title.toLowerCase().includes(hpsFilter.toLowerCase()))
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.4</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Files className="w-7 h-7 text-primary" />
            Permintaan Penawaran (RFQ)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan surat permintaan penawaran harga kepada rekanan terpilih (FMT-6.1.2.1.3 & FMT-06.1.2.1.24)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Permintaan Penawaran
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Permintaan Penawaran</CardTitle>
              <CardDescription className="text-xs">
                Monitoring penyampaian dokumen RFQ kepada rekanan dan batas waktu pemasukan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor RFQ / paket..."
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
                  <th className="py-3 px-4">Nomor RFQ / Form</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Tgl Penerbitan</th>
                  <th className="py-3 px-4">Batas Akhir</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Memuat data permintaan penawaran...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada permintaan penawaran yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {q.method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{q.issue_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium">{q.closing_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {q.status || "POSTED"}
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

      {/* MODAL FORM PERMINTAAN PENAWARAN (BAB 4.8.4.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Files className="w-5 h-5 text-primary" />
                  Form Permintaan Penawaran (FMT-6.1.2.1.3)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.4.2 — Pengiriman berkas undangan permintaan penawaran kepada rekanan
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
                <FileText className="w-3.5 h-3.5" /> Identitas Surat Permintaan Penawaran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form Permintaan Penawaran *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN HPS & REKANAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Paket HPS & Rekanan Tujuan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pop-up Search Rujukan HPS */}
                <div>
                  <Label className="text-xs font-semibold">Dokumen HPS Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_hps_display || "Klik Cari untuk memilih dokumen HPS..."}
                      readOnly
                      placeholder="Pilih Dokumen HPS..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowHpsSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHpsSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                {/* Pop-up Search Rekanan Tujuan */}
                <div>
                  <Label className="text-xs font-semibold">Rekanan / Penyedia Dituju</Label>
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

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nama Pekerjaan Pengadaan *</Label>
                  <Input
                    value={form.work_title}
                    onChange={(e) => setForm({ ...form, work_title: e.target.value })}
                    placeholder="Contoh: Pengadaan Filter Intake Air & Sparepart Boiler Unit 1-2"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Batas Pengambilan Dokumen (FMT-06.1.2.15)</Label>
                  <Input
                    type="date"
                    value={form.doc_pickup_deadline}
                    onChange={(e) => setForm({ ...form, doc_pickup_deadline: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Batas Akhir Pemasukan Penawaran *</Label>
                  <Input
                    type="date"
                    value={form.submission_deadline}
                    onChange={(e) => setForm({ ...form, submission_deadline: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN LAMPIRAN (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Lampiran RFQ / RKS (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 25 * 1024 * 1024) {
                        toast.error("Ukuran file melebihi batas maksimal 25MB");
                        return;
                      }
                      setForm((prev) => ({ ...prev, file_name: f.name, file_uploaded: false }));
                    }
                  }}
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

            {/* ACTION BUTTONS PER BAB 4.8.4.2 */}
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
                  onClick={() => handleSubmit("POST")}
                  disabled={isSubmitting}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL CARI DOKUMEN HPS (BAB 4.8.4.2 LANGKAH 4) */}
      <Dialog open={showHpsSelectModal} onOpenChange={setShowHpsSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen HPS (Harga Perkiraan Sendiri)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor HPS atau judul pengadaan..."
                value={hpsFilter}
                onChange={(e) => setHpsFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor HPS</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3 text-right">Nilai Total HPS</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen HPS yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((oe) => (
                      <tr key={oe.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{oe.oe_number}</td>
                        <td className="py-2.5 px-3 font-medium">{oe.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold">
                          Rp {(oe.total_oe_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectHPS(oe)}
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

      {/* POP-UP MODAL CARI DATA REKANAN */}
      <Dialog open={showSupplierSelectModal} onOpenChange={setShowSupplierSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pilih Data Rekanan / Vendor
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
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Perusahaan</th>
                    <th className="py-2.5 px-3">PIC</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada data rekanan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{s.code}</td>
                        <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                        <td className="py-2.5 px-3">{s.pic_name || "-"}</td>
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

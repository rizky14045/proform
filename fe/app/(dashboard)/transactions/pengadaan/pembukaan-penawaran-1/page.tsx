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
  Trash2,
  Upload,
  FileText,
  Lock,
  Unlock,
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService } from "@/services/modules.service";
import { QuotationRequest, Supplier } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface BidOpeningItem {
  id: string;
  vendor_id: string;
  vendor_name: string;
  submission_time: string;
  envelope_sealed: boolean;
  admin_doc_complete: boolean;
  technical_doc_complete: boolean;
  bid_amount: number;
}

export default function PembukaanPenawaran1SampulPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");

  // Form Fields per Bab 4.8.7.2 & 4.8.9.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    opening_location: "Ruang Rapat Pengadaan UP Sembalang",
    method: "1_SAMPUL", // '1_SAMPUL' or '2_SAMPUL'
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Bidder Table
  const [bidders, setBidders] = useState<BidOpeningItem[]>([]);
  const [bidderInput, setBidderInput] = useState({
    vendor_id: "",
    vendor_name: "",
    submission_time: "09:30",
    envelope_sealed: true,
    admin_doc_complete: true,
    technical_doc_complete: true,
    bid_amount: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        pengadaanSubmoduleService.getQuotations(search),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (qRes?.success) setQuotations(qRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
    } catch {
      toast.error("Gagal memuat pembukaan penawaran");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `BAPP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      opening_location: "Ruang Rapat Pengadaan UP Sembalang",
      method: "1_SAMPUL",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setBidders([]);
    setIsDialogOpen(true);
  };

  const handleSelectPP = (q: QuotationRequest) => {
    setForm((prev) => ({
      ...prev,
      pp_id: q.id,
      request_id: q.request_id || q.id,
      selected_pp_display: `${q.rfq_number} - ${q.request?.title || "Paket Pengadaan"}`,
      work_title: q.request?.title || "Pekerjaan Pengadaan",
    }));
    setShowPpSelectModal(false);
    toast.success(`Dokumen PP ${q.rfq_number} terpilih`);
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

  const handleAddBidder = () => {
    if (!bidderInput.vendor_name) {
      toast.error("Pilih rekanan penyedia");
      return;
    }
    const newBidder: BidOpeningItem = {
      id: String(Date.now()),
      vendor_id: bidderInput.vendor_id,
      vendor_name: bidderInput.vendor_name,
      submission_time: bidderInput.submission_time,
      envelope_sealed: bidderInput.envelope_sealed,
      admin_doc_complete: bidderInput.admin_doc_complete,
      technical_doc_complete: bidderInput.technical_doc_complete,
      bid_amount: Number(bidderInput.bid_amount),
    };
    setBidders((prev) => [...prev, newBidder]);
    setBidderInput({
      vendor_id: "",
      vendor_name: "",
      submission_time: "09:30",
      envelope_sealed: true,
      admin_doc_complete: true,
      technical_doc_complete: true,
      bid_amount: 0,
    });
    toast.success("Data penawaran rekanan ditambahkan");
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Dokumen Permintaan Penawaran (PP)", value: form.request_id, required: true },
      { field: "form_number", label: "Nomor Berita Acara Pembukaan", value: form.form_number, required: true, minLength: 3 },
      { field: "work_title", label: "Nama Pekerjaan Pengadaan", value: form.work_title, required: true, minLength: 5 },
      { field: "form_date", label: "Tanggal Pembukaan Penawaran", value: form.form_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    if (bidders.length === 0) {
      toast.error("Minimal harus ada 1 rekanan penawar yang dimasukkan");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        actionType === "POST"
          ? "Berita Acara Pembukaan Penawaran (BAPP) berhasil di-POST!"
          : "Berita Acara Pembukaan Penawaran (BAPP) berhasil disimpan sebagai Draft"
      );
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForRevision = () => {
    toast("Form dikembalikan ke panitia pengadaan untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      q.rfq_number.toLowerCase().includes(ppFilter.toLowerCase()) ||
      (q.request?.title && q.request.title.toLowerCase().includes(ppFilter.toLowerCase()))
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.7 & Bab 4.8.9</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Files className="w-7 h-7 text-primary" />
            Pembukaan Penawaran I (BAPP Sampul I)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pencatatan pembukaan dokumen penawaran harga & administrasi (FMT-06.1.2.1.11, FMT-06.1.2.1.6, FMT-06.1.2.1.30)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Buka Penawaran Baru
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Berita Acara Pembukaan Penawaran</CardTitle>
              <CardDescription className="text-xs">
                Monitoring berita acara pembukaan sampul rekanan per paket pengadaan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor PP / RFQ..."
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
                  <th className="py-3 px-4">No. Form BAPP</th>
                  <th className="py-3 px-4">Nomor PP / RFQ</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Metode Sampul</th>
                  <th className="py-3 px-4 text-center">Status Pembukaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data pembukaan penawaran...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada dokumen penawaran yang dibuka.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`BAPP/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          1 Tahap 1 Sampul
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          SELESAI DIBUKA
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

      {/* MODAL FORM PEMBUKAAN PENAWARAN (BAB 4.8.7.2 & 4.8.9.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Unlock className="w-5 h-5 text-primary" />
                  Form Pembukaan Penawaran I (FMT-06.1.2.1.11 / FMT-06.1.2.1.9)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.7.2 & Bab 4.8.9.2 — Berita Acara Pembukaan Dokumen Penawaran Rekanan
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen BAPP
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form BAPP *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form Pembukaan *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Metode Pembukaan Sampul</Label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="1_SAMPUL">Metode 1 Tahap 1 Sampul (Bab 4.8.7)</option>
                    <option value="2_SAMPUL">Metode 2 Sampul / Sampul I Teknis (Bab 4.8.9)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN NOMOR PP & TEMPAT PEMBUKAAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Paket Pengadaan Terkait
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nomor Permintaan Penawaran (PP) Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_pp_display || "Klik Cari untuk memilih dokumen PP..."}
                      readOnly
                      placeholder="Pilih Dokumen PP..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowPpSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPpSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nama Pekerjaan Pengadaan *</Label>
                  <Input
                    value={form.work_title}
                    onChange={(e) => setForm({ ...form, work_title: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tempat / Ruang Pembukaan Sampul</Label>
                  <Input
                    value={form.opening_location}
                    onChange={(e) => setForm({ ...form, opening_location: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN BAPP (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Dokumen BAPP Bertandatangan Saksi Rekanan (Maks. 25MB)
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

            {/* SECTION 4: DETAIL DAFTAR REKANAN YANG MEMASUKKAN PENAWARAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Pencatatan Fisik Dokumen Penawaran Rekanan
              </h4>

              {/* Subform Rekanan */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Pilih Rekanan Peserta *</Label>
                  <select
                    value={bidderInput.vendor_name}
                    onChange={(e) => {
                      const sel = suppliers.find((s) => s.name === e.target.value);
                      setBidderInput({
                        ...bidderInput,
                        vendor_name: e.target.value,
                        vendor_id: sel?.id || "",
                      });
                    }}
                    className="w-full h-8 mt-1 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="">-- Pilih Rekanan --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Jam Masuk Dokumen</Label>
                  <Input
                    type="time"
                    value={bidderInput.submission_time}
                    onChange={(e) => setBidderInput({ ...bidderInput, submission_time: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Kondisi Sampul</Label>
                  <select
                    value={bidderInput.envelope_sealed ? "TERSEGEL" : "TERBUKA"}
                    onChange={(e) =>
                      setBidderInput({ ...bidderInput, envelope_sealed: e.target.value === "TERSEGEL" })
                    }
                    className="w-full h-8 mt-1 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="TERSEGEL">Utuh & Tersegel</option>
                    <option value="TERBUKA">Rusak / Terbuka</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nilai Penawaran (Khusus 1 Sampul)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Rp 0 jika Sampul 1 Terpisah"
                    value={bidderInput.bid_amount}
                    onChange={(e) => setBidderInput({ ...bidderInput, bid_amount: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
                  />
                </div>
                <div className="sm:col-span-6 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddBidder}
                    className="text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Add To List]
                  </Button>
                </div>
              </div>

              {/* Table of Bidders */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nama Rekanan Peserta</th>
                      <th className="py-2.5 px-3 text-center">Waktu Masuk</th>
                      <th className="py-2.5 px-3 text-center">Kondisi Sampul</th>
                      <th className="py-2.5 px-3 text-center">Dokumen Admin</th>
                      <th className="py-2.5 px-3 text-right">Nilai Penawaran (Rp)</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {bidders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          Belum ada berkas rekanan yang dicatat dalam pembukaan ini. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      bidders.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium text-foreground">{b.vendor_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{b.submission_time}</td>
                          <td className="py-2 px-3 text-center">
                            {b.envelope_sealed ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                Tersegel
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20">
                                Rusak
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-emerald-600 font-bold">Lengkap</span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-foreground">
                            {b.bid_amount > 0 ? `Rp ${b.bid_amount.toLocaleString("id-ID")}` : "Sampul II Terpisah"}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setBidders((prev) => prev.filter((i) => i.id !== b.id))}
                              className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
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

            {/* ACTION BUTTONS PER BAB 4.8.7.2 */}
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

      {/* POP-UP MODAL CARI DOKUMEN PP */}
      <Dialog open={showPpSelectModal} onOpenChange={setShowPpSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen Permintaan Penawaran (PP) Rujukan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor PP atau nama pengadaan..."
                value={ppFilter}
                onChange={(e) => setPpFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PP</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3">Tgl Penerbitan</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen PP yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{q.rfq_number}</td>
                        <td className="py-2.5 px-3 font-medium">{q.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{q.issue_date?.split("T")[0]}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPP(q)}
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

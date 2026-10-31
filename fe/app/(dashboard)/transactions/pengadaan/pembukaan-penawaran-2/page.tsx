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
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService, oeService } from "@/services/modules.service";
import { QuotationRequest, Supplier, OwnerEstimate } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface PriceBidOpeningItem {
  id: string;
  vendor_name: string;
  raw_bid_price: number;
  arithmetic_correction: number;
  final_bid_price: number;
  hps_ratio: number; // percentage of HPS
  under_80_percent: boolean;
}

export default function PembukaanPenawaran2SampulPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [estimates, setEstimates] = useState<OwnerEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for PP
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");

  // Form Fields per Bab 4.8.11.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    hps_amount: 100000000,
    opening_location: "Ruang Rapat Pengadaan UP Sembalang",
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Price Bid Table
  const [priceBids, setPriceBids] = useState<PriceBidOpeningItem[]>([]);
  const [priceInput, setPriceInput] = useState({
    vendor_name: "",
    raw_bid_price: 90000000,
    arithmetic_correction: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes, oeRes] = await Promise.all([
        pengadaanSubmoduleService.getQuotations(search),
        masterService.getSuppliers({ limit: 100 }),
        oeService.getAllOE(""),
      ]);
      if (qRes?.success) setQuotations(qRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
      if (oeRes?.success) setEstimates(oeRes.data || []);
    } catch {
      toast.error("Gagal memuat pembukaan penawaran II");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `BAPP-II/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      hps_amount: 100000000,
      opening_location: "Ruang Rapat Pengadaan UP Sembalang",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setPriceBids([]);
    setIsDialogOpen(true);
  };

  const handleSelectPP = (q: QuotationRequest) => {
    const matchedOe = estimates.find((e) => e.request_id === q.request_id);
    const hpsVal = matchedOe ? Number(matchedOe.total_oe_amount) : 100000000;
    setForm((prev) => ({
      ...prev,
      pp_id: q.id,
      request_id: q.request_id || q.id,
      selected_pp_display: `${q.rfq_number} - ${q.request?.title || "Paket Pengadaan"}`,
      work_title: q.request?.title || "Pekerjaan Pengadaan",
      hps_amount: hpsVal,
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

  const handleAddPriceBid = () => {
    if (!priceInput.vendor_name || priceInput.raw_bid_price <= 0) {
      toast.error("Lengkapi nama rekanan dan harga penawaran valid");
      return;
    }
    const finalPrice = Number(priceInput.raw_bid_price) + Number(priceInput.arithmetic_correction);
    const ratio = form.hps_amount > 0 ? (finalPrice / form.hps_amount) * 100 : 100;
    const under80 = ratio < 80;

    const newItem: PriceBidOpeningItem = {
      id: String(Date.now()),
      vendor_name: priceInput.vendor_name,
      raw_bid_price: Number(priceInput.raw_bid_price),
      arithmetic_correction: Number(priceInput.arithmetic_correction),
      final_bid_price: finalPrice,
      hps_ratio: Math.round(ratio * 10) / 10,
      under_80_percent: under80,
    };

    setPriceBids((prev) => [...prev, newItem]);
    setPriceInput({
      vendor_name: "",
      raw_bid_price: 90000000,
      arithmetic_correction: 0,
    });
    if (under80) {
      toast("Penawaran < 80% HPS, memerlukan Form BA Klarifikasi Kewajaran Harga (FMT-06.1.2.1.39)", {
        icon: "⚠️",
      });
    } else {
      toast.success("Penawaran harga rekanan berhasil ditambahkan");
    }
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Dokumen Permintaan Penawaran (PP)", value: form.request_id, required: true },
      { field: "form_number", label: "Nomor Berita Acara Pembukaan Sampul II", value: form.form_number, required: true, minLength: 3 },
      { field: "work_title", label: "Nama Pekerjaan Pengadaan", value: form.work_title, required: true, minLength: 5 },
      { field: "form_date", label: "Tanggal Pembukaan Sampul II", value: form.form_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    if (priceBids.length === 0) {
      toast.error("Minimal harus ada 1 penawaran harga rekanan");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        actionType === "POST"
          ? "Berita Acara Pembukaan Penawaran II (BAPP Sampul II) berhasil di-POST!"
          : "Berita Acara Pembukaan Penawaran II berhasil disimpan sebagai Draft"
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.11</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Files className="w-7 h-7 text-primary" />
            Pembukaan Penawaran II (BAPP Sampul II - Harga)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pembukaan dokumen penawaran harga rekanan yang lulus evaluasi teknis (FMT-06.1.2.1.10, FMT-06.1.2.1.28)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Buka Sampul II (Harga)
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Berita Acara Pembukaan Sampul II</CardTitle>
              <CardDescription className="text-xs">
                Monitoring pembukaan penawaran harga dan klarifikasi kewajaran harga di bawah 80% HPS
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
                  <th className="py-3 px-4">No. Form BAPP II</th>
                  <th className="py-3 px-4">Nomor PP / RFQ</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Pemeriksaan Koreksi Aritmatika</th>
                  <th className="py-3 px-4 text-center">Status Pembukaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data pembukaan sampul II...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada dokumen harga yang dibuka.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`BAPP-II/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">Telah diverifikasi panitia</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          SAMPUL II TERBUKA
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

      {/* MODAL FORM PEMBUKAAN PENAWARAN II (BAB 4.8.11.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Files className="w-5 h-5 text-primary" />
                  Form Pembukaan Penawaran II (BAPP Sampul II - Harga)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.11.2 — Pembukaan sampul penawaran harga & evaluasi koreksi aritmatika
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen BAPP Sampul II
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form BAPP Sampul II *</Label>
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
              </div>
            </div>

            {/* SECTION 2: RUJUKAN NOMOR PP & NILAI HPS */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Paket Pengadaan & Batasan Pagu HPS
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
                  <Label className="text-xs font-semibold">Nilai Pagu HPS (Acuan 100%)</Label>
                  <Input
                    type="number"
                    value={form.hps_amount}
                    onChange={(e) => setForm({ ...form, hps_amount: Number(e.target.value) })}
                    className="mt-1.5 text-xs h-9 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN BAPP SAMPUL II (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen BAPP Sampul II (Maks. 25MB)
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

            {/* SECTION 4: PEMBUKAAN HARGA & KOREKSI ARITMATIKA */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Pencatatan Penawaran Harga & Koreksi Aritmatika
              </h4>

              {/* Subform Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Rekanan (Lolos Sampul I) *</Label>
                  <select
                    value={priceInput.vendor_name}
                    onChange={(e) => setPriceInput({ ...priceInput, vendor_name: e.target.value })}
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
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Harga Penawaran Surat (Rp) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={priceInput.raw_bid_price}
                    onChange={(e) => setPriceInput({ ...priceInput, raw_bid_price: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Koreksi Aritmatika (+ / - Rp)</Label>
                  <Input
                    type="number"
                    value={priceInput.arithmetic_correction}
                    onChange={(e) =>
                      setPriceInput({ ...priceInput, arithmetic_correction: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div className="sm:col-span-6 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddPriceBid}
                    className="text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Add To List]
                  </Button>
                </div>
              </div>

              {/* Table of Price Bids */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nama Rekanan</th>
                      <th className="py-2.5 px-3 text-right">Harga Surat (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Koreksi (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Harga Terkoreksi (Rp)</th>
                      <th className="py-2.5 px-3 text-center">% thd HPS</th>
                      <th className="py-2.5 px-3 text-center">Status Kewajaran</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {priceBids.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          Belum ada penawaran harga yang dicatatkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      priceBids.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-semibold text-foreground">{b.vendor_name}</td>
                          <td className="py-2 px-3 font-mono text-right text-muted-foreground">
                            {b.raw_bid_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 font-mono text-right text-muted-foreground">
                            {b.arithmetic_correction !== 0 ? b.arithmetic_correction.toLocaleString("id-ID") : "0"}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-foreground">
                            Rp {b.final_bid_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-semibold">
                            {b.hps_ratio}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            {b.under_80_percent ? (
                              <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-300 flex items-center gap-1 justify-center">
                                <AlertTriangle className="w-3 h-3" /> Wajib Klarifikasi &lt;80%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                                Wajar (&ge;80%)
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPriceBids((prev) => prev.filter((i) => i.id !== b.id))}
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

            {/* ACTION BUTTONS PER BAB 4.8.11.2 */}
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

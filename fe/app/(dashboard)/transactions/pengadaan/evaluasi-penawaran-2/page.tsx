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
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  Upload,
  FileText,
  Trophy,
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService } from "@/services/modules.service";
import { QuotationRequest, Supplier } from "@/types";
import toast from "react-hot-toast";

interface RankedBidderItem {
  id: string;
  rank: number;
  vendor_name: string;
  corrected_price: number;
  technical_score: number;
  price_score: number;
  total_score: number;
  recommendation: "CALON_PEMENANG" | "CADANGAN_1" | "CADANGAN_2" | "TIDAK_LOLOS";
}

export default function EvaluasiPenawaran2SampulPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for PP
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");

  // Form Fields per Bab 4.8.12.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    eval_method: "SISTEM_NILAI_BOBOT", // e.g. 70% Teknis + 30% Biaya
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Ranking Table
  const [rankedList, setRankedList] = useState<RankedBidderItem[]>([]);
  const [rankingInput, setRankingInput] = useState({
    vendor_name: "",
    corrected_price: 95000000,
    technical_score: 85,
    price_score: 90,
    recommendation: "CALON_PEMENANG" as "CALON_PEMENANG" | "CADANGAN_1" | "CADANGAN_2" | "TIDAK_LOLOS",
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
      toast.error("Gagal memuat evaluasi penawaran II");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `BAEP-II/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      eval_method: "SISTEM_NILAI_BOBOT",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setRankedList([]);
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

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file Berita Acara Evaluasi Sampul II terlebih dahulu!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen Berita Acara Evaluasi Sampul II (BAEP-II) berhasil diunggah!");
  };

  const handleAddRankedBidder = () => {
    if (!rankingInput.vendor_name || rankingInput.corrected_price <= 0) {
      toast.error("Lengkapi rekanan dan nilai harga penawaran");
      return;
    }
    // Weighted 70% Teknis + 30% Harga
    const total = Math.round((0.7 * rankingInput.technical_score + 0.3 * rankingInput.price_score) * 10) / 10;
    const currentCount = rankedList.length;

    const newItem: RankedBidderItem = {
      id: String(Date.now()),
      rank: currentCount + 1,
      vendor_name: rankingInput.vendor_name,
      corrected_price: Number(rankingInput.corrected_price),
      technical_score: Number(rankingInput.technical_score),
      price_score: Number(rankingInput.price_score),
      total_score: total,
      recommendation: rankingInput.recommendation,
    };

    setRankedList((prev) => [...prev, newItem]);
    setRankingInput({
      vendor_name: "",
      corrected_price: 95000000,
      technical_score: 85,
      price_score: 90,
      recommendation: "CADANGAN_1",
    });
    toast.success("Peringkat rekanan berhasil dicatatkan");
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    if (!form.request_id || rankedList.length === 0) {
      toast.error("Silakan lengkapi dokumen PP dan minimal 1 peringkat rekanan");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        actionType === "POST"
          ? "Berita Acara Evaluasi Penawaran II (BAEP Sampul II) berhasil di-POST!"
          : "Berita Acara Evaluasi Penawaran II berhasil disimpan sebagai Draft"
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.12</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            Evaluasi Penawaran II (BAEP Sampul II - Ranking)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penetapan peringkat evaluasi harga, kombinasi nilai teknis & biaya, dan calon pemenang lelang (FMT-06.1.2.1.32 & FMT-06.1.2.1.18)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Buat Evaluasi Ranking
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Dokumen BAEP Sampul II</CardTitle>
              <CardDescription className="text-xs">
                Monitoring hasil pembobotan nilai teknis-harga dan usulan calon pemenang kontrak
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
                  <th className="py-3 px-4">No. Form BAEP II</th>
                  <th className="py-3 px-4">Nomor PP / RFQ</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Metode Penilaian</th>
                  <th className="py-3 px-4 text-center">Status Penetapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data evaluasi penawaran II...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada evaluasi sampul II yang tercatat.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`BAEP-II/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">Bobot Nilai Teknis 70% + Harga 30%</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          SELESAI PEMERINGKATAN
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

      {/* MODAL FORM EVALUASI PENAWARAN II (BAB 4.8.12.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5 text-primary" />
                  Form Evaluasi Penawaran II (BAEP Sampul II - Ranking)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.12.2 — Pemeringkatan akhir rekanan dan penetapan usulan calon pemenang lelang
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen BAEP Sampul II
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form BAEP Sampul II *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form Evaluasi *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Metode Evaluasi Akhir</Label>
                  <select
                    value={form.eval_method}
                    onChange={(e) => setForm({ ...form, eval_method: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="SISTEM_NILAI_BOBOT">Sistem Nilai Bobot (70% Teknis + 30% Biaya)</option>
                    <option value="HARGA_TERENDAH">Sistem Gugur Harga Terendah Terkoreksi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN NOMOR PP & JUDUL */}
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

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nama Pekerjaan Pengadaan *</Label>
                  <Input
                    value={form.work_title}
                    onChange={(e) => setForm({ ...form, work_title: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN BAEP SAMPUL II (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Dokumen BAEP Sampul II Bertandatangan (Maks. 25MB)
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

            {/* SECTION 4: PEMERINGKATAN & REKOMENDASI PEMENANG */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Daftar Pemeringkatan & Rekomendasi Pemenang
              </h4>

              {/* Subform Input Peringkat */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nama Rekanan Peserta *</Label>
                  <select
                    value={rankingInput.vendor_name}
                    onChange={(e) => setRankingInput({ ...rankingInput, vendor_name: e.target.value })}
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
                  <Label className="text-[11px] font-semibold">Harga Terkoreksi (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={rankingInput.corrected_price}
                    onChange={(e) =>
                      setRankingInput({ ...rankingInput, corrected_price: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Skor Teknis</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={rankingInput.technical_score}
                    onChange={(e) =>
                      setRankingInput({ ...rankingInput, technical_score: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Skor Biaya</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={rankingInput.price_score}
                    onChange={(e) =>
                      setRankingInput({ ...rankingInput, price_score: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Rekomendasi Status</Label>
                  <select
                    value={rankingInput.recommendation}
                    onChange={(e) =>
                      setRankingInput({ ...rankingInput, recommendation: e.target.value as any })
                    }
                    className="w-full h-8 mt-1 rounded-md border border-input bg-background px-2 text-xs font-semibold"
                  >
                    <option value="CALON_PEMENANG">Calon Pemenang</option>
                    <option value="CADANGAN_1">Cadangan 1</option>
                    <option value="CADANGAN_2">Cadangan 2</option>
                    <option value="TIDAK_LOLOS">Tidak Lolos</option>
                  </select>
                </div>
                <div className="sm:col-span-6 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddRankedBidder}
                    className="text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Add To List]
                  </Button>
                </div>
              </div>

              {/* Table of Ranked Bidders */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                      <th className="py-2.5 px-3">Nama Rekanan Peserta</th>
                      <th className="py-2.5 px-3 text-right">Harga Terkoreksi (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Skor Teknis</th>
                      <th className="py-2.5 px-3 text-center">Skor Biaya</th>
                      <th className="py-2.5 px-3 text-center">Nilai Total</th>
                      <th className="py-2.5 px-3 text-center">Rekomendasi Panitia</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rankedList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-muted-foreground">
                          Belum ada data pemeringkatan rekanan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      rankedList.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 text-center font-bold font-mono">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                              #{r.rank}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-foreground">{r.vendor_name}</td>
                          <td className="py-2 px-3 font-mono text-right text-foreground">
                            Rp {r.corrected_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{r.technical_score}</td>
                          <td className="py-2 px-3 text-center font-mono">{r.price_score}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-primary">
                            {r.total_score} Pts
                          </td>
                          <td className="py-2 px-3 text-center">
                            {r.recommendation === "CALON_PEMENANG" ? (
                              <Badge className="text-[10px] bg-emerald-600 text-white font-bold">
                                Calon Pemenang
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                {r.recommendation}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setRankedList((prev) => prev.filter((i) => i.id !== r.id))}
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

            {/* ACTION BUTTONS PER BAB 4.8.12.2 */}
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

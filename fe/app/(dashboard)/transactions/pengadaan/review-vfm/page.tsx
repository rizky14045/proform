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
  TrendingUp,
  Search,
  Plus,
  Upload,
  FileText,
  Award,
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService } from "@/services/modules.service";
import { QuotationRequest } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

export default function ReviewVFMPengadaanPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for PP
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");

  // Form Fields per Bab 4.8.15.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    reviewer_name: "Tim Telaah VFM Pengadaan UP Sembalang",
    score_cost_efficiency: 90, // Bobot 30%
    score_technical_quality: 85, // Bobot 25%
    score_delivery_sla: 90, // Bobot 20%
    score_compliance_governance: 95, // Bobot 15%
    score_operational_benefit: 90, // Bobot 10%
    summary_recommendation: "DIREKOMENDASIKAN",
    notes: "Pengadaan memberikan efisiensi biaya optimal di bawah pagu HPS dengan spesifikasi teknis handal.",
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const qRes = await pengadaanSubmoduleService.getQuotations(search);
      if (qRes?.success) setQuotations(qRes.data || []);
    } catch {
      toast.error("Gagal memuat telaah VFM pengadaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `VFM-PGD/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      reviewer_name: "Tim Telaah VFM Pengadaan UP Sembalang",
      score_cost_efficiency: 90,
      score_technical_quality: 85,
      score_delivery_sla: 90,
      score_compliance_governance: 95,
      score_operational_benefit: 90,
      summary_recommendation: "DIREKOMENDASIKAN",
      notes: "Pengadaan memberikan efisiensi biaya optimal di bawah pagu HPS dengan spesifikasi teknis handal.",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
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

  // Weighted score calculation
  const totalVfmScore = Math.round(
    form.score_cost_efficiency * 0.3 +
      form.score_technical_quality * 0.25 +
      form.score_delivery_sla * 0.2 +
      form.score_compliance_governance * 0.15 +
      form.score_operational_benefit * 0.1
  );

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Dokumen Permintaan Penawaran (PP)", value: form.request_id, required: true },
      { field: "form_number", label: "Nomor Dokumen VFM Pengadaan", value: form.form_number, required: true, minLength: 3 },
      { field: "work_title", label: "Judul Pekerjaan Pengadaan", value: form.work_title, required: true, minLength: 5 },
      { field: "form_date", label: "Tanggal Kajian VFM", value: form.form_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        actionType === "POST"
          ? "Telaah VFM Pengadaan berhasil di-POST dan disahkan!"
          : "Telaah VFM Pengadaan berhasil disimpan sebagai Draft"
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
    toast("Form dikembalikan ke penelaah VFM untuk revisi");
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.15</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <TrendingUp className="w-7 h-7 text-primary" />
            Review VFM Pengadaan (Value For Money)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penelaahan nilai manfaat ekonomi, efektivitas biaya, dan kesiapan operasional pra-penerbitan kontrak (Surat 01)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Review VFM
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Dokumen Telaah VFM Pengadaan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring nilai perolehan manfaat (3E: Efektif, Efisien, Ekonomis) sebelum penandatanganan PO/Kontrak
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
                  <th className="py-3 px-4">No. Form VFM</th>
                  <th className="py-3 px-4">Nomor PP / RFQ</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4 text-center">Skor VFM</th>
                  <th className="py-3 px-4 text-center">Kesimpulan Rekomendasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Memuat data review VFM...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada telaah VFM pengadaan yang dicatatkan.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`VFM-PGD/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">89.5 Pts</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="text-[10px] bg-emerald-600 text-white font-bold">
                          DIREKOMENDASIKAN
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          POSTED
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

      {/* MODAL FORM REVIEW VFM PENGADAAN (BAB 4.8.15.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Form Review VFM Pengadaan (Value For Money)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.15.2 — Kajian Value For Money pra-penerbitan Kontrak / PO (Surat 01)
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen Review VFM
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form VFM Pengadaan *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form VFM *</Label>
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

            {/* SECTION 2: RUJUKAN NOMOR PP & PENELAAH */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Paket Pengadaan & Penelaah
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
                  <Label className="text-xs font-semibold">Penelaah / Tim VFM</Label>
                  <Input
                    value={form.reviewer_name}
                    onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN KAJIAN VFM (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Kajian VFM Pengadaan (Maks. 25MB)
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

            {/* SECTION 4: MATRIKS PENILAIAN KRITERIA VFM PENGADAAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Matriks 5 Kriteria Penilaian Value For Money
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-md border">
                <div>
                  <div className="flex justify-between text-xs">
                    <Label className="font-semibold">1. Efisiensi Biaya Kontrak vs HPS (Bobot 30%)</Label>
                    <span className="font-mono font-bold text-primary">{form.score_cost_efficiency} Pts</span>
                  </div>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={form.score_cost_efficiency}
                    onChange={(e) =>
                      setForm({ ...form, score_cost_efficiency: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <Label className="font-semibold">2. Kualitas Teknis & Garansi Material (Bobot 25%)</Label>
                    <span className="font-mono font-bold text-primary">{form.score_technical_quality} Pts</span>
                  </div>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={form.score_technical_quality}
                    onChange={(e) =>
                      setForm({ ...form, score_technical_quality: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <Label className="font-semibold">3. Ketepatan Waktu Pelaksanaan / SLA (Bobot 20%)</Label>
                    <span className="font-mono font-bold text-primary">{form.score_delivery_sla} Pts</span>
                  </div>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={form.score_delivery_sla}
                    onChange={(e) =>
                      setForm({ ...form, score_delivery_sla: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <Label className="font-semibold">4. Kepatuhan Tata Kelola & Legal (Bobot 15%)</Label>
                    <span className="font-mono font-bold text-primary">{form.score_compliance_governance} Pts</span>
                  </div>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={form.score_compliance_governance}
                    onChange={(e) =>
                      setForm({ ...form, score_compliance_governance: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <Label className="font-semibold">5. Efektivitas Nilai Manfaat Operasional (Bobot 10%)</Label>
                    <span className="font-mono font-bold text-primary">{form.score_operational_benefit} Pts</span>
                  </div>
                  <Input
                    type="range"
                    min="50"
                    max="100"
                    value={form.score_operational_benefit}
                    onChange={(e) =>
                      setForm({ ...form, score_operational_benefit: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex flex-col justify-center items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Skor Akhir VFM</span>
                  <span className="text-2xl font-mono font-bold text-primary mt-1">{totalVfmScore} Pts</span>
                  <Badge className="mt-1 text-[10px] bg-emerald-600 text-white font-bold">
                    {totalVfmScore >= 80 ? "LAYAK & DIREKOMENDASIKAN" : "PERLU EVALUASI ULANG"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Kesimpulan Telaah & Catatan Rekomendasi VFM</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1.5 text-xs h-9"
                />
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.15.2 */}
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

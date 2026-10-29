"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, Search, Plus, Award, Upload, FileText, Send, CheckCircle2 } from "lucide-react";
import { inventorySubmoduleService, masterService, hpeService } from "@/services/modules.service";
import { VFMReviewInventory, EngineeringEstimate, User } from "@/types";
import toast from "react-hot-toast";

interface VFMCriteria {
  id: string;
  category: string;
  description: string;
  weight: number;
  score: number;
  notes: string;
}

const DEFAULT_VFM_CRITERIA: VFMCriteria[] = [
  { id: "1", category: "Efektivitas", description: "Kesesuaian volume, spesifikasi teknis, dan ketepatan waktu pengadaan terhadap kebutuhan pembangkit", weight: 30, score: 90, notes: "Volume sesuai jadwal overhaul" },
  { id: "2", category: "Efisiensi", description: "Kewajaran harga HPE berdasarkan perbandingan referensi pasar, riwayat kontrak sebelumnya, dan mitigasi inflasi", weight: 35, score: 88, notes: "Di bawah batas pagu PRK" },
  { id: "3", category: "Kepatuhan", description: "Kesesuaian dengan Pedoman Pengadaan PLN Nusantara Power, pemenuhan TKDN, dan regulasi K3L", weight: 20, score: 95, notes: "TKDN memenuhi ambang minimal" },
  { id: "4", category: "Akuntabilitas", description: "Ketersediaan dokumen pendukung, justifikasi pemilihan metode, dan transparansi proses", weight: 15, score: 92, notes: "Dokumen KAK dan referensi lengkap" },
];

export default function ReviewVFMInventoryPage() {
  const [reviews, setReviews] = useState<VFMReviewInventory[]>([]);
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVFMFile, setUploadedVFMFile] = useState("");

  // Form Review VFM according to PDF Manual 4.7.6.2
  const [form, setForm] = useState({
    review_number: `VFM-INV/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    review_date: new Date().toISOString().split("T")[0],
    hpe_id: "",
    reviewer_id: "",
    recommendation: "Direkomendasikan untuk dilanjutkan ke proses pengadaan",
    notes: "Pengadaan memenuhi prinsip Value for Money (Efektif, Efisien, Terbuka, Bersaing, dan Akuntabel).",
  });

  const [criteriaList, setCriteriaList] = useState<VFMCriteria[]>(DEFAULT_VFM_CRITERIA);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, hRes, uRes] = await Promise.all([
        inventorySubmoduleService.getVFMReviews(search),
        hpeService.getAllHPE({ limit: 50 }),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (vRes?.success) setReviews(vRes.data || []);
      if (hRes?.data) setEstimates(hRes.data);
      if (uRes?.data) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat telaah VFM perencanaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      review_number: `VFM-INV/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      review_date: new Date().toISOString().split("T")[0],
      hpe_id: estimates[0]?.id || "",
      reviewer_id: users[0]?.id || "",
      recommendation: "Direkomendasikan untuk dilanjutkan ke proses pengadaan",
      notes: "Pengadaan memenuhi prinsip Value for Money (Efektif, Efisien, Terbuka, Bersaing, dan Akuntabel).",
    });
    setCriteriaList(DEFAULT_VFM_CRITERIA);
    setUploadedVFMFile("");
    setIsDialogOpen(true);
  };

  const totalWeightedScore = criteriaList.reduce(
    (sum, c) => sum + (c.weight * c.score) / 100,
    0
  );

  const handleScoreChange = (id: string, val: number) => {
    setCriteriaList(
      criteriaList.map((c) => (c.id === id ? { ...c, score: Math.min(100, Math.max(0, val)) } : c))
    );
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveReview(false);
  };

  const handleSendApproval = async () => {
    await saveReview(true);
  };

  const saveReview = async (isSendApproval: boolean) => {
    if (!form.hpe_id || !form.reviewer_id) {
      toast.error("Pilih dokumen HPE/RKS rujukan dan penelaah VFM");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await inventorySubmoduleService.createVFMReview({
        request_id: form.hpe_id,
        reviewer_id: form.reviewer_id,
        review_date: form.review_date,
        vfm_score: Math.round(totalWeightedScore),
        recommendation: form.recommendation,
        status: isSendApproval ? "APPROVED" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          isSendApproval
            ? "Review VFM Perencanaan berhasil disetujui & dikirim untuk approval!"
            : "Draft Review VFM Perencanaan berhasil disimpan!"
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-primary" />
            Review VFM Perencanaan Pengadaan (Bab 4.7.6)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kajian Value For Money (efektivitas, efisiensi, dan kepatuhan) sebelum lelang di PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Telaah VFM Baru
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Review VFM Perencanaan</CardTitle>
              <CardDescription className="text-xs">
                Daftar telaah VFM perencanaan yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari telaah VFM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 h-9 text-xs rounded-md border border-input bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                <tr>
                  <th className="py-3 px-4">Paket / Rujukan HPE</th>
                  <th className="py-3 px-4">Penelaah VFM</th>
                  <th className="py-3 px-4">Tanggal Review</th>
                  <th className="py-3 px-4">Skor VFM</th>
                  <th className="py-3 px-4">Rekomendasi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Memuat data review VFM...</td></tr>
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada review VFM tercatat.</td></tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {r.request?.title || r.request?.request_number || "Paket Pengadaan UP Sembalang"}
                      </td>
                      <td className="py-3 px-4 font-medium">{r.reviewer?.name || "Tim Inventori"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {r.review_date ? new Date(r.review_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">{r.vfm_score} / 100</td>
                      <td className="py-3 px-4 text-xs font-medium text-foreground">{r.recommendation}</td>
                      <td className="py-3 px-4">
                        <Badge className={r.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {r.status === "APPROVED" ? "Disetujui" : "Draft"}
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

      {/* DIALOG FORM REVIEW VFM PERENCANAAN (Bab 4.7.6.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Form Review VFM Perencanaan Pengadaan (Bab 4.7.6.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff Inventori PT PLN Nusantara Power UP Sembalang yang telah ditunjuk melalui Distribusi Perencanaan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: IDENTITAS & RUJUKAN HPE */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Form & Rujukan HPE / RKS
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.review_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor form terbentuk otomatis oleh sistem</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.review_date}
                    onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Rujukan Dokumen HPE / RKS (Metode PL & Lelang) *</Label>
                  <select
                    value={form.hpe_id}
                    onChange={(e) => setForm({ ...form, hpe_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                    required
                  >
                    <option value="">-- [Pilih Dokumen HPE / RKS] --</option>
                    {estimates.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.hpe_number} - {h.procurement_request?.title || "Paket Pengadaan"} (Metode: {h.procurement_method || "LELANG"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Penelaah VFM (Staf Inventori) *</Label>
                  <select
                    value={form.reviewer_id}
                    onChange={(e) => setForm({ ...form, reviewer_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="">-- [Pilih Penelaah] --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.nid}) - {u.role?.name || "Staf Inventori"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Kajian VFM Perencanaan (Max 25MB)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedVFMFile(e.target.files[0].name);
                          toast.success(`Kajian VFM ${e.target.files[0].name} siap diunggah`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedVFMFile || "Belum ada berkas kajian diunggah"}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: KRITERIA VALUE FOR MONEY */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Award className="w-4 h-4 text-primary" />
                2. Matriks Penilaian Kriteria Value for Money (VFM)
              </div>

              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 w-28">Kategori VFM</th>
                      <th className="py-2.5 px-3">Uraian Kriteria Penilaian</th>
                      <th className="py-2.5 px-3 w-16 text-center">Bobot</th>
                      <th className="py-2.5 px-3 w-24 text-center">Nilai (0-100)</th>
                      <th className="py-2.5 px-3">Catatan Analisis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {criteriaList.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 text-center font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{c.category}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{c.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{c.weight}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={c.score}
                            onChange={(e) => handleScoreChange(c.id, Number(e.target.value) || 0)}
                            className="h-7 w-20 text-xs font-mono text-center mx-auto"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-xs">{c.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Skor VFM Callout */}
              <div className="flex items-center justify-between p-3.5 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Skor Akhir Value for Money (VFM):
                </span>
                <span className="text-xl font-black font-mono text-primary">
                  {totalWeightedScore.toFixed(1)} / 100
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold">Kesimpulan Rekomendasi VFM *</Label>
                  <select
                    value={form.recommendation}
                    onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold"
                    required
                  >
                    <option value="Direkomendasikan untuk dilanjutkan ke proses pengadaan">
                      MEMENUHI VFM (Layak Dilanjutkan ke Pengadaan)
                    </option>
                    <option value="Perlu penyesuaian volume dan harga referensi pasar">
                      PERLU PENYESUAIAN (Revisi Volume & Referensi Harga)
                    </option>
                    <option value="Tidak direkomendasikan karena melanggar ketentuan efisiensi">
                      TIDAK DIREKOMENDASIKAN (Gugur Aspek VFM)
                    </option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Catatan Tambahan Penelaah</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-1 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save as Draft], [Send For Approval] */}
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
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Save (Simpan Draft)
                </Button>
                <Button
                  type="button"
                  onClick={handleSendApproval}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Mengirim..." : "Send For Approval"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

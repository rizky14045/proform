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
import { FileCheck, Search, Plus, CheckCircle2, Upload, FileText, Check, X } from "lucide-react";
import { usersSubmoduleService, masterService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { TechnicalEvaluation, ProcurementRequest, User } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface TechEvalRow {
  id: string;
  item_name: string;
  offered_spec: string;
  is_compliant: boolean;
  notes: string;
}

export default function EvaluasiTeknisUserPage() {
  const [evaluations, setEvaluations] = useState<TechnicalEvaluation[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  // Form Evaluasi Teknis according to PDF Manual 4.6.5.2
  const [form, setForm] = useState({
    form_number: "ET-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
    form_date: new Date().toISOString().split("T")[0],
    opening_tender_ref: "",
    request_id: "",
    evaluator_id: "",
    result: "MEMENUHI",
    score: 88,
    notes: "Spesifikasi penawaran rekanan sesuai dengan Kerangka Acuan Kerja (KAK) dan standar PLN.",
  });

  const [evalRows, setEvalRows] = useState<TechEvalRow[]>([
    {
      id: "1",
      item_name: "Cartridge Filter Intake Udara GT",
      offered_spec: "Dimensi 324 x 660 mm, Synthetic media F9 EN779, Sertifikat Uji Pabrik disertakan",
      is_compliant: true,
      notes: "Sesuai spesifikasi KAK teknis",
    },
    {
      id: "2",
      item_name: "Pre-Filter Mat G4 Pembangkit",
      offered_spec: "Panel 592 x 592 x 48 mm, Frame galvanis washable",
      is_compliant: true,
      notes: "Memenuhi standar filtrasi",
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, rRes, uRes] = await Promise.all([
        usersSubmoduleService.getEvaluations(search),
        procurementService.getAll({ limit: 50 }),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (eRes?.success) setEvaluations(eRes.data || []);
      if (rRes?.success) setRequests(rRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat evaluasi teknis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      form_number: "ET-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      form_date: new Date().toISOString().split("T")[0],
      opening_tender_ref: "BAPP-2026-0044 (Lelang 1 Sampul Blok 1)",
      request_id: requests[0]?.id || "",
      evaluator_id: users[0]?.id || "",
      result: "MEMENUHI",
      score: 88,
      notes: "Spesifikasi penawaran rekanan sesuai dengan Kerangka Acuan Kerja (KAK) dan standar PLN.",
    });
    setUploadedFile("");
    setIsDialogOpen(true);
  };

  const handleToggleCompliance = (id: string) => {
    setEvalRows(
      evalRows.map((r) => (r.id === id ? { ...r, is_compliant: !r.is_compliant } : r))
    );
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveEvaluation(false);
  };

  const handlePost = async () => {
    await saveEvaluation(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setUploadedFile(res.fileName);
    }
  };

  const saveEvaluation = async (isPosted: boolean) => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Usulan Permintaan Pengadaan", value: form.request_id, required: true },
      { field: "evaluator_id", label: "Pejabat Penilai Evaluasi Teknis", value: form.evaluator_id, required: true },
      { field: "form_date", label: "Tanggal Form Evaluasi", value: form.form_date, required: true, type: "date" },
      { field: "score", label: "Nilai Skor Evaluasi Teknis", value: form.score, required: true, type: "number", min: 0, max: 100 },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await usersSubmoduleService.createEvaluation({
        ...form,
        score: Number(form.score),
        status: isPosted ? "POSTED" : "DRAFT",
      });
      if (res?.success) {
        toast.success(isPosted ? "Evaluasi teknis berhasil di-POSTING!" : "Evaluasi teknis berhasil disimpan sebagai draft!");
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
            <FileCheck className="w-7 h-7 text-primary" />
            Evaluasi Teknis (Bab 4.6.5)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penilaian teknis penawaran oleh Staff User pembuat usulan permintaan untuk Pengadaan Langsung, Penunjukan Langsung, dan Lelang UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Evaluasi Teknis
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Evaluasi Teknis</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi evaluasi teknis penawaran yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari paket / evaluator..."
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
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Pejabat Evaluator</th>
                  <th className="py-3 px-4">Tgl Evaluasi</th>
                  <th className="py-3 px-4">Skor Teknis</th>
                  <th className="py-3 px-4">Kesimpulan Hasil</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Memuat data evaluasi teknis...</td></tr>
                ) : evaluations.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada evaluasi teknis tercatat.</td></tr>
                ) : (
                  evaluations.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {e.request?.title || e.request?.request_number || "Paket Pengadaan UP Sembalang"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{e.evaluator?.name || "Tim Teknis User"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {e.evaluation_date ? new Date(e.evaluation_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">{e.score} / 100</td>
                      <td className="py-3 px-4">
                        <Badge className={e.result === "MEMENUHI" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-red-100 text-red-800 border-none"}>
                          {e.result === "MEMENUHI" ? "Memenuhi Syarat" : "Gugur Teknis"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge color="secondary">{e.status || "POSTED"}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM EVALUASI TEKNIS (Bab 4.6.5.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileCheck className="w-5 h-5 text-primary" />
              Form Evaluasi Teknis (Bab 4.6.5.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff User pembuat usulan permintaan untuk menilai penawaran dari staff pengadaan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & RUJUKAN PEMBUKAAN PENAWARAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Rujukan Pembukaan Penawaran Pengadaan
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.form_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor form terbentuk otomatis oleh sistem</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Rujukan Berita Acara Pembukaan Penawaran *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={form.opening_tender_ref}
                    onChange={(e) => setForm({ ...form, opening_tender_ref: e.target.value })}
                    placeholder="Gunakan tombol search untuk mencari pembukaan penawaran..."
                    className="text-xs font-medium"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 text-xs gap-1"
                    onClick={() => toast.success("Membuka dialog pencarian pembukaan penawaran...")}
                  >
                    <Search className="w-3.5 h-3.5 text-primary" /> [Search Pop-Up]
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Data ditampilkan sesuai dengan pengguna yang membuat usulan permintaan yang dikirim oleh staff pengadaan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Paket Pengadaan Terkait *</Label>
                  <select
                    value={form.request_id}
                    onChange={(e) => setForm({ ...form, request_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.request_number} - {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Pejabat / Tim Teknis Evaluator *</Label>
                  <select
                    value={form.evaluator_id}
                    onChange={(e) => setForm({ ...form, evaluator_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.nid}) - {u.role?.name || "Evaluator"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Hasil Evaluasi Teknis (Scan PDF / DOCX)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedFile || "Belum ada berkas lampiran dipilih"}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: TABEL DETAIL EVALUASI TEKNIS */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-primary" />
                2. Matriks Penilaian Kesesuaian Teknis Rekanan
              </div>

              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Item Barang / Lingkup Jasa</th>
                      <th className="py-2.5 px-3">Spesifikasi yang Ditawarkan Rekanan</th>
                      <th className="py-2.5 px-3 w-28 text-center">Kesesuaian</th>
                      <th className="py-2.5 px-3">Catatan Evaluator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {evalRows.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 text-center font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">{r.item_name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.offered_spec}</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCompliance(r.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 mx-auto transition-colors ${
                              r.is_compliant
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {r.is_compliant ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {r.is_compliant ? "Sesuai" : "Tidak Sesuai"}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-xs">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold">Skor Teknis (Passing Grade: 75) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: Number(e.target.value) || 0 })}
                    className="mt-1 text-xs h-9 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Kesimpulan Evaluasi Teknis *</Label>
                  <select
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold"
                    required
                  >
                    <option value="MEMENUHI">MEMENUHI (Lulus Teknis & Sesuai KAK)</option>
                    <option value="TIDAK_MEMENUHI">TIDAK MEMENUHI (Gugur Evaluasi Teknis)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Risalah / Catatan Evaluator Teknis</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1 text-xs h-9"
                />
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save], [Post] */}
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
                  onClick={handlePost}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? "Memproses..." : "Post (Posting Evaluasi Teknis)"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

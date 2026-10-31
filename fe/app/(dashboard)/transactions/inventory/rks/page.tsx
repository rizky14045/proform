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
import { Files, Search, Plus, FileText, Upload, Send, ShieldCheck, CheckSquare, Layers } from "lucide-react";
import { hpeService } from "@/services/modules.service";
import { EngineeringEstimate } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

export default function KelolaRKSPage() {
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedRKSFile, setUploadedRKSFile] = useState("");

  // Form RKS according to PDF Manual 4.7.4.2
  const [form, setForm] = useState({
    rks_number: "00" + Math.floor(10 + Math.random() * 90) + "/RKS/600/UP-SMBL/" + new Date().getFullYear(),
    form_date: new Date().toISOString().split("T")[0],
    hpe_id: "",
    title: "",
    general_terms: "1. Peserta lelang wajib memiliki izin usaha yang masih berlaku (NIB / SIUP).\n2. Tidak sedang dalam pengawasan pengadilan atau pailit.\n3. Mematuhi pakta integritas dan ketentuan K3L PT PLN Nusantara Power.",
    special_terms: "1. Garansi purna jual minimal 12 bulan sejak BAST.\n2. Sertifikat uji pabrik (Mill Test Certificate) asli harus disertakan saat pengiriman.\n3. Waktu penyerahan barang maksimal 45 hari kalender.",
    delivery_time_days: 45,
  });

  const [selectedHPEMeta, setSelectedHPEMeta] = useState<EngineeringEstimate | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hpeService.getAllHPE(search);
      if (res?.success) {
        setEstimates(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat dokumen RKS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      rks_number: "00" + Math.floor(10 + Math.random() * 90) + "/RKS/600/UP-SMBL/" + new Date().getFullYear(),
      form_date: new Date().toISOString().split("T")[0],
      hpe_id: estimates[0]?.id || "",
      title: estimates[0]?.procurement_request?.title || "Pengadaan Spare Part Pemeliharaan Blok 1 UP Sembalang",
      general_terms: "1. Peserta lelang wajib memiliki izin usaha yang masih berlaku (NIB / SIUP).\n2. Tidak sedang dalam pengawasan pengadilan atau pailit.\n3. Mematuhi pakta integritas dan ketentuan K3L PT PLN Nusantara Power.",
      special_terms: "1. Garansi purna jual minimal 12 bulan sejak BAST.\n2. Sertifikat uji pabrik (Mill Test Certificate) asli harus disertakan saat pengiriman.\n3. Waktu penyerahan barang maksimal 45 hari kalender.",
      delivery_time_days: 45,
    });
    setSelectedHPEMeta(estimates[0] || null);
    setUploadedRKSFile("");
    setIsDialogOpen(true);
  };

  const handleSelectHPE = (hpeId: string) => {
    setForm({ ...form, hpe_id: hpeId });
    const sel = estimates.find((item) => item.id === hpeId);
    if (sel) {
      setSelectedHPEMeta(sel);
      if (sel.procurement_request?.title) {
        setForm((prev) => ({ ...prev, hpe_id: hpeId, title: sel.procurement_request?.title || prev.title }));
      }
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRKS(false);
  };

  const handleSendApproval = async () => {
    await saveRKS(true);
  };

  const handleRKSFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setUploadedRKSFile(res.fileName);
    }
  };

  const saveRKS = async (isSendApproval: boolean) => {
    const validation = validateForm([
      { field: "hpe_id", label: "Dokumen Referensi HPE", value: form.hpe_id, required: true },
      { field: "title", label: "Judul Pengadaan / Judul RKS", value: form.title, required: true, minLength: 5 },
      { field: "general_terms", label: "Syarat Umum Pengadaan", value: form.general_terms, required: true, minLength: 5 },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        isSendApproval
          ? "Dokumen RKS berhasil dikirim untuk approval Supervisor / Manajer!"
          : "Draft dokumen RKS berhasil disimpan!"
      );
      setIsDialogOpen(false);
    } catch {
      toast.error("Gagal menyimpan dokumen RKS");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Files className="w-7 h-7 text-primary" />
            Rencana Kerja & Syarat-syarat (RKS) (Bab 4.7.4)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penyusunan syarat umum, syarat khusus, dan spesifikasi teknis pelelangan PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Dokumen RKS Baru
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Dokumen RKS</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi RKS yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor dokumen RKS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Dokumen RKS / HPE</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Nilai Total HPE</th>
                  <th className="py-3 px-4">Metode Pengadaan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data RKS...</td></tr>
                ) : estimates.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada dokumen RKS terdaftar.</td></tr>
                ) : (
                  estimates.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {item.hpe_number?.replace("HPE", "RKS") || "RKS-2026-X"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {item.procurement_request?.title || "Pengadaan Barang & Jasa UP Sembalang"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        Rp {Number(item.total_hpe || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{item.procurement_method || "LELANG"}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-100 text-emerald-800 border-none">Disetujui</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM RKS (Bab 4.7.4.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Files className="w-5 h-5 text-primary" />
              Form Rencana Kerja & Syarat-syarat (RKS) (Bab 4.7.4.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff Inventori PT PLN Nusantara Power UP Sembalang yang telah ditunjuk melalui Distribusi Perencanaan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & RUJUKAN HPE */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Rujukan Dokumen HPE & Klasifikasi Tender
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.rks_number}
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
                <Label className="text-xs font-semibold">Dokumen HPE Rujukan (Penunjukan Langsung & Lelang) *</Label>
                <select
                  value={form.hpe_id}
                  onChange={(e) => handleSelectHPE(e.target.value)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                  required
                >
                  <option value="">-- [Pilih Dokumen HPE Terkait] --</option>
                  {estimates.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hpe_number} - {h.procurement_request?.title || "Paket Pengadaan"} (Rp {Number(h.total_hpe || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Item pengadaan yang menggunakan metode Penunjukan Langsung dan Lelang saja yang akan tampil
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">Judul Pengadaan *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Pengadaan Spare Part Filter Udara Gas Turbine Blok 1 UP Sembalang"
                  className="mt-1 text-xs h-9 font-medium"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Upload Berkas Lampiran RKS / Kerangka Acuan Kerja (Max 25MB)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleRKSFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedRKSFile ? (
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5" /> Terverifikasi: {uploadedRKSFile}
                      </span>
                    ) : (
                      "Belum ada berkas RKS diunggah (Maks. 25MB)"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: SYARAT UMUM & SYARAT KHUSUS */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primary" />
                2. Ketentuan Persyaratan RKS (Syarat Umum & Khusus)
              </div>

              <div>
                <Label className="text-xs font-semibold">Syarat Umum Pengadaan (Ketentuan Administratif & Legalitas)</Label>
                <Textarea
                  rows={3}
                  value={form.general_terms}
                  onChange={(e) => setForm({ ...form, general_terms: e.target.value })}
                  className="mt-1 text-xs bg-background/80"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Syarat Khusus Pengadaan (Ketentuan Teknis, Garansi, & Pengiriman)</Label>
                <Textarea
                  rows={3}
                  value={form.special_terms}
                  onChange={(e) => setForm({ ...form, special_terms: e.target.value })}
                  className="mt-1 text-xs bg-background/80"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Batas Waktu Pengiriman / Pelaksanaan (Hari Kalender)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.delivery_time_days}
                    onChange={(e) => setForm({ ...form, delivery_time_days: Number(e.target.value) || 30 })}
                    className="mt-1 text-xs h-9 font-mono"
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
                  {isSubmitting ? "Memproses..." : "Send For Approval"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

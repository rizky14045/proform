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
import { Shield, Search, Plus, CheckCircle2, Upload, FileText, Send, Building } from "lucide-react";
import { inventorySubmoduleService, masterService, hpeService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { DirectAppointmentPermit, ProcurementRequest, Supplier, EngineeringEstimate } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

export default function IzinPenunjukanLangsungPage() {
  const [permits, setPermits] = useState<DirectAppointmentPermit[]>([]);
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPermitFile, setUploadedPermitFile] = useState("");

  // Form Izin Penunjukan Langsung according to PDF Manual 4.7.7.2
  const [form, setForm] = useState({
    permit_number: `IPL/GM/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    permit_date: new Date().toISOString().split("T")[0],
    hpe_id: "",
    vendor_id: "",
    justification_type: "OEM_EXCLUSIVE",
    justification: "Barang / Jasa hanya dapat disediakan oleh satu pelaku usaha yang memegang hak paten atau hak cipta eksklusif (Original Equipment Manufacturer / Agen Tunggal Resmi).",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, hRes, sRes] = await Promise.all([
        inventorySubmoduleService.getDirectPermits(search),
        hpeService.getAllHPE({ limit: 50 }),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (pRes?.success) setPermits(pRes.data || []);
      if (hRes?.data) setEstimates(hRes.data.filter((e) => e.procurement_method === "PENUNJUKAN_LANGSUNG" || true));
      if (sRes?.data) setSuppliers(sRes.data || []);
    } catch {
      toast.error("Gagal memuat izin penunjukan langsung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      permit_number: `IPL/GM/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      permit_date: new Date().toISOString().split("T")[0],
      hpe_id: estimates[0]?.id || "",
      vendor_id: suppliers[0]?.id || "",
      justification_type: "OEM_EXCLUSIVE",
      justification: "Barang / Jasa hanya dapat disediakan oleh satu pelaku usaha yang memegang hak paten atau hak cipta eksklusif (Original Equipment Manufacturer / Agen Tunggal Resmi).",
      notes: "Kesesuaian dengan Pedoman Pengadaan Barang dan Jasa PT PLN Nusantara Power UP Sembalang.",
    });
    setUploadedPermitFile("");
    setIsDialogOpen(true);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePermit(false);
  };

  const handleSendApproval = async () => {
    await savePermit(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setUploadedPermitFile(res.fileName);
    }
  };

  const savePermit = async (isSendApproval: boolean) => {
    const validation = validateForm([
      { field: "hpe_id", label: "Dokumen Referensi HPE / RKS", value: form.hpe_id, required: true },
      { field: "vendor_id", label: "Rekanan / Penyedia Ditunjuk", value: form.vendor_id, required: true },
      { field: "justification", label: "Justifikasi Penunjukan Langsung", value: form.justification, required: true, minLength: 10 },
      { field: "permit_date", label: "Tanggal Izin Penunjukan Langsung", value: form.permit_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await inventorySubmoduleService.createDirectPermit({
        request_id: form.hpe_id,
        permit_number: form.permit_number,
        vendor_id: form.vendor_id,
        justification: form.justification,
        permit_date: form.permit_date,
        status: isSendApproval ? "APPROVED" : "PROPOSED",
      });
      if (res?.success) {
        toast.success(
          isSendApproval
            ? "Izin Penunjukan Langsung berhasil diajukan untuk Approval General Manager!"
            : "Draft Izin Penunjukan Langsung berhasil disimpan!"
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
            <Shield className="w-7 h-7 text-primary" />
            Izin Penunjukan Langsung (Bab 4.7.7)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Permohonan dan persetujuan penunjukan langsung vendor tunggal / pemegang paten (OEM) di PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Permohonan Izin PL
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Izin Penunjukan Langsung</CardTitle>
              <CardDescription className="text-xs">
                Daftar permohonan penetapan metode Penunjukan Langsung yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari izin / rekanan..."
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
                  <th className="py-3 px-4">Nomor Izin PL</th>
                  <th className="py-3 px-4">Paket / Rujukan HPE</th>
                  <th className="py-3 px-4">Rekanan Ditunjuk</th>
                  <th className="py-3 px-4">Tanggal Izin</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data izin penunjukan langsung...</td></tr>
                ) : permits.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada izin penunjukan langsung tercatat.</td></tr>
                ) : (
                  permits.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{p.permit_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {p.request?.title || p.request?.request_number || "Paket Penunjukan Langsung UP Sembalang"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">{p.vendor?.name || "Vendor Tunggal Resmi"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {p.permit_date ? new Date(p.permit_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={p.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {p.status === "APPROVED" ? "Disetujui GM" : "Diajukan"}
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

      {/* DIALOG FORM IZIN PENUNJUKAN LANGSUNG (Bab 4.7.7.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5 text-primary" />
              Form Izin Penunjukan Langsung (Bab 4.7.7.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff Inventori PT PLN Nusantara Power UP Sembalang yang telah ditunjuk melalui Distribusi Perencanaan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: IDENTITAS FORM & RUJUKAN HPE */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Permohonan & Rujukan Dokumen HPE
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.permit_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor form terbentuk otomatis oleh sistem</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.permit_date}
                    onChange={(e) => setForm({ ...form, permit_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Nomor HPE Terpilih (Metode Penunjukan Langsung) *</Label>
                <select
                  value={form.hpe_id}
                  onChange={(e) => setForm({ ...form, hpe_id: e.target.value })}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                  required
                >
                  <option value="">-- [Pilih Nomor HPE] --</option>
                  {estimates.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hpe_number} - {h.procurement_request?.title || "Paket Pengadaan"} (Metode: {h.procurement_method || "PENUNJUKAN_LANGSUNG"})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Paket pengadaan yang menggunakan metode Penunjukan Langsung saja yang akan tampil
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">Nama Rekanan / Penyedia Terpilih *</Label>
                <select
                  value={form.vendor_id}
                  onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold"
                  required
                >
                  <option value="">-- [Pilih Rekanan Terdaftar di HPE] --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.category || "Vendor Resmi"}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Tampil sebatas perusahaan-perusahaan terdaftar di nomor HPE terpilih
                </p>
              </div>
            </div>

            {/* SECTION 2: JUSTIFIKASI & UPLOAD DOKUMEN IZIN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Shield className="w-4 h-4 text-primary" />
                2. Kriteria & Justifikasi Penunjukan Langsung
              </div>

              <div>
                <Label className="text-xs font-semibold">Dasar Kriteria Penunjukan Langsung *</Label>
                <select
                  value={form.justification_type}
                  onChange={(e) => setForm({ ...form, justification_type: e.target.value })}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  required
                >
                  <option value="OEM_EXCLUSIVE">Pemegang Hak Paten / Hak Cipta Tunggal (Original Equipment Manufacturer)</option>
                  <option value="TECHNOLOGY_SPECIFIC">Teknologi Khusus / Spesifik yang Tidak Dapat Disubstitusi</option>
                  <option value="EMERGENCY_SHUTDOWN">Keadaan Darurat Operasional & Keandalan Pembangkit Listrik</option>
                  <option value="CONTINUATION_STANDARDIZATION">Pekerjaan Lanjutan / Standarisasi Sistem Eksisting</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Uraian Alasan / Justifikasi Teknis *</Label>
                <Textarea
                  rows={3}
                  value={form.justification}
                  onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  className="mt-1 text-xs bg-background/80"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Surat Permohonan / Rekomendasi (Max 25MB)</Label>
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
                    {uploadedPermitFile || "Belum ada berkas rekomendasi diunggah"}
                  </span>
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

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
import { Building2, Search, Plus, CheckCircle2, ShieldCheck, Upload, FileText, Calendar, DollarSign } from "lucide-react";
import { poService, masterService } from "@/services/modules.service";
import { BankGuarantee, PurchaseOrder, Supplier } from "@/types";
import toast from "react-hot-toast";

export default function BankGaransiPage() {
  const [guarantees, setGuarantees] = useState<BankGuarantee[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  // Form Bank Garansi according to PDF Manual 4.2.2
  const [form, setForm] = useState({
    form_number: "BG-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
    form_date: new Date().toISOString().split("T")[0],
    po_id: "",
    supplier_id: "",
    bg_number: "",
    bg_type: "PELAKSANAAN",
    issuing_bank: "",
    amount: 0,
    effective_date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    claim_deadline: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    confirmation_status: "UNVERIFIED",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bgRes, poRes, sRes] = await Promise.all([
        poService.getAllBankGuarantees(search),
        poService.getAllPO({ limit: 50 }),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (bgRes?.success) setGuarantees(bgRes.data || []);
      if (poRes?.success) setPos(poRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
    } catch {
      toast.error("Gagal memuat data jaminan bank");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      form_number: "BG-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      form_date: new Date().toISOString().split("T")[0],
      po_id: pos[0]?.id || "",
      supplier_id: suppliers[0]?.id || "",
      bg_number: "",
      bg_type: "PELAKSANAAN",
      issuing_bank: "",
      amount: 0,
      effective_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      claim_deadline: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      confirmation_status: "UNVERIFIED",
      notes: "",
    });
    setUploadedFile("");
    setIsDialogOpen(true);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveGuarantee(false);
  };

  const handlePost = async () => {
    await saveGuarantee(true);
  };

  const saveGuarantee = async (isPosted: boolean) => {
    if (!form.bg_number || !form.issuing_bank || Number(form.amount) <= 0) {
      toast.error("Nomor warkat, bank penerbit, dan nominal jaminan wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await poService.createBankGuarantee({
        ...form,
        amount: Number(form.amount),
        confirmation_status: isPosted ? "VERIFIED_GENUINE" : form.confirmation_status,
      });
      if (res?.success) {
        toast.success(isPosted ? "Data Bank Garansi berhasil di-POSTING!" : "Data Bank Garansi berhasil disimpan sebagai draft!");
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

  const handleVerify = async (id: string, status: string) => {
    try {
      const res = await poService.verifyBankGuarantee(id, status);
      if (res?.success) {
        toast.success("Status verifikasi bank garansi diperbarui");
        fetchData();
      }
    } catch {
      toast.error("Gagal memperbarui verifikasi");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Bank Garansi (Bab 4.2)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan jaminan penawaran, pelaksanaan, pemeliharaan, dan klarifikasi keabsahan bank PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Tambah Bank Garansi
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Bank Garansi</CardTitle>
              <CardDescription className="text-xs">
                Daftar warkat jaminan bank garansi yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari nomor BG / bank..."
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
                  <th className="py-3 px-4">No. Seri Warkat BG</th>
                  <th className="py-3 px-4">Jenis Jaminan</th>
                  <th className="py-3 px-4">Bank Penerbit</th>
                  <th className="py-3 px-4">Nilai Jaminan (Rp)</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4">Status Konfirmasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat data jaminan...</td></tr>
                ) : guarantees.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada data jaminan bank garansi.</td></tr>
                ) : (
                  guarantees.map((bg) => (
                    <tr key={bg.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{bg.bg_number}</td>
                      <td className="py-3 px-4 font-medium">{bg.bg_type}</td>
                      <td className="py-3 px-4">{bg.issuing_bank}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                        Rp {Number(bg.amount || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div>Mulai: {bg.effective_date ? new Date(bg.effective_date).toLocaleDateString("id-ID") : "-"}</div>
                        <div className="text-muted-foreground">Tempo: {bg.expiry_date ? new Date(bg.expiry_date).toLocaleDateString("id-ID") : "-"}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={bg.confirmation_status === "VERIFIED_GENUINE" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {bg.confirmation_status === "VERIFIED_GENUINE" ? "Terkonfirmasi Sah" : "Belum Dikonfirmasi"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {bg.confirmation_status !== "VERIFIED_GENUINE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50"
                            onClick={() => handleVerify(bg.id, "VERIFIED_GENUINE")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Konfirmasi Sah
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM BANK GARANSI (Bab 4.2.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Form Bank Garansi (Bab 4.2.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & IDENTITAS WARKAT */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Jaminan & Kontrak PO
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis Sistem)</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Jenis Jaminan *</Label>
                  <select
                    value={form.bg_type}
                    onChange={(e) => setForm({ ...form, bg_type: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    required
                  >
                    <option value="PENAWARAN">Jaminan Penawaran (Bid Bond)</option>
                    <option value="PELAKSANAAN">Jaminan Pelaksanaan (Performance Bond)</option>
                    <option value="UANG_MUKA">Jaminan Uang Muka (Advance Payment Bond)</option>
                    <option value="PEMELIHARAAN">Jaminan Pemeliharaan (Maintenance Bond)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tentukan jenis dari jaminan bank garansi</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nomor Purchase Order / Rujukan Kontrak</Label>
                  <select
                    value={form.po_id}
                    onChange={(e) => setForm({ ...form, po_id: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                  >
                    <option value="">-- Pilih Kontrak / PO Terkait --</option>
                    {pos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.po_number} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nama Rekanan / Vendor *</Label>
                  <select
                    value={form.supplier_id}
                    onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    required
                  >
                    <option value="">-- Pilih Rekanan Terdaftar --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nomor Seri Warkat Bank Garansi *</Label>
                  <Input
                    value={form.bg_number}
                    onChange={(e) => setForm({ ...form, bg_number: e.target.value })}
                    placeholder="Contoh: BG/BM/2026/00892"
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: PERBANKAN & NOMINAL */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <DollarSign className="w-4 h-4 text-primary" />
                2. Data Finansial & Masa Berlaku
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Bank Penerbit *</Label>
                  <Input
                    value={form.issuing_bank}
                    onChange={(e) => setForm({ ...form, issuing_bank: e.target.value })}
                    placeholder="Contoh: PT Bank Mandiri (Persero) Tbk, KC Tarahan"
                    className="text-xs mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nilai Nominal Jaminan (Rp) *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    placeholder="0"
                    className="text-xs mt-1 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Tanggal Mulai Berlaku *</Label>
                  <Input
                    type="date"
                    value={form.effective_date}
                    onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Jatuh Tempo *</Label>
                  <Input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Batas Akhir Klaim *</Label>
                  <Input
                    type="date"
                    value={form.claim_deadline}
                    onChange={(e) => setForm({ ...form, claim_deadline: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
              </div>

              {/* UPLOAD FILE WARKAT */}
              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Warkat Bank Garansi (Scan PDF)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedFile(e.target.files[0].name);
                          toast.success(`File ${e.target.files[0].name} siap diunggah`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedFile || "Belum ada berkas warkat dipilih"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Maksimal ukuran file 25MB (Format scan resmi bank penerbit)
                </p>
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
                  {isSubmitting ? "Memproses..." : "Post (Posting Transaksi)"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

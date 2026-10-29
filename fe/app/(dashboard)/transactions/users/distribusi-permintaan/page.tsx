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
import { ClipboardList, Search, Plus, UserCheck, Upload, FileText, Send, Calendar } from "lucide-react";
import { usersSubmoduleService, masterService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { RequestDistribution, ProcurementRequest, User } from "@/types";
import toast from "react-hot-toast";

export default function DistribusiPermintaanUserPage() {
  const [distributions, setDistributions] = useState<RequestDistribution[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  // Form Distribusi Permintaan according to PDF Manual 4.6.2.2
  const [form, setForm] = useState({
    form_number: "DSP-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    assigned_to_user_id: "",
    notes: "",
  });

  const [selectedReqData, setSelectedReqData] = useState<ProcurementRequest | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, rRes, uRes] = await Promise.all([
        usersSubmoduleService.getDistributions(search),
        procurementService.getAll({ limit: 50 }),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (dRes?.success) setDistributions(dRes.data || []);
      if (rRes?.success) setRequests(rRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat distribusi permintaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      form_number: "DSP-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      form_date: new Date().toISOString().split("T")[0],
      request_id: requests[0]?.id || "",
      assigned_to_user_id: users[0]?.id || "",
      notes: "Mohon segera diproses menjadi Usulan Pengadaan (RO) dan HPE.",
    });
    setSelectedReqData(requests[0] || null);
    setUploadedFile("");
    setIsDialogOpen(true);
  };

  const handleSelectRequest = (reqId: string) => {
    setForm({ ...form, request_id: reqId });
    const r = requests.find((item) => item.id === reqId);
    setSelectedReqData(r || null);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDistribution(false);
  };

  const handlePost = async () => {
    await saveDistribution(true);
  };

  const saveDistribution = async (isPosted: boolean) => {
    if (!form.request_id || !form.assigned_to_user_id) {
      toast.error("Pilih usulan permintaan dan staf tujuan disposisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await usersSubmoduleService.createDistribution({
        ...form,
        target_completion_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
      if (res?.success) {
        toast.success(isPosted ? "Distribusi permintaan berhasil di-POSTING!" : "Distribusi permintaan berhasil disimpan sebagai draft!");
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
            <ClipboardList className="w-7 h-7 text-primary" />
            Distribusi Permintaan User (Bab 4.6.2)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pendistribusian berkas Usulan Permintaan oleh Supervisor Rendal Har kepada Staf Perencana Pengadaan UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Distribusi Permintaan
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Distribusi Permintaan</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi distribusi permintaan yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari nomor nota / penerima..."
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
                  <th className="py-3 px-4">Nomor Usulan (UPM)</th>
                  <th className="py-3 px-4">Perihal Pengadaan</th>
                  <th className="py-3 px-4">Penerima Tugas (Staf)</th>
                  <th className="py-3 px-4">Tanggal Distribusi</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data distribusi...</td></tr>
                ) : distributions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada distribusi permintaan.</td></tr>
                ) : (
                  distributions.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {d.request?.request_number || "UPM-2026-X"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{d.request?.title || "Pengadaan Barang / Jasa"}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{d.assigned_to_user?.name || "Staf Ditunjuk"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {d.distribution_date ? new Date(d.distribution_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={d.status === "ASSIGNED" || d.status === "POSTED" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {d.status === "ASSIGNED" || d.status === "POSTED" ? "Diposting" : "Draft"}
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

      {/* DIALOG FORM DISTRIBUSI PERMINTAAN (Bab 4.6.2.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ClipboardList className="w-5 h-5 text-primary" />
              Form Distribusi Permintaan (Bab 4.6.2.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Supervisor Rendal Har PT PLN Nusantara Power UP Sembalang yang memiliki hak akses ke sistem.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & IDENTITAS FORM */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Form Distribusi
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
                    disabled
                    className="text-xs mt-1 bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tanggal sistem saat distribusi dibuat</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Usulan Permintaan yang Didistribusikan *</Label>
                <select
                  value={form.request_id}
                  onChange={(e) => handleSelectRequest(e.target.value)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-medium"
                  required
                >
                  <option value="">-- [Pilih Usulan Permintaan] --</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.request_number} - {r.title} (Rp {Number(r.rab_amount || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Pilih usulan permintaan yang akan didistribusikan ke proses selanjutnya (Usulan Pengadaan / RO)
                </p>
              </div>

              {selectedReqData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">No. Work Order (WO):</span>
                    <span className="font-mono font-bold text-primary">{selectedReqData.wo_number || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">No. PRK Anggaran:</span>
                    <span className="font-mono font-medium text-foreground">{selectedReqData.prk_number || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Tipe Kontrak:</span>
                    <Badge color="secondary">{selectedReqData.contract_type || "BARANG"}</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: PENGGUNA TUJUAN & UPLOAD PENUGASAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-primary" />
                2. Penunjukan Staf Pelaksana & Berkas Penugasan
              </div>

              <div>
                <Label className="text-xs font-semibold">Pengguna yang Diberi Tugas (Staf Perencana) *</Label>
                <select
                  value={form.assigned_to_user_id}
                  onChange={(e) => setForm({ ...form, assigned_to_user_id: e.target.value })}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-medium"
                  required
                >
                  <option value="">-- [Pilih Staf Penerima Tugas] --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.nid}) - {u.role?.name || "Staf Perencana"}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Pengguna yang akan diberi tugas mengerjakan proses berikutnya yaitu Usulan Pengadaan (RO)
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Penugasan / Disposisi (Max 25MB)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUploadedFile(e.target.files[0].name);
                          toast.success(`Dokumen ${e.target.files[0].name} siap diunggah`);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedFile || "Belum ada berkas penugasan dipilih"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Catatan / Instruksi Disposisi</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan penugasan untuk staf perencana pengadaan..."
                  className="mt-1.5 text-xs h-9"
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
                  {isSubmitting ? "Memproses..." : "Post (Posting Distribusi)"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

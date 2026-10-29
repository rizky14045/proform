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
  ClipboardList,
  Search,
  Plus,
  UserCheck,
  Upload,
  FileText,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService, hpeService } from "@/services/modules.service";
import { ProcurementAssignment, EngineeringEstimate, User } from "@/types";
import toast from "react-hot-toast";

export default function DistribusiPengadaanPage() {
  const [assignments, setAssignments] = useState<ProcurementAssignment[]>([]);
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showHpeSelectModal, setShowHpeSelectModal] = useState(false);
  const [showBuyerSelectModal, setShowBuyerSelectModal] = useState(false);
  const [hpeFilter, setHpeFilter] = useState("");
  const [buyerFilter, setBuyerFilter] = useState("");

  // Form Fields per Bab 4.8.1.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    selected_hpe_display: "",
    hpe_title: "",
    buyer_user_id: "",
    selected_buyer_display: "",
    target_closing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    file_name: "",
    file_uploaded: false,
    notes: "Laksanakan proses pelelangan / penunjukan pengadaan sesuai tata kelola INTERLOGS",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, eRes, uRes] = await Promise.all([
        pengadaanSubmoduleService.getAssignments(search),
        hpeService.getAllHPE({ limit: 50 }),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (aRes?.success) setAssignments(aRes.data || []);
      if (eRes?.success) setEstimates(eRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat distribusi pengadaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `DPG/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      selected_hpe_display: "",
      hpe_title: "",
      buyer_user_id: "",
      selected_buyer_display: "",
      target_closing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      file_name: "",
      file_uploaded: false,
      notes: "Laksanakan proses pelelangan / penunjukan pengadaan sesuai tata kelola INTERLOGS",
    });
    setIsDialogOpen(true);
  };

  const handleSelectHPE = (est: EngineeringEstimate) => {
    setForm((prev) => ({
      ...prev,
      request_id: est.request_id || est.id,
      selected_hpe_display: `${est.ee_number} - ${est.request?.title || "Paket Pengadaan"}`,
      hpe_title: est.request?.title || "Paket Pengadaan",
    }));
    setShowHpeSelectModal(false);
    toast.success(`HPE ${est.ee_number} terpilih`);
  };

  const handleSelectBuyer = (u: User) => {
    setForm((prev) => ({
      ...prev,
      buyer_user_id: u.id,
      selected_buyer_display: `${u.name} (${u.role?.name || "Pelaksana Pengadaan"})`,
    }));
    setShowBuyerSelectModal(false);
    toast.success(`Buyer ${u.name} terpilih`);
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih berkas dokumen disposisi terlebih dahulu!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen disposisi pengadaan berhasil diunggah!");
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    if (!form.request_id || !form.buyer_user_id) {
      toast.error("Silakan lengkapi dokumen HPE dan Pelaksana Pengadaan bertanda (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await pengadaanSubmoduleService.createAssignment({
        request_id: form.request_id,
        buyer_user_id: form.buyer_user_id,
        assignment_date: form.form_date,
        target_closing_date: form.target_closing_date,
        notes: form.notes,
      });
      if (res?.success) {
        toast.success(
          actionType === "POST"
            ? "Data distribusi berhasil di-POST ke Pelaksana Pengadaan!"
            : "Data distribusi berhasil disimpan sebagai Draft"
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

  const handleSendForRevision = () => {
    toast("Form dikembalikan ke perencana untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredEstimates = estimates.filter(
    (est) =>
      (est.ee_number && est.ee_number.toLowerCase().includes(hpeFilter.toLowerCase())) ||
      (est.hpe_number && est.hpe_number.toLowerCase().includes(hpeFilter.toLowerCase())) ||
      (est.request?.title && est.request.title.toLowerCase().includes(hpeFilter.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(buyerFilter.toLowerCase()) ||
      (u.role?.name && u.role.name.toLowerCase().includes(buyerFilter.toLowerCase()))
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.1</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <ClipboardList className="w-7 h-7 text-primary" />
            Distribusi Pengadaan Pelaksana
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penugasan paket pengadaan kepada Staf Pelaksana Pengadaan (Buyer) untuk penyusunan HPS, Pengumuman, Evaluasi, Negosiasi, dan PO
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Distribusi Pengadaan
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Transaksi Distribusi Pengadaan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring beban penugasan buyer tender dan penunjukan rekanan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari paket / buyer..."
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
                  <th className="py-3 px-4">No. Form</th>
                  <th className="py-3 px-4">No. Dokumen HPE</th>
                  <th className="py-3 px-4">Nama Paket Pengadaan</th>
                  <th className="py-3 px-4">Pelaksana (Buyer)</th>
                  <th className="py-3 px-4">Tgl Penugasan</th>
                  <th className="py-3 px-4">Target Selesai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Memuat data distribusi pengadaan...
                    </td>
                  </tr>
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Belum ada penugasan pelaksana pengadaan.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a, idx) => (
                    <tr key={a.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`DPG/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {a.request?.request_number || "HPE-PLN-001"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{a.request?.title || "-"}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {a.buyer_user?.name || "Staf Pengadaan"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{a.assignment_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground">{a.target_closing_date?.split("T")[0] || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {a.status || "POSTED"}
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

      {/* MODAL FORM DISTRIBUSI PENGADAAN (BAB 4.8.1.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Form Distribusi Pengadaan
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.1.2 — Penugasan paket dari Dokumen HPE kepada Pejabat Pelaksana Pengadaan
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
                <FileText className="w-3.5 h-3.5" /> Identitas Form Distribusi Pengadaan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
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

            {/* SECTION 2: RUJUKAN HPE & PELAKSANA PENGADAAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Paket HPE & Pejabat Pelaksana
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pop-up Search Rujukan HPE */}
                <div>
                  <Label className="text-xs font-semibold">HPE Pengadaan yang Dikerjakan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_hpe_display || "Klik Cari untuk memilih dokumen HPE..."}
                      readOnly
                      placeholder="Pilih Dokumen HPE..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowHpeSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHpeSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                  {form.hpe_title && (
                    <p className="text-[11px] text-primary font-medium mt-1 truncate">
                      Paket: {form.hpe_title}
                    </p>
                  )}
                </div>

                {/* Pop-up Search Pelaksana Pengadaan (Buyer) */}
                <div>
                  <Label className="text-xs font-semibold">Pelaksana Pengadaan Ditugaskan (Buyer) *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_buyer_display || "Klik Cari untuk memilih staf pengadaan..."}
                      readOnly
                      placeholder="Pilih Pejabat Buyer..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowBuyerSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowBuyerSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Target Tanggal Selesai *</Label>
                  <Input
                    type="date"
                    value={form.target_closing_date}
                    onChange={(e) => setForm({ ...form, target_closing_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Catatan / Arahan Pengadaan</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contoh: Proses pengadaan sesuai ketentuan RKS & HPS"
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN PENUGASAN (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen Disposisi / Penugasan (Maks. 25MB)
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

            {/* ACTION BUTTONS PER BAB 4.8.1.2 */}
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

      {/* POP-UP MODAL CARI DOKUMEN HPE (BAB 4.8.1.2 LANGKAH 4) */}
      <Dialog open={showHpeSelectModal} onOpenChange={setShowHpeSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen HPE (Harga Perkiraan Engineering)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor HPE atau judul pengadaan..."
                value={hpeFilter}
                onChange={(e) => setHpeFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor HPE</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3">Total Nilai HPE</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen HPE yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((est) => (
                      <tr key={est.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{est.ee_number}</td>
                        <td className="py-2.5 px-3 font-medium">{est.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">
                          Rp {(est.total_estimated_cost || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectHPE(est)}
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

      {/* POP-UP MODAL CARI PELAKSANA PENGADAAN (BAB 4.8.1.2 LANGKAH 5) */}
      <Dialog open={showBuyerSelectModal} onOpenChange={setShowBuyerSelectModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Pilih Pejabat Pelaksana Pengadaan (Buyer)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama buyer atau peran..."
                value={buyerFilter}
                onChange={(e) => setBuyerFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nama Pegawai</th>
                    <th className="py-2.5 px-3">Jabatan / Role</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada staf buyer yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{u.name}</td>
                        <td className="py-2.5 px-3">{u.role?.name || "Pelaksana Pengadaan"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{u.email}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectBuyer(u)}
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

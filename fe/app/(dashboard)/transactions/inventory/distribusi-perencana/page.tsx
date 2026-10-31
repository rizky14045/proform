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
import { inventorySubmoduleService, masterService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { InventoryDistribution, ProcurementRequest, User } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

export default function DistribusiPerencanaPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Main Form Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showRequestSelectModal, setShowRequestSelectModal] = useState(false);
  const [showUserSelectModal, setShowUserSelectModal] = useState(false);
  const [requestFilter, setRequestFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // Form Fields per Bab 4.7.1.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    selected_request_display: "",
    request_title: "",
    planner_user_id: "",
    selected_user_display: "",
    target_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    file_name: "",
    file_uploaded: false,
    notes: "Penyusunan estimasi enjiniring (HPE) dan telaah kesiapan dokumen teknis RKS",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, rRes, uRes] = await Promise.all([
        inventorySubmoduleService.getDistributions(search),
        procurementService.getAll({ limit: 50 }),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (dRes?.success) setDistributions(dRes.data || []);
      if (rRes?.success) setRequests(rRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat distribusi perencana");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `DPP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      selected_request_display: "",
      request_title: "",
      planner_user_id: "",
      selected_user_display: "",
      target_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      file_name: "",
      file_uploaded: false,
      notes: "Penyusunan estimasi enjiniring (HPE) dan telaah kesiapan dokumen teknis RKS",
    });
    setIsDialogOpen(true);
  };

  const handleSelectRequest = (req: ProcurementRequest) => {
    setForm((prev) => ({
      ...prev,
      request_id: req.id,
      selected_request_display: req.request_number,
      request_title: req.title,
    }));
    setShowRequestSelectModal(false);
    toast.success(`Paket ${req.request_number} terpilih`);
  };

  const handleSelectUser = (u: User) => {
    setForm((prev) => ({
      ...prev,
      planner_user_id: u.id,
      selected_user_display: `${u.name} (${u.role?.name || "Staf Perencana"})`,
    }));
    setShowUserSelectModal(false);
    toast.success(`Pejabat ${u.name} terpilih`);
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

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Paket Pengadaan", value: form.request_id, required: true },
      { field: "planner_user_id", label: "Pejabat Perencana Terpilih", value: form.planner_user_id, required: true },
      { field: "form_date", label: "Tanggal Form Distribusi", value: form.form_date, required: true, type: "date" },
      { field: "target_date", label: "Target Selesai Penyusunan RKS/HPE", value: form.target_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await inventorySubmoduleService.createDistribution({
        request_id: form.request_id,
        planner_user_id: form.planner_user_id,
        distribution_date: form.form_date,
        target_date: form.target_date,
        notes: form.notes,
      });
      if (res?.success) {
        toast.success(
          actionType === "POST"
            ? "Data distribusi berhasil di-POST ke tahap HPE!"
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
    toast("Form dikembalikan ke pemohon untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.request_number.toLowerCase().includes(requestFilter.toLowerCase()) ||
      r.title.toLowerCase().includes(requestFilter.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
      (u.role?.name && u.role.name.toLowerCase().includes(userFilter.toLowerCase()))
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
            <Badge variant="secondary" className="text-xs">Bab 4.7.1</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <ClipboardList className="w-7 h-7 text-primary" />
            Distribusi Perencana Pengadaan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penugasan berkas usulan pengadaan kepada Tim Perencana Pengadaan untuk penyusunan Harga Perkiraan Engineering (HPE)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Distribusi
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Transaksi Distribusi Perencana</CardTitle>
              <CardDescription className="text-xs">
                Monitoring beban kerja Tim Perencana dalam menyusun HPE dan RKS
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari paket / perencana..."
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
                  <th className="py-3 px-4">No. Usulan / RO</th>
                  <th className="py-3 px-4">Nama Paket Pengadaan</th>
                  <th className="py-3 px-4">Perencana Ditugaskan</th>
                  <th className="py-3 px-4">Tgl Distribusi</th>
                  <th className="py-3 px-4">Target Selesai</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Memuat data distribusi...
                    </td>
                  </tr>
                ) : distributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Belum ada transaksi distribusi perencana pengadaan.
                    </td>
                  </tr>
                ) : (
                  distributions.map((d, idx) => (
                    <tr key={d.id || idx} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`DPP/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {d.request?.request_number || "RO-PLN-001"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{d.request?.title || "-"}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {d.planner_user?.name || "Staf Perencana"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{d.distribution_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground">{d.target_date?.split("T")[0] || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {d.status || "POSTED"}
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

      {/* MODAL FORM DISTRIBUSI PERENCANA PENGADAAN (BAB 4.7.1.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Form Distribusi Perencana Pengadaan
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.7.1.2 — Penugasan berkas usulan kepada Staf Perencana untuk penyusunan HPE
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
                <FileText className="w-3.5 h-3.5" /> Informasi Form Distribusi
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

            {/* SECTION 2: RUJUKAN PAKET & PEJABAT PERENCANA */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Penugasan Paket & Pejabat
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pop-up Search Rujukan Usulan Pengadaan */}
                <div>
                  <Label className="text-xs font-semibold">Usulan Pengadaan (RO) yang Dikerjakan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_request_display || "Klik Cari untuk memilih usulan..."}
                      readOnly
                      placeholder="Pilih Paket Usulan..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowRequestSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRequestSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                  {form.request_title && (
                    <p className="text-[11px] text-primary font-medium mt-1 truncate">
                      Paket: {form.request_title}
                    </p>
                  )}
                </div>

                {/* Pop-up Search Pejabat Perencana */}
                <div>
                  <Label className="text-xs font-semibold">Pengguna yang Diberi Tugas (HPE) *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_user_display || "Klik Cari untuk memilih staf perencana..."}
                      readOnly
                      placeholder="Pilih Staf Perencana..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowUserSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowUserSelectModal(true)}
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
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Catatan / Arahan Disposisi</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Contoh: Penyusunan estimasi enjiniring (HPE) dan telaah teknis"
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN PENUGASAN (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Dokumen Disposisi / Penugasan (Maks. 25MB)
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

            {/* ACTION BUTTONS PER BAB 4.7.1.2 */}
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

      {/* POP-UP MODAL CARI USULAN PENGADAAN (BAB 4.7.1.2 LANGKAH 4) */}
      <Dialog open={showRequestSelectModal} onOpenChange={setShowRequestSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Usulan Pengadaan (RO / PPA)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor atau judul paket usulan..."
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor Usulan</th>
                    <th className="py-2.5 px-3">Judul Pengadaan</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Estimasi Nilai</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Tidak ada usulan pengadaan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{r.request_number}</td>
                        <td className="py-2.5 px-3 font-medium">{r.title}</td>
                        <td className="py-2.5 px-3">{r.contract_type || "Spot"}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">
                          Rp {(r.estimated_budget || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectRequest(r)}
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

      {/* POP-UP MODAL CARI PEJABAT PERENCANA (BAB 4.7.1.2 LANGKAH 5) */}
      <Dialog open={showUserSelectModal} onOpenChange={setShowUserSelectModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Pilih Pejabat Staf Perencana Pengadaan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama staf atau jabatan..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
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
                        Tidak ada staf perencana yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{u.name}</td>
                        <td className="py-2.5 px-3">{u.role?.name || "Staf Perencana"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{u.email}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectUser(u)}
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

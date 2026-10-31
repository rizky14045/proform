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
  PackageCheck,
  Search,
  Plus,
  Building2,
  Calendar,
  Users,
  Wrench,
  UploadCloud,
  FileText,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
} from "lucide-react";
import { warehouseService, poService, masterService } from "@/services/modules.service";
import { InspectionAcceptanceAct, PurchaseOrder, User } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface TeamMember {
  role_title: string;
  user_id: string;
  name: string;
  nip: string;
}

interface ServiceDetail {
  id: string;
  service_name: string;
  contract_number: string;
  sla_percentage: number;
  handover_date: string;
  status_condition: string;
}

export default function WarehouseActsPage() {
  const [acts, setActs] = useState<InspectionAcceptanceAct[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector modal states
  const [poSelectOpen, setPoSelectOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [activeMemberRoleIdx, setActiveMemberRoleIdx] = useState<number | null>(null);

  const [form, setForm] = useState({
    act_number: `BAST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    act_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    vendor_name: "",
    handover_date: new Date().toISOString().split("T")[0],
    contract_levering_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    uploaded_file_name: "",
    completion_percentage: 100,
    conclusion: "DITERIMA_PENUH",
    notes: "Pekerjaan jasa telah diperiksa oleh Tim Keuangan dan User, kelaikan operasi memuaskan dan SLA 100% tercapai.",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { role_title: "Ketua Tim Pemeriksa (SPV Keuangan)", user_id: "", name: "", nip: "" },
    { role_title: "Sekretaris (Staff Keuangan)", user_id: "", name: "", nip: "" },
    { role_title: "Anggota Tim User / Peminta Jasa", user_id: "", name: "", nip: "" },
    { role_title: "Anggota Pengawas Mutu / K3", user_id: "", name: "", nip: "" },
  ]);

  const [services, setServices] = useState<ServiceDetail[]>([
    {
      id: "srv-1",
      service_name: "Jasa Overhaul & Balancing Rotor Generator Turbin Blok 1",
      contract_number: "PO-2026-SRV-0081",
      sla_percentage: 100,
      handover_date: new Date().toISOString().split("T")[0],
      status_condition: "LULUS_KOMISIONING",
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, uRes] = await Promise.all([
        warehouseService.getAllActs(search).catch(() => ({ success: true, data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        masterService.getUsers({ limit: 50 }).catch(() => ({ success: true, data: [] })),
      ]);
      if (aRes?.data) setActs(aRes.data || []);
      if (pRes?.data) setPos(pRes.data || []);
      if (uRes?.data) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat berkas Berita Acara");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openAddModal = () => {
    setForm({
      act_number: `BAST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      act_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      vendor_name: "",
      handover_date: new Date().toISOString().split("T")[0],
      contract_levering_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      uploaded_file_name: "",
      completion_percentage: 100,
      conclusion: "DITERIMA_PENUH",
      notes: "Pekerjaan jasa telah diperiksa oleh Tim Keuangan dan User, kelaikan operasi memuaskan dan SLA 100% tercapai.",
    });

    if (users.length > 0) {
      setTeamMembers([
        {
          role_title: "Ketua Tim Pemeriksa (SPV Keuangan)",
          user_id: users[0]?.id || "",
          name: users[0]?.name || "SPV Keuangan Sembalang",
          nip: users[0]?.nip || "19840101",
        },
        {
          role_title: "Sekretaris (Staff Keuangan)",
          user_id: users[1]?.id || users[0]?.id || "",
          name: users[1]?.name || "Staff Keuangan",
          nip: users[1]?.nip || "19910202",
        },
        {
          role_title: "Anggota Tim User / Peminta Jasa",
          user_id: users[2]?.id || users[0]?.id || "",
          name: users[2]?.name || "Supervisor Pemeliharaan",
          nip: users[2]?.nip || "19880303",
        },
        {
          role_title: "Anggota Pengawas Mutu / K3",
          user_id: users[3]?.id || users[0]?.id || "",
          name: users[3]?.name || "Inspector Mutu",
          nip: users[3]?.nip || "19930404",
        },
      ]);
    }
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      po_number: p.po_number || "",
      po_title: p.title || "",
      vendor_name: p.vendor?.name || p.supplier?.name || "Vendor Rekanan",
    }));

    setServices([
      {
        id: "srv-po",
        service_name: p.title || "Jasa Pemeliharaan / Konstruksi",
        contract_number: p.po_number || "PO-JASA",
        sla_percentage: 100,
        handover_date: new Date().toISOString().split("T")[0],
        status_condition: "LULUS_KOMISIONING",
      },
    ]);

    setPoSelectOpen(false);
    toast.success(`PO Jasa ${p.po_number} dipilih`);
  };

  const handleSelectMemberUser = (u: User) => {
    if (activeMemberRoleIdx === null) return;
    setTeamMembers((prev) =>
      prev.map((m, idx) =>
        idx === activeMemberRoleIdx
          ? { ...m, user_id: u.id, name: u.name, nip: u.nip || "-" }
          : m
      )
    );
    setUserSelectOpen(false);
    setActiveMemberRoleIdx(null);
    toast.success(`Petugas ${u.name} ditugaskan`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, uploaded_file_name: res.fileName }));
    }
  };

  const handleSubmit = async (actionType: "DRAFT" | "SUBMITTED") => {
    const validation = validateForm([
      { field: "po_id", label: "Rujukan Purchase Order Jasa", value: form.po_id, required: true },
      { field: "handover_date", label: "Tanggal Serah Terima Pekerjaan", value: form.handover_date, required: true, type: "date" },
      { field: "act_date", label: "Tanggal Form BAST", value: form.act_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await warehouseService.createAct({
        act_number: form.act_number,
        act_type: "BAST_JASA",
        po_id: form.po_id,
        lead_inspector_id: teamMembers[0]?.user_id || users[0]?.id || "admin",
        secretary_id: teamMembers[1]?.user_id || users[0]?.id || "admin",
        completion_percentage: form.completion_percentage,
        conclusion: form.conclusion,
        status: actionType === "SUBMITTED" ? "PENDING_APPROVAL" : "DRAFT",
        notes: `${form.notes} [Serah Terima: ${form.handover_date}] [Levering: ${form.contract_levering_date}] [Berkas: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "SUBMITTED"
            ? "Berita Acara Serah Terima (BAST) dikirim untuk persetujuan [Send For Approval]"
            : "Berita Acara Serah Terima (BAST) berhasil disimpan sebagai Draft"
        );
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(res?.message || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPOs = pos.filter((p) => {
    const q = poSearch.toLowerCase();
    return (
      p.po_number?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.vendor?.name?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.nip?.toLowerCase().includes(q) ||
      u.role?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-primary" />
            Pemeriksaan Jasa (BAST Keuangan) (Bab 4.9.6)
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Pemeriksaan bersama Berita Acara Serah Terima (BAST) Pekerjaan Jasa oleh SPV Keuangan dan Tim Pemeriksa
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> [Add] Pemeriksaan Jasa (BAST)
        </Button>
      </div>

      {/* Tabel List */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Pemeriksaan Jasa (Bab 4.9.6.1)</CardTitle>
              <CardDescription className="text-xs">
                Melihat dan memonitor berkas Berita Acara Serah Terima Pekerjaan Jasa
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor berita acara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={loadData} className="h-9 px-3 text-xs">
                [Find]
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">No. Berita Acara</th>
                  <th className="py-3 px-4">Jenis Akta</th>
                  <th className="py-3 px-4">Ketua Tim Pemeriksa</th>
                  <th className="py-3 px-4 text-center">Progres SLA</th>
                  <th className="py-3 px-4">Kesimpulan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat berkas Berita Acara...
                    </td>
                  </tr>
                ) : acts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Belum ada berkas BAST. Klik [Add] untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  acts.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{a.act_number}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px]">
                          {a.act_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {a.lead_inspector?.name || "SPV Keuangan"}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {a.completion_percentage}%
                      </td>
                      <td className="py-3 px-4 font-medium">{a.conclusion}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {a.status}
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

      {/* FORM MODAL PEMERIKSAAN JASA (BAB 4.9.6.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
              </div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <PackageCheck className="w-5 h-5 text-primary" />
                Form Pemeriksaan Jasa (Bab 4.9.6.2)
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dikerjakan oleh SPV Keuangan bersama Tim Pemeriksa BA untuk verifikasi dan serah terima hasil pekerjaan jasa
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form BAST Keuangan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Form <span className="text-xs text-muted-foreground">(Otomatis Sistem)</span>
                  </Label>
                  <Input
                    value={form.act_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-mono bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Form <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.act_date}
                    onChange={(e) => setForm({ ...form, act_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Rujukan PO Jasa (Purchase Order) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] PO Jasa"
                      value={form.po_number || ""}
                      readOnly
                      className="text-xs h-9 bg-background font-mono font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPoSelectOpen(true)}
                      className="h-9 px-3 text-xs shrink-0"
                    >
                      [Select]
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Serah Terima Pekerjaan (Tgl Serah Terima) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.handover_date}
                    onChange={(e) => setForm({ ...form, handover_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Terisi otomatis dari hasil Penyelesaian Pekerjaan
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Levering PO <span className="text-xs text-muted-foreground">(Dapat diubah)</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.contract_levering_date}
                    onChange={(e) => setForm({ ...form, contract_levering_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Kesimpulan Akhir Pemeriksaan Jasa <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={form.conclusion}
                    onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="DITERIMA_PENUH">DITERIMA PENUH (100% Sesuai KAK & Garansi Aktif)</option>
                    <option value="DITERIMA_BERSYARAT">DITERIMA BERSYARAT (Perbaikan Minor)</option>
                    <option value="DITOLAK_TOTAL">DITOLAK (Tidak Memenuhi Syarat Teknis)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian Anggota Tim Pemeriksa BA */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Bagian Anggota Tim Pemeriksa BA Sesuai Bagian
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Keuangan, User Peminta Jasa, dan K3
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Peran / Unsur Tim BA</th>
                      <th className="py-2.5 px-3">Nama Pegawai Pemeriksa</th>
                      <th className="py-2.5 px-3">NIP</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {teamMembers.map((member, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{member.role_title}</td>
                        <td className="py-2.5 px-3 text-foreground font-medium">
                          {member.name || <span className="text-muted-foreground italic">Belum ditentukan</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{member.nip || "-"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveMemberRoleIdx(idx);
                              setUserSelectOpen(true);
                            }}
                            className="h-7 text-xs px-2.5"
                          >
                            [Select]
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bagian Detail Jasa & % SLA */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Detail Nama Jasa & Capaian SLA (Otomatis dari Penyelesaian Pekerjaan)
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {services.length} Lingkup Jasa
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Nama Jasa Pekerjaan</th>
                      <th className="py-2.5 px-3">No. Kontrak / PO</th>
                      <th className="py-2.5 px-3 text-center">% Penyelesaian / SLA</th>
                      <th className="py-2.5 px-3">Tgl Serah Terima</th>
                      <th className="py-2.5 px-3">Status Kelaikan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{srv.service_name}</td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">{srv.contract_number}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                          {srv.sla_percentage}%
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{srv.handover_date}</td>
                        <td className="py-2.5 px-3 font-medium text-emerald-600">
                          {srv.status_condition}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Verifikasi */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Catatan Verifikasi Tim Keuangan
              </h3>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="text-xs h-9"
              />
            </div>

            {/* Upload Berkas Dokumen BAST Fisik */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Berkas BAST Bertanda Tangan Fisik
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted text-xs bg-background">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Pilih File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-xs text-muted-foreground">
                  {form.uploaded_file_name ? (
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {form.uploaded_file_name}
                    </span>
                  ) : (
                    "Belum ada file dipilih (Maksimal 25 MB, format: PDF/DOC/XLS)"
                  )}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS PERSIS PDF */}
            <div className="flex items-center justify-between pt-5 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> [Back]
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs text-muted-foreground"
                >
                  [Cancel]
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("DRAFT")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> [Save as Draft]
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("SUBMITTED")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> [Send For Approval]
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP UP SELECTOR PO */}
      <Dialog open={poSelectOpen} onOpenChange={setPoSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Purchase Order Jasa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor PO, judul, vendor..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredPOs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada data Purchase Order ditemukan
                </div>
              ) : (
                filteredPOs.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-muted/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary">{p.po_number}</div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Vendor: {p.vendor?.name || p.supplier?.name || "Rekanan"} | Nilai: Rp{" "}
                        {Number(p.total_amount || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectPO(p)}
                      className="h-7 text-xs px-2.5"
                    >
                      [Select]
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP UP SELECTOR PEGAWAI TIM BA */}
      <Dialog open={userSelectOpen} onOpenChange={setUserSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Pilih Anggota Tim Pemeriksa Jasa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama pegawai atau NIP..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada pegawai ditemukan
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 hover:bg-muted/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-foreground">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        NIP: {u.nip || "-"} | Role: {u.role?.name || "Pegawai"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectMemberUser(u)}
                      className="h-7 text-xs px-2.5"
                    >
                      [Select]
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

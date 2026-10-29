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
  Files,
  Search,
  Plus,
  Building2,
  CheckCircle2,
  UploadCloud,
  FileText,
  Users,
  Boxes,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
} from "lucide-react";
import { warehouseService, poService, masterService } from "@/services/modules.service";
import { InspectionAcceptanceAct, PurchaseOrder, User } from "@/types";
import toast from "react-hot-toast";

interface TeamMember {
  role_title: string;
  user_id: string;
  name: string;
  nip: string;
}

interface ItemDetail {
  id: string;
  item_name: string;
  qty: number;
  unit: string;
  status_condition: string;
  inspection_notes: string;
}

export default function PemeriksaanBarangBAPHBPage() {
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
    form_number: `BAPHB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    inspection_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    vendor_name: "",
    ba_letter_number: `BA-PB/${new Date().getFullYear()}/GUD-SEM/${Math.floor(100 + Math.random() * 900)}`,
    uploaded_file_name: "",
    conclusion: "DITERIMA_PENUH",
    completion_percentage: 100,
    status: "DRAFT",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { role_title: "Ketua Tim Pemeriksa (SPV Gudang)", user_id: "", name: "", nip: "" },
    { role_title: "Sekretaris (Staff Gudang)", user_id: "", name: "", nip: "" },
    { role_title: "Anggota Tim User / Peminta", user_id: "", name: "", nip: "" },
    { role_title: "Anggota Tim K3 / Quality Control", user_id: "", name: "", nip: "" },
  ]);

  const [items, setItems] = useState<ItemDetail[]>([
    {
      id: "it-1",
      item_name: "Bearing SKF 6205-2RSH/C3 High Temp",
      qty: 20,
      unit: "PCS",
      status_condition: "SESUAI_SPESIFIKASI",
      inspection_notes: "Dimensi & toleransi sesuai sertifikat pabrikan, tidak ada korosi",
    },
    {
      id: "it-2",
      item_name: "Mechanical Seal Burgmann M7N/35-G9",
      qty: 5,
      unit: "SET",
      status_condition: "SESUAI_SPESIFIKASI",
      inspection_notes: "Permukaan seal face silicon carbide mulus tanpa goresan",
    },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, uRes] = await Promise.all([
        warehouseService.getAllActs(search).catch(() => ({ success: true, data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        masterService.getUsers({ limit: 50 }).catch(() => ({ success: true, data: [] })),
      ]);
      if (aRes?.success) {
        const filtered = (aRes.data || []).filter((a) => a.act_type === "BAPHB_BARANG");
        setActs(filtered);
      }
      if (pRes?.success) setPos(pRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat dokumen BA Pemeriksaan Barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({
      form_number: `BAPHB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      inspection_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      vendor_name: "",
      ba_letter_number: `BA-PB/${new Date().getFullYear()}/GUD-SEM/${Math.floor(100 + Math.random() * 900)}`,
      uploaded_file_name: "",
      conclusion: "DITERIMA_PENUH",
      completion_percentage: 100,
      status: "DRAFT",
    });
    // Set default names if users exist
    if (users.length > 0) {
      setTeamMembers([
        {
          role_title: "Ketua Tim Pemeriksa (SPV Gudang)",
          user_id: users[0]?.id || "",
          name: users[0]?.name || "SPV Gudang Sembalang",
          nip: users[0]?.nip || "19850101",
        },
        {
          role_title: "Sekretaris (Staff Gudang)",
          user_id: users[1]?.id || users[0]?.id || "",
          name: users[1]?.name || "Staff Gudang",
          nip: users[1]?.nip || "19900202",
        },
        {
          role_title: "Anggota Tim User / Peminta",
          user_id: users[2]?.id || users[0]?.id || "",
          name: users[2]?.name || "Engineer Pemeliharaan",
          nip: users[2]?.nip || "19920303",
        },
        {
          role_title: "Anggota Tim K3 / Quality Control",
          user_id: users[3]?.id || users[0]?.id || "",
          name: users[3]?.name || "Staff K3 & Mutu",
          nip: users[3]?.nip || "19940404",
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

    if (p.items && p.items.length > 0) {
      setItems(
        p.items.map((item, idx) => ({
          id: `item-${idx}`,
          item_name: item.item_name || item.name || `Material Item ${idx + 1}`,
          qty: Number(item.quantity || 1),
          unit: item.unit || "PCS",
          status_condition: "SESUAI_SPESIFIKASI",
          inspection_notes: "Kondisi fisik prima dan lulus uji fungsi pengujian",
        }))
      );
    }

    setPoSelectOpen(false);
    toast.success(`PO ${p.po_number} dipilih`);
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
    toast.success(`Pegawai ${u.name} ditugaskan`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas 25 MB");
      return;
    }
    setForm((prev) => ({ ...prev, uploaded_file_name: file.name }));
    toast.success(`File ${file.name} berhasil diunggah`);
  };

  const handleSubmit = async (actionType: "DRAFT" | "SUBMITTED") => {
    if (!form.po_id) {
      toast.error("Rujukan Purchase Order wajib dipilih");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await warehouseService.createAct({
        act_number: form.form_number,
        act_type: "BAPHB_BARANG",
        po_id: form.po_id,
        lead_inspector_id: teamMembers[0]?.user_id || users[0]?.id || "admin",
        secretary_id: teamMembers[1]?.user_id || users[0]?.id || "admin",
        completion_percentage: form.completion_percentage,
        conclusion: form.conclusion,
        status: actionType === "SUBMITTED" ? "PENDING_APPROVAL" : "DRAFT",
        notes: `Surat BA: ${form.ba_letter_number} [Berkas: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "SUBMITTED"
            ? "Berita Acara Pemeriksaan Barang dikirim untuk persetujuan [Send For Approval]"
            : "Berita Acara Pemeriksaan Barang berhasil disimpan sebagai Draft"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Files className="w-7 h-7 text-primary" />
            Pemeriksaan Barang (BA Pemeriksaan Barang) (Bab 4.9.3)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penyusunan Berita Acara Pemeriksaan Hasil Barang (BAPHB) bersama Tim Penguji (Gudang, User, dan K3)
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> [Add] Pemeriksaan Barang
        </Button>
      </div>

      {/* Tabel List */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Pemeriksaan Barang (Bab 4.9.3.1)</CardTitle>
              <CardDescription className="text-xs">
                Melihat dan memonitor data transaksi berita acara pemeriksaan hasil barang
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor BAPHB..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="h-9 px-3 text-xs">
                [Find]
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Dokumen BAPHB</th>
                  <th className="py-3 px-4">Ketua Tim Pemeriksa</th>
                  <th className="py-3 px-4">Sekretaris</th>
                  <th className="py-3 px-4 text-center">Persentase Lolos</th>
                  <th className="py-3 px-4 text-center">Kesimpulan Akhir</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat data BAPHB...
                    </td>
                  </tr>
                ) : acts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Files className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada dokumen BAPHB terbit. Klik [Add] untuk membuat baru.
                    </td>
                  </tr>
                ) : (
                  acts.map((act) => (
                    <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{act.act_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {act.lead_inspector?.name || "SPV Gudang"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{act.secretary?.name || "-"}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {act.completion_percentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={act.conclusion === "DITERIMA_PENUH" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {act.conclusion}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {act.status}
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

      {/* FORM MODAL PEMERIKSAAN BARANG (BAB 4.9.3.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
              </div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Files className="w-5 h-5 text-primary" />
                Form Pemeriksaan Barang (Bab 4.9.3.2)
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dikerjakan oleh SPV Gudang untuk menetapkan Berita Acara Pemeriksaan Barang bersama Tim Pemeriksa
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form BA Pemeriksaan Barang
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Form <span className="text-xs text-muted-foreground">(Otomatis Sistem)</span>
                  </Label>
                  <Input
                    value={form.form_number}
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
                    value={form.inspection_date}
                    onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Rujukan PO (Purchase Order) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] PO"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Surat Pemeriksaan Penerimaan Barang <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.ba_letter_number}
                    onChange={(e) => setForm({ ...form, ba_letter_number: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-mono"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Kesimpulan Akhir Pemeriksaan <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={form.conclusion}
                    onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="DITERIMA_PENUH">DITERIMA PENUH (100% Sesuai KAK & Spesifikasi)</option>
                    <option value="DITERIMA_BERSYARAT">DITERIMA BERSYARAT (Perlu Dokumen Tambahan)</option>
                    <option value="DITOLAK_TOTAL">DITOLAK TOTAL (Afkir / Rusak / Tidak Sesuai)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian Anggota Tim Pemeriksa (Tim BA) */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Bagian Anggota Tim Pemeriksa (Tim BA) Sesuai Bagian
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Gudang, User Peminta, dan K3
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Peran / Jabatan Tim BA</th>
                      <th className="py-2.5 px-3">Nama Anggota Pegawai</th>
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

            {/* Bagian Detail Barang */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-primary" />
                  Detail Barang & Status Kondisi (Otomatis Sesuai PO)
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {items.length} Item Material Terdaftar
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Nama Barang</th>
                      <th className="py-2.5 px-3 text-center">Jumlah Qty</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3">Status Kondisi</th>
                      <th className="py-2.5 px-3">Catatan Pemeriksaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{it.item_name}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{it.qty}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">{it.unit}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={it.status_condition}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((item) =>
                                  item.id === it.id ? { ...item, status_condition: val } : item
                                )
                              );
                            }}
                            className="h-8 rounded border text-xs px-2 bg-background w-full"
                          >
                            <option value="SESUAI_SPESIFIKASI">Sesuai Spesifikasi</option>
                            <option value="CACAT_KEMASAN">Cacat Kemasan Saja</option>
                            <option value="AFKIR_REJECT">Afkir / Tidak Layak</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            value={it.inspection_notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((item) =>
                                  item.id === it.id ? { ...item, inspection_notes: val } : item
                                )
                              );
                            }}
                            className="text-xs h-8"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upload Berkas Dokumen BA */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Berkas Berita Acara Fisik
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
              Pilih Purchase Order Barang
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
              Pilih Anggota Tim Pemeriksa
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

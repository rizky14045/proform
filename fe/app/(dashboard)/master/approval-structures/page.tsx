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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, Plus, Trash2, Search, Pencil, ShieldCheck, GitBranch } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { ApprovalStructure, Role } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

const MENU_APPROVAL_OPTIONS = [
  { value: "USULAN_PERMINTAAN_I", label: "Usulan Permintaan I" },
  { value: "USULAN_PERMINTAAN_II", label: "Usulan Permintaan II" },
  { value: "USULAN_PERMINTAAN_ADDENDUM", label: "Usulan Permintaan Addendum" },
  { value: "EVALUASI_TEKNIS", label: "Evaluasi Teknis" },
  { value: "USULAN_PENGADAAN", label: "Usulan Pengadaan (RO)" },
  { value: "HPE", label: "Harga Perkiraan Engineering (HPE)" },
  { value: "RKS", label: "Rencana Kerja & Syarat-syarat (RKS)" },
  { value: "ADENDUM_RKS", label: "Adendum RKS" },
  { value: "REVIEW_VFM_PERENCANAAN", label: "Review VFM Perencanaan" },
  { value: "IZIN_PENUNJUKAN_LANGSUNG", label: "Izin Penunjukan Langsung" },
  { value: "HPS", label: "Harga Perkiraan Sendiri (HPS)" },
  { value: "SPMK", label: "Surat Perintah Mulai Kerja (SPMK)" },
  { value: "EVALUASI_PENAWARAN", label: "Evaluasi Penawaran" },
  { value: "NEGOSIASI_HARGA", label: "Negosiasi Harga" },
  { value: "HASIL_PENGADAAN", label: "Hasil Pengadaan (BAHP)" },
  { value: "KONTRAK_PAYUNG", label: "Kontrak Payung" },
  { value: "PURCHASE_ORDER", label: "Purchase Order (PO)" },
  { value: "ADDENDUM_PO", label: "Addendum PO" },
  { value: "PENERIMAAN_BARANG", label: "Penerimaan Barang (BAPHB)" },
  { value: "PEMERIKSAAN_JASA", label: "Pemeriksaan Jasa (BAST)" },
];

export default function MasterApprovalStructuresPage() {
  const [structures, setStructures] = useState<ApprovalStructure[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form Approval Structure according to PDF Manual 3.6.2
  const [form, setForm] = useState({
    id: "",
    name: "",
    role_id: "",
    menu: "USULAN_PERMINTAAN_I",
    is_final_approval: false,
    step_order: 1,
    sla_hours: 24,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, rRes] = await Promise.all([
        masterService.getApprovalStructures(),
        masterService.getRoles({ limit: 100 }),
      ]);
      if (appRes?.success) setStructures(appRes.data || []);
      if (rRes?.success) setRoles(rRes.data || []);
    } catch {
      toast.error("Gagal memuat struktur approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({
      id: "",
      name: "",
      role_id: roles[0]?.id || "",
      menu: "USULAN_PERMINTAAN_I",
      is_final_approval: false,
      step_order: structures.length + 1,
      sla_hours: 24,
    });
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({
        id: "",
        name: "",
        role_id: roles[0]?.id || "",
        menu: "USULAN_PERMINTAAN_I",
        is_final_approval: false,
        step_order: structures.length + 1,
        sla_hours: 24,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role_id) {
      toast.error("Pilih jabatan yang menerima tugas approval");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        module_code: form.menu,
        role_id: form.role_id,
        step_order: Number(form.step_order),
        sla_hours: Number(form.sla_hours),
        status: "ACTIVE",
        condition_min_amount: 0,
      };
      const res = await masterService.createApprovalStructure(payload);
      if (res?.success) {
        toast.success("Struktur persetujuan berhasil disimpan!");
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteApprovalStructure(deleteTarget);
      toast.success("Struktur persetujuan berhasil dihapus!");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus struktur persetujuan");
    }
  };

  const filteredStructures = structures.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.module_code?.toLowerCase().includes(q) ||
      s.role?.name?.toLowerCase().includes(q) ||
      s.role?.code?.toLowerCase().includes(q)
    );
  });

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" /> Master Approval Structure (Bab 3.6)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Konfigurasi alur penanggung jawab approval persetujuan transaksi di PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Approval Structure
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List Approval Structure</CardTitle>
                <CardDescription className="text-xs">
                  Daftar alur hierarki persetujuan bertingkat yang tercatat pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Cari modul / jabatan approval..."
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
                    <th className="py-3 px-4 w-12 text-center">Urutan</th>
                    <th className="py-3 px-4">Menu Form Transaksi</th>
                    <th className="py-3 px-4">Jabatan Approval (Structure)</th>
                    <th className="py-3 px-4">SLA (Jam)</th>
                    <th className="py-3 px-4">Persetujuan Terakhir</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Memuat struktur approval...</td></tr>
                  ) : filteredStructures.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada struktur persetujuan terdaftar.</td></tr>
                  ) : (
                    filteredStructures.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 text-center font-mono font-bold text-primary">#{s.step_order}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {MENU_APPROVAL_OPTIONS.find((m) => m.value === s.module_code)?.label || s.module_code}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {s.role?.name || s.role?.code}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono">{s.sla_hours} Jam</td>
                        <td className="py-3 px-4">
                          <Badge className={idx === filteredStructures.length - 1 ? "bg-emerald-100 text-emerald-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {idx === filteredStructures.length - 1 ? "Final Approval" : "Verifikator"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(s.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* DIALOG FORM APPROVAL STRUCTURE (Bab 3.6.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <GitBranch className="w-5 h-5 text-primary" />
                Form Approval Structure - Tambah Data
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Konfigurasi Struktur Persetujuan
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Menu Transaksi yang Perlu Disetujui *</Label>
                    <select
                      value={form.menu}
                      onChange={(e) => setForm({ ...form, menu: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      {MENU_APPROVAL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk menentukan menu form yang perlu disetujui</p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Approval Structure (Jabatan Penyetuju) *</Label>
                    <select
                      value={form.role_id}
                      onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      <option value="">-- Pilih Jabatan / Role --</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk memilih jabatan yang menerima tugas approval</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Tahap / Urutan Approval</Label>
                    <Input
                      type="number"
                      value={form.step_order}
                      onChange={(e) => setForm({ ...form, step_order: Number(e.target.value) || 1 })}
                      className="text-xs mt-1 font-mono"
                      min="1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Urutan alur persetujuan (1, 2, 3...)</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">SLA Maksimal Approval (Jam)</Label>
                    <Input
                      type="number"
                      value={form.sla_hours}
                      onChange={(e) => setForm({ ...form, sla_hours: Number(e.target.value) || 24 })}
                      className="text-xs mt-1 font-mono"
                      min="1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Target batas waktu respon verifikator</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <input
                    type="checkbox"
                    id="is_final_approval"
                    checked={form.is_final_approval}
                    onChange={(e) => setForm({ ...form, is_final_approval: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                  />
                  <div>
                    <Label htmlFor="is_final_approval" className="text-xs font-semibold cursor-pointer">
                      Approval Final
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Centang bila struktur persetujuan ini merupakan persetujuan terakhir pada dokumen form
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER: [Back], [Cancel], [Save] */}
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
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    className="text-xs"
                  >
                    Cancel (Kosongkan)
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs font-semibold"
                  >
                    {isSubmitting ? "Menyimpan..." : "Save (Simpan)"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG KONFIRMASI HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">Hapus Struktur Approval</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus struktur approval ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-xs">
                Ya, Hapus Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

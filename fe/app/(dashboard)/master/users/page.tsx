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
import { Users, Search, Plus, Pencil, Trash2, AlertCircle, Upload, UserCheck, Shield, FileSignature } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { User, Role, PaginationMeta, Structure } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

const USER_TYPE_OPTIONS = [
  "Staff User",
  "Supervisor User",
  "Staff Perencana",
  "Supervisor Perencana",
  "Staff Pengadaan",
  "Supervisor Pengadaan",
  "Staff Gudang",
  "Supervisor Gudang",
  "Manager Unit",
  "General Manager",
  "Administrator",
];

export default function MasterUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form User according to PDF Manual 3.1.2
  const [form, setForm] = useState({
    id: "",
    nid: "",
    name: "",
    password: "",
    user_type: "Staff User",
    email: "",
    structure_id: "",
    role_id: "",
    phone: "",
    address: "UP Sembalang, Lampung",
    user_image: "",
    user_sign: "",
    status: "ACTIVE",
  });

  const [imageFileName, setImageFileName] = useState("");
  const [signFileName, setSignFileName] = useState("");

  useEffect(() => {
    Promise.all([
      masterService.getRoles().catch(() => ({ data: [] })),
      masterService.getStructures({ limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([rRes, sRes]) => {
      if (rRes?.data) setRoles(rRes.data);
      if (sRes?.data) setStructures(sRes.data);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [search, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getUsers({ search, page, limit });
      if (res?.data) {
        setUsers(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({
      id: "",
      nid: "",
      name: "",
      password: "",
      user_type: "Staff User",
      email: "",
      structure_id: structures[0]?.id || "",
      role_id: roles[0]?.id || "",
      phone: "",
      address: "UP Sembalang, Lampung",
      user_image: "",
      user_sign: "",
      status: "ACTIVE",
    });
    setImageFileName("");
    setSignFileName("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (u: any) => {
    setDialogMode("EDIT");
    setForm({
      id: u.id,
      nid: u.nid || "",
      name: u.name || "",
      password: "",
      user_type: u.user_type || "Staff User",
      email: u.email || "",
      structure_id: u.structure_id || structures[0]?.id || "",
      role_id: u.role_id || roles[0]?.id || "",
      phone: u.phone || "",
      address: u.address || "UP Sembalang, Lampung",
      user_image: u.user_image || "",
      user_sign: u.user_sign || "",
      status: u.is_active ? "ACTIVE" : "INACTIVE",
    });
    setImageFileName(u.user_image ? "profile_image.jpg" : "");
    setSignFileName(u.user_sign ? "signature_specimen.png" : "");
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({
        id: "",
        nid: "",
        name: "",
        password: "",
        user_type: "Staff User",
        email: "",
        structure_id: structures[0]?.id || "",
        role_id: roles[0]?.id || "",
        phone: "",
        address: "UP Sembalang, Lampung",
        user_image: "",
        user_sign: "",
        status: "ACTIVE",
      });
      setImageFileName("");
      setSignFileName("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileUrl) {
      setForm((prev) => ({ ...prev, user_image: res.fileUrl }));
      setImageFileName(file.name);
    }
  };

  const handleSignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileUrl) {
      setForm((prev) => ({ ...prev, user_sign: res.fileUrl }));
      setSignFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm([
      { field: "nid", label: "Nomor Induk Diri (NID)", value: form.nid, required: true, minLength: 3 },
      { field: "name", label: "Nama Lengkap Pengguna", value: form.name, required: true, minLength: 3 },
      { field: "email", label: "Alamat Email", value: form.email, required: true, type: "email" },
      { field: "role_id", label: "Hak Akses (Role)", value: form.role_id, required: true },
      ...(dialogMode === "CREATE"
        ? [{ field: "password", label: "Password Akun", value: form.password, required: true, minLength: 6 }]
        : []),
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        is_active: form.status === "ACTIVE",
      };
      if (dialogMode === "CREATE") {
        await masterService.createUser(payload);
        toast.success("Pengguna baru berhasil ditambahkan!");
      } else {
        await masterService.updateUser(form.id, payload);
        toast.success("Data pengguna berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan data pengguna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} berhasil dihapus!`);
      setDeleteTarget(null);
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus pengguna");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Master User (Bab 3.1)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Manajemen akun pengguna sistem, NID, jabatan struktur, specimen tanda tangan, dan otentikasi UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Pengguna Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List User</CardTitle>
                <CardDescription className="text-xs">
                  Daftar akun pengguna sistem yang terdaftar pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari NID / nama / email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                  <tr>
                    <th className="py-3 px-4">User ID (NID)</th>
                    <th className="py-3 px-4">User Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Jabatan (Role / Structure)</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Memuat data pengguna...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada data pengguna ditemukan.</td></tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-medium">{u.nid}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{u.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4 font-medium text-primary">{u.role?.name || "Pegawai"}</td>
                        <td className="py-3 px-4">{u.phone || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={u.is_active ? "bg-emerald-100 text-emerald-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {u.is_active ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(u)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: u.id, name: u.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <DataTablePagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                isLoading={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* DIALOG FORM USER (Bab 3.1.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-primary" />
                {dialogMode === "CREATE" ? "Form User - Tambah Data Pengguna" : "Form User - Ubah Data Pengguna"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION 1: IDENTITAS & LOGIN */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-primary" />
                  1. Identitas Akun & Kredensial
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">User ID (NID) *</Label>
                    <Input
                      value={form.nid}
                      onChange={(e) => setForm({ ...form, nid: e.target.value })}
                      placeholder="e.g. 9412345"
                      disabled={dialogMode === "EDIT"}
                      className="text-xs mt-1 font-mono"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk mencatat NID pengguna sistem</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">User Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nama lengkap pegawai"
                      className="text-xs mt-1 font-medium"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk mencatat nama pengguna sistem</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">
                      {dialogMode === "CREATE" ? "Password *" : "Password Baru (Kosongkan bila tidak diganti)"}
                    </Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimal 8 karakter..."
                      className="text-xs mt-1"
                      required={dialogMode === "CREATE"}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Kata sandi untuk mengakses sistem</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">User Type *</Label>
                    <select
                      value={form.user_type}
                      onChange={(e) => setForm({ ...form, user_type: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      {USER_TYPE_OPTIONS.map((ut) => (
                        <option key={ut} value={ut}>{ut}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk menentukan tipe pengguna</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Email Resmi *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="nama@plnnusantarapower.co.id"
                      className="text-xs mt-1"
                      required
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk mencatat email pengguna</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Phone (No. Telepon / HP) *</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0812xxxxxxx"
                      className="text-xs mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STRUKTUR JABATAN & PROFIL DOKUMEN */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-primary" />
                  2. Jabatan Struktur & Tanda Tangan Digital
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Structure (Jabatan) *</Label>
                    <select
                      value={form.structure_id}
                      onChange={(e) => setForm({ ...form, structure_id: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      <option value="">-- Pilih Jabatan Struktur --</option>
                      {structures.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Didapatkan dari data Master Structure untuk alur approval</p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Status Pengguna *</Label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                      required
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Non-Aktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Address (Alamat Kantor / Unit)</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="PT PLN Nusantara Power UP Sembalang, Jl. Raya Tarahan, Lampung Selatan"
                    className="text-xs mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label className="text-xs font-semibold">User Image (Foto Profil)</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                        <Upload className="w-4 h-4 text-primary" />
                        [Pilih File Foto]
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-muted-foreground font-mono">
                        {imageFileName || "Belum ada foto"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Upload foto profil pengguna sistem (.jpg, .png max 25MB)</p>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">User Sign (Spesimen Tanda Tangan)</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                        <FileSignature className="w-4 h-4 text-primary" />
                        [Pilih File Tanda Tangan]
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          onChange={handleSignUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-muted-foreground font-mono">
                        {signFileName || "Belum ada spesimen"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Digunakan dalam hasil cetak form transaksi resmi
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER: [Back], [Cancel], [Delete], [Save] */}
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
                  {dialogMode === "EDIT" && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteTarget({ id: form.id, name: form.name })}
                      className="text-xs gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete (Hapus)
                    </Button>
                  )}
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

        {/* ALERT DIALOG HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Pengguna
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data pengguna <strong>{deleteTarget?.name}</strong>?
                Bila data pengguna sudah pernah digunakan dalam transaksi, data tidak dapat dihapus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleExecuteDelete} className="bg-red-600 hover:bg-red-700 text-xs">
                Ya, Hapus Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

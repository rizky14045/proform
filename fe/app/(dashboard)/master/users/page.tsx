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
  DialogFooter,
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
import { Users, Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { User, Role } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function MasterUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    id: "",
    nid: "",
    nik: "",
    name: "",
    email: "",
    password: "",
    role_id: "",
    phone: "",
    address: "UP Sembalang, Lampung",
    user_type: "USER",
    is_active: true,
  });

  useEffect(() => {
    loadData();
    masterService.getRoles().then((res) => {
      if (res?.data) setRoles(res.data);
    }).catch(() => {});
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getUsers(search);
      if (res?.data) setUsers(res.data);
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
      nik: "",
      name: "",
      email: "",
      password: "",
      role_id: roles[0]?.id || "",
      phone: "",
      address: "UP Sembalang, Lampung",
      user_type: "USER",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setDialogMode("EDIT");
    setForm({
      id: u.id,
      nid: u.nid || "",
      nik: u.nik || "",
      name: u.name || "",
      email: u.email || "",
      password: "",
      role_id: u.role_id || "",
      phone: u.phone || "",
      address: u.address || "",
      user_type: u.user_type || "USER",
      is_active: u.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (dialogMode === "CREATE") {
        await masterService.createUser(form);
        toast.success("Pengguna baru berhasil ditambahkan!");
      } else {
        const payload: any = { ...form };
        if (!payload.password) delete payload.password;
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
              <Users className="h-6 w-6 text-primary" /> Kelola Pengguna (Users)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Daftar akun pegawai dan penetapan hak akses role di lingkungan UP Sembalang
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
                <CardTitle className="text-base font-bold">Daftar Akun Pengguna</CardTitle>
                <CardDescription className="text-xs">
                  Akses modul ini dibatasi khusus Administrator Sistem.
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari NID / nama / email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                    <th className="py-3 px-4">NID / Username</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Jabatan (Role)</th>
                    <th className="py-3 px-4">No. Telepon</th>
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
                        <td className="py-3 px-4 font-medium text-primary">{u.role?.name || "Admin"}</td>
                        <td className="py-3 px-4">{u.phone || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge className={u.is_active ? "bg-emerald-100 text-emerald-800 border-none" : "bg-red-100 text-red-800 border-none"}>
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
          </CardContent>
        </Card>

        {/* DIALOG FORM USER */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="2xl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "CREATE" ? "Tambah Pengguna Baru" : "Ubah Data Pengguna"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">NID / Username *</Label>
                  <Input
                    value={form.nid}
                    onChange={(e) => setForm({ ...form, nid: e.target.value })}
                    placeholder="e.g. 9412345"
                    disabled={dialogMode === "EDIT"}
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">NIK (KTP)</Label>
                  <Input
                    value={form.nik}
                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    placeholder="e.g. 3216000000000001"
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Nama Lengkap *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap pegawai"
                  className="text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Email Resmi (PLN) *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@interlogs.pln.co.id"
                  className="text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs">
                  {dialogMode === "CREATE" ? "Kata Sandi *" : "Kata Sandi Baru (Kosongkan jika tidak diganti)"}
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 8 karakter..."
                  className="text-xs mt-1"
                  required={dialogMode === "CREATE"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Jabatan (Role) *</Label>
                  <select
                    value={form.role_id}
                    onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    required
                  >
                    <option value="">Pilih Role...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">No. Telepon / HP</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0812..."
                    className="text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Alamat Kerja / Lokasi</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="text-xs mt-1"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                />
                <Label htmlFor="is_active" className="text-xs cursor-pointer">
                  Akun Pengguna Aktif
                </Label>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG KONFIRMASI HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Pengguna
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menonaktifkan akun <strong>{deleteTarget?.name}</strong>?
                Data akan di-soft delete secara aman dari sistem operasional.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batalkan</AlertDialogCancel>
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


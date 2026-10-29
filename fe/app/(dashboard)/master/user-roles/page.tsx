"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Shield, Plus, Trash2, Users, Search, CheckCircle2, UserCheck } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { User, Role, UserRole } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

interface AssignedRoleItem {
  role_id: string;
  role_name: string;
  role_code: string;
  special_access: boolean;
}

export default function MasterUserRolesPage() {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form User Role according to PDF Manual 3.3.2
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [specialAccess, setSpecialAccess] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState<AssignedRoleItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [urRes, uRes, rRes] = await Promise.all([
        masterService.getUserRoles(),
        masterService.getUsers({ limit: 100 }),
        masterService.getRoles({ limit: 100 }),
      ]);
      if (urRes?.success) setUserRoles(urRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
      if (rRes?.success) setRoles(rRes.data || []);
    } catch {
      toast.error("Gagal memuat relasi user role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedUserId("");
    setSelectedRoleId(roles[0]?.id || "");
    setSpecialAccess(false);
    setAssignedRoles([]);
    setIsDialogOpen(true);
  };

  const handleAddRoleToList = () => {
    if (!selectedRoleId) {
      toast.error("Pilih peran (Role Name) terlebih dahulu");
      return;
    }
    const r = roles.find((item) => item.id === selectedRoleId);
    if (!r) return;
    if (assignedRoles.some((ar) => ar.role_id === selectedRoleId)) {
      toast.error("Peran ini sudah ada dalam daftar!");
      return;
    }
    setAssignedRoles([
      ...assignedRoles,
      {
        role_id: r.id,
        role_name: r.name,
        role_code: r.code,
        special_access: specialAccess,
      },
    ]);
  };

  const handleRemoveAssignedRole = (index: number) => {
    setAssignedRoles(assignedRoles.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedUserId("");
    setSelectedRoleId(roles[0]?.id || "");
    setSpecialAccess(false);
    setAssignedRoles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Pilih pengguna (User ID) terlebih dahulu");
      return;
    }
    if (assignedRoles.length === 0) {
      toast.error("Tambahkan minimal 1 peran menggunakan tombol [Add To List]");
      return;
    }
    setIsSubmitting(true);
    try {
      for (const ar of assignedRoles) {
        await masterService.assignUserRole({
          user_id: selectedUserId,
          role_id: ar.role_id,
          is_primary: ar.special_access,
        });
      }
      toast.success("Peran pengguna berhasil disimpan!");
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan peran pengguna");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.removeUserRole(deleteTarget);
      toast.success("Peran pengguna berhasil dihapus!");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Gagal menghapus peran pengguna");
    }
  };

  const filteredUserRoles = userRoles.filter((ur) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ur.user?.name?.toLowerCase().includes(q) ||
      ur.user?.nid?.toLowerCase().includes(q) ||
      ur.role?.name?.toLowerCase().includes(q) ||
      ur.role?.code?.toLowerCase().includes(q)
    );
  });

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" /> Master User Role (Bab 3.3)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Penetapan peran ganda (Multi-Role) dan wewenang akses spesial antar-divisi PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah User Role Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List User Role</CardTitle>
                <CardDescription className="text-xs">
                  Daftar pemetaan peran pengguna yang sudah terdaftar pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Cari user / role..."
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
                    <th className="py-3 px-4">NID</th>
                    <th className="py-3 px-4">Nama Pengguna</th>
                    <th className="py-3 px-4">Peran (Role Name)</th>
                    <th className="py-3 px-4">Akses Spesial</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data user role...</td></tr>
                  ) : filteredUserRoles.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada pemetaan peran pengguna.</td></tr>
                  ) : (
                    filteredUserRoles.map((ur) => (
                      <tr key={ur.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-medium">{ur.user?.nid || "-"}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{ur.user?.name || "Pengguna"}</td>
                        <td className="py-3 px-4 font-bold text-primary">{ur.role?.name || ur.role?.code}</td>
                        <td className="py-3 px-4">
                          <Badge className={ur.is_primary ? "bg-purple-100 text-purple-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {ur.is_primary ? "Akses Spesial Aktif" : "Standar"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(ur.id)}
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

        {/* DIALOG FORM USER ROLE (Bab 3.3.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-primary" />
                Form User Role - Tambah Data Peran Pengguna
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECTION 1: PILIH PENGGUNA */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-primary" />
                  1. Pemilihan Pengguna (User ID)
                </div>

                <div>
                  <Label className="text-xs font-semibold">User ID *</Label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    required
                  >
                    <option value="">-- Pilih ID Pengguna (NID / Nama) --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nid} - {u.name} ({u.role?.name || "User"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Digunakan untuk memilih ID pengguna</p>
                </div>
              </div>

              {/* SECTION 2: TAMBAH PERAN & AKSES SPESIAL */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-primary" />
                  2. Konfigurasi Peran & Akses Spesial
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-6">
                    <Label className="text-xs font-semibold">Role Name *</Label>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Tentukan nama peran untuk ID pengguna yang dipilih</p>
                  </div>

                  <div className="md:col-span-4 flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="special_access"
                      checked={specialAccess}
                      onChange={(e) => setSpecialAccess(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <div>
                      <Label htmlFor="special_access" className="text-xs font-semibold cursor-pointer">
                        Akses Spesial
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Dapat melihat data pengguna lain dengan peran serupa</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddRoleToList}
                      className="w-full h-9 text-xs gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add To List
                    </Button>
                  </div>
                </div>

                {/* Table Daftar Role Pengguna */}
                <div className="overflow-x-auto border border-border/50 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Role Name</th>
                        <th className="py-2.5 px-3">Kode Peran</th>
                        <th className="py-2.5 px-3">Akses Spesial</th>
                        <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {assignedRoles.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            Belum ada peran ditambahkan ke daftar. Pilih peran lalu klik [Add To List].
                          </td>
                        </tr>
                      ) : (
                        assignedRoles.map((ar, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-foreground">{ar.role_name}</td>
                            <td className="py-2 px-3 font-mono text-muted-foreground">{ar.role_code}</td>
                            <td className="py-2 px-3">
                              <Badge className={ar.special_access ? "bg-purple-100 text-purple-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                                {ar.special_access ? "Ya (Akses Spesial)" : "Tidak"}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAssignedRole(idx)}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
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
              <AlertDialogTitle className="text-base font-bold text-destructive">Hapus Akses Peran Pengguna</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus peran pengguna ini?
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

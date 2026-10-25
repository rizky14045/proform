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
import { Shield, Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { Role } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function MasterRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    description: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getRoles(search);
      if (res?.data) setRoles(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({ id: "", code: "", name: "", description: "", status: "ACTIVE" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (r: Role) => {
    setDialogMode("EDIT");
    setForm({
      id: r.id,
      code: r.code || "",
      name: r.name || "",
      description: r.description || "",
      status: r.status || "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (dialogMode === "CREATE") {
        await masterService.createRole(form);
        toast.success("Peran jabatan (Role) baru berhasil ditambahkan!");
      } else {
        await masterService.updateRole(form.id, form);
        toast.success("Peran jabatan (Role) berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan peran jabatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteRole(deleteTarget.id);
      toast.success(`${deleteTarget.name} berhasil dihapus!`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus peran jabatan");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" /> Kode Jabatan (Roles)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Definisi peran dan pembagian kewenangan workflow pengadaan di lingkungan UP Muara Tawar
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Jabatan Baru
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Daftar Kode Jabatan Terdaftar</CardTitle>
                <CardDescription className="text-xs">
                  Modul ini mengatur izin menu dan persetujuan bertingkat (RBAC).
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode / nama jabatan..."
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
                    <th className="py-3 px-4">Kode Jabatan</th>
                    <th className="py-3 px-4">Nama Peran / Jabatan</th>
                    <th className="py-3 px-4">Deskripsi Otoritas</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data jabatan...</td></tr>
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada data jabatan ditemukan.</td></tr>
                  ) : (
                    roles.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{r.code}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{r.name}</td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[280px] truncate">{r.description || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{r.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(r)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: r.id, name: r.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
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

        {/* DIALOG FORM ROLES */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "CREATE" ? "Tambah Jabatan (Role)" : "Ubah Jabatan (Role)"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              <div>
                <Label className="text-xs">Kode Jabatan (Role Code) *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SPV_PENGADAAN, MGR_USER"
                  disabled={dialogMode === "EDIT"}
                  className="text-xs mt-1 font-mono uppercase"
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Nama Jabatan *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Supervisor Pengadaan"
                  className="text-xs mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs">Deskripsi Otoritas Workflow</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Penjelasan wewenang dalam proses pengadaan..."
                  className="text-xs mt-1"
                />
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

        {/* ALERT DIALOG HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Jabatan
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus peran jabatan <strong>{deleteTarget?.name}</strong>?
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


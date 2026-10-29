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
import { Building, Search, Plus, Trash2 } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { Structure } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function MasterStructuresPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    status: "ACTIVE",
  });

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await masterService.getStructures({ search, limit: 100 });
      if (res?.success) {
        setStructures(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat struktur organisasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await masterService.createStructure(form);
      if (res?.success) {
        toast.success("Struktur organisasi berhasil ditambahkan");
        setIsDialogOpen(false);
        fetchStructures();
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
      await masterService.deleteStructure(deleteTarget);
      toast.success("Struktur berhasil dihapus");
      setDeleteTarget(null);
      fetchStructures();
    } catch {
      toast.error("Gagal menghapus struktur");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Building className="w-7 h-7 text-primary" />
              Struktur Organisasi (Bab 3.5)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hierarki unit kerja, bidang, sub-bidang, dan seksi di lingkungan UP Sembalang
            </p>
          </div>
          <Button
            onClick={() => {
              setForm({ code: "", name: "", description: "", status: "ACTIVE" });
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Unit Kerja
          </Button>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Daftar Divisi & Bagian</CardTitle>
                <CardDescription className="text-xs">
                  Struktur hirarki manajemen dan operasional UP Sembalang
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 max-w-sm w-full">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode atau divisi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchStructures()}
                    className="pl-9 text-xs h-9"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={fetchStructures} className="h-9 px-3 text-xs">
                  Cari
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Kode Bagian</th>
                    <th className="py-3 px-4">Nama Bagian / Unit Kerja</th>
                    <th className="py-3 px-4">Deskripsi Tugas</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        Memuat data struktur organisasi...
                      </td>
                    </tr>
                  ) : structures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Belum ada struktur organisasi terdaftar.
                      </td>
                    </tr>
                  ) : (
                    structures.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{s.code}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{s.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{s.description || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge color={s.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">
                            {s.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
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

        {/* MODAL TAMBAH STRUKTUR (XL max-w-4xl) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Building className="w-5 h-5 text-primary" />
                Tambah Struktur Organisasi
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Kode Bagian / Unit *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Contoh: LOG, OPH, HAR, KEU"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nama Bagian / Unit Kerja *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Bagian Logistik & Pergudangan"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Deskripsi / Ruang Lingkup</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Penjelasan fungsi unit kerja"
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-5 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs">
                  {isSubmitting ? "Menyimpan..." : "Simpan Bagian"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG KONFIRMASI HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">Hapus Unit Kerja</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus struktur organisasi ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-xs">
                Ya, Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

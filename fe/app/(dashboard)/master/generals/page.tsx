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
import { Layers, Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { General } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

const GROUP_OPTIONS = [
  { value: "ENTITAS", label: "ENTITAS (Unit Generator / Blok)" },
  { value: "GUDANG", label: "GUDANG (Lokasi Gudang)" },
  { value: "JENIS_PEKERJAAN", label: "JENIS_PEKERJAAN" },
  { value: "SIFAT_PEKERJAAN", label: "SIFAT_PEKERJAAN (Emergency, Normal, Urgent)" },
  { value: "SUMBER_DANA", label: "SUMBER_DANA (AI / AO)" },
  { value: "SYARAT_UMUM", label: "SYARAT_UMUM (Ketentuan RKS)" },
  { value: "SYARAT_KHUSUS", label: "SYARAT_KHUSUS (Sertifikat Pabrikan dsb)" },
];

export default function MasterGeneralsPage() {
  const [generals, setGenerals] = useState<General[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    id: "",
    group: "ENTITAS",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, [search, groupFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await masterService.getGenerals();
      if (res?.data) {
        let filtered = res.data;
        if (groupFilter !== "ALL") {
          filtered = filtered.filter((g) => g.group === groupFilter);
        }
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (g) =>
              g.group.toLowerCase().includes(s) ||
              g.description.toLowerCase().includes(s)
          );
        }
        setGenerals(filtered);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat data parameter umum");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({
      id: "",
      group: groupFilter !== "ALL" ? groupFilter : "ENTITAS",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: General) => {
    setDialogMode("EDIT");
    setForm({
      id: item.id,
      group: item.group,
      description: item.description,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error("Deskripsi / Nilai parameter wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);
      if (dialogMode === "CREATE") {
        await masterService.createGeneral({
          group: form.group,
          description: form.description,
        });
        toast.success("Parameter Umum berhasil ditambahkan!");
      } else {
        await masterService.updateGeneral(form.id, {
          group: form.group,
          description: form.description,
        });
        toast.success("Parameter Umum berhasil diperbarui!");
      }
      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menyimpan data parameter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    try {
      await masterService.deleteGeneral(deleteTarget.id);
      toast.success("Parameter Umum berhasil dihapus");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menghapus parameter");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              Master Parameter Umum Sistem
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pengelolaan referensi umum (Entitas, Gudang, Sifat & Jenis Pekerjaan, Sumber Dana, dan Syarat RKS)
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Parameter
          </Button>
        </div>

        {/* Content Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari parameter / nilai..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="ALL">Semua Kategori Group</option>
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-muted-foreground self-center">
                Total: <strong className="text-foreground">{generals.length}</strong> Parameter
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Kategori Group</th>
                    <th className="py-3 px-4">Nilai / Deskripsi Parameter</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Memuat data parameter umum...
                      </td>
                    </tr>
                  ) : generals.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Tidak ada data parameter umum yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    generals.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          <Badge variant="outline" className="font-mono text-[10px] bg-muted/60">
                            {g.group}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{g.description}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                            ACTIVE
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(g)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setDeleteTarget({ id: g.id, name: `${g.group} - ${g.description}` })
                              }
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                            >
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

        {/* DIALOG: CREATE / EDIT */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {dialogMode === "CREATE" ? "Tambah Parameter Umum" : "Ubah Parameter Umum"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Kategori Group *</Label>
                <select
                  value={form.group}
                  onChange={(e) => setForm({ ...form, group: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs mt-1 font-mono"
                  required
                >
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Deskripsi / Nilai Parameter *</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Nilai atau nama parameter..."
                  className="text-xs mt-1"
                  required
                />
              </div>

              <DialogFooter className="pt-3">
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

        {/* ALERT DIALOG: DELETE CONFIRMATION */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Konfirmasi Hapus Data
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
                Apakah Anda yakin ingin menghapus data <strong>{deleteTarget?.name}</strong>?
                Data akan di-soft delete dan tidak akan lagi muncul dalam operasional aktif.
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


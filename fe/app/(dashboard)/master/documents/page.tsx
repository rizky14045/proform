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
import { Files, Search, Plus, Trash2, CheckCircle2, FileText, Upload, Pencil, AlertCircle } from "lucide-react";
import { masterService } from "@/services/modules.service";
import { MasterDocument, PaginationMeta } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import toast from "react-hot-toast";

export default function MasterDocumentsPage() {
  const [docs, setDocs] = useState<MasterDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Form Master Dokumen according to PDF Manual 3.9.2
  const [form, setForm] = useState({
    id: "",
    name: "",
    file_template_name: "",
    status: "ACTIVE",
  });
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await masterService.getMasterDocuments({ search, page, limit });
      if (res?.success) {
        setDocs(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch {
      toast.error("Gagal memuat master dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [page, limit]);

  const handleOpenCreate = () => {
    setDialogMode("CREATE");
    setForm({
      id: "",
      name: "",
      file_template_name: "",
      status: "ACTIVE",
    });
    setUploadedFileName("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (doc: any) => {
    setDialogMode("EDIT");
    setForm({
      id: doc.id,
      name: doc.name || "",
      file_template_name: doc.code || "",
      status: doc.is_active ? "ACTIVE" : "INACTIVE",
    });
    setUploadedFileName(doc.code ? `${doc.code}.docx` : "");
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    if (dialogMode === "CREATE") {
      setForm({
        id: "",
        name: "",
        file_template_name: "",
        status: "ACTIVE",
      });
      setUploadedFileName("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      toast.success(`Template ${file.name} siap diunggah`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const code = form.name.trim().toUpperCase().replace(/\s+/g, "_").slice(0, 30);
      const payload = {
        name: form.name,
        code,
        doc_type: "TEMPLATE_KONTRAK",
        description: `Template dokumen kontrak: ${form.name}`,
        is_mandatory: false,
        is_active: form.status === "ACTIVE",
      };
      const res = await masterService.createMasterDocument(payload);
      if (res?.success) {
        toast.success("Master dokumen template berhasil disimpan!");
        setIsDialogOpen(false);
        fetchDocs();
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
      await masterService.deleteMasterDocument(deleteTarget.id);
      toast.success("Dokumen template berhasil dihapus!");
      setDeleteTarget(null);
      setIsDialogOpen(false);
      fetchDocs();
    } catch {
      toast.error("Gagal menghapus dokumen");
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SPV_PENGADAAN", "STAFF_PENGADAAN"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Files className="h-6 w-6 text-primary" /> Master Dokumen (Bab 3.9)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Template dokumen kontrak, berita acara, format PO, dan merge fields PT PLN Nusantara Power UP Sembalang
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Tambah Master Dokumen
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">List Master Dokumen</CardTitle>
                <CardDescription className="text-xs">
                  Daftar template dokumen kontrak yang sudah terdaftar pada sistem aplikasi
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama template dokumen..."
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
                    <th className="py-3 px-4">Nama Dokumen</th>
                    <th className="py-3 px-4">File Template</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Memuat master dokumen...</td></tr>
                  ) : docs.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada template dokumen kontrak.</td></tr>
                  ) : (
                    docs.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-bold text-foreground">{doc.name}</td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                          {doc.code ? `${doc.code}.docx` : "template_kontrak.docx"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={doc.is_active ? "bg-emerald-100 text-emerald-800 border-none" : "bg-zinc-100 text-zinc-800 border-none"}>
                            {doc.is_active ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(doc)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: doc.id, name: doc.name })} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
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

            <div className="p-4 border-t">
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

        {/* DIALOG FORM MASTER DOKUMEN (Bab 3.9.2) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                {dialogMode === "CREATE" ? "Form Master Dokumen - Tambah Data" : "Form Master Dokumen - Ubah Data"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perhatikan kolom dengan tanda (*). Kolom-kolom tersebut wajib diisi.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-primary" />
                  Identitas Template Dokumen Kontrak
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nama Dokumen *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. SPK Pemeliharaan Rutin, Template PO Spot Barang"
                    className="mt-1 text-xs h-9 font-medium"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Digunakan untuk memberikan nama dari template dokumen yang akan ditambah
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">File Template (Merge Field DOCX / PDF)</Label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      [Choose File / Pilih File]
                      <input
                        type="file"
                        accept=".docx,.doc,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {uploadedFileName ? uploadedFileName : "Belum ada file dipilih"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Upload template yang sudah diberi tanda merge field (contoh: &#123;&#123;nomor_kontrak&#125;&#125;, &#123;&#123;nama_vendor&#125;&#125;)
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Status *</Label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Non-Aktif</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Digunakan untuk menentukan status data apakah aktif digunakan dalam sistem
                  </p>
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

        {/* DIALOG KONFIRMASI HAPUS */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-bold text-destructive">Hapus Master Dokumen</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                Apakah Anda yakin ingin menghapus template dokumen <strong>{deleteTarget?.name}</strong>?
                Tombol ini akan muncul bila data sudah pernah disimpan dan dibuka kembali.
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

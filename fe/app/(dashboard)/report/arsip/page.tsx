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
import { Files, Search, Plus, Download, FolderArchive } from "lucide-react";
import { reportService } from "@/services/modules.service";
import { ArchiveDocument } from "@/types";
import toast from "react-hot-toast";

export default function ArsipDokumenPage() {
  const [archives, setArchives] = useState<ArchiveDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    module_name: "PURCHASE_ORDER",
    document_number: `ARSIP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    title: "",
    document_date: new Date().toISOString().split("T")[0],
    file_url: "https://minio.pln-sembalang.co.id/archives/doc_signed.pdf",
    category: "LEGALITAS_KONTRAK",
    status: "ARCHIVED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getArchiveDocuments(search);
      if (res?.success) {
        setArchives(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat arsip dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.document_number || !form.title) {
      toast.error("Lengkapi nomor dan judul arsip");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await reportService.uploadArchiveDocument(form);
      if (res?.success) {
        toast.success("Dokumen berhasil diarsipkan ke lemari arsip digital");
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderArchive className="w-7 h-7 text-primary" />
            Arsip Dokumen Digital (Bab 5.5)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Repositori penyimpanan permanen dokumen pengadaan, warkat kontrak, berita acara, dan dokumen bertandatangan elektronik BSrE UP Sembalang
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({
              module_name: "PURCHASE_ORDER",
              document_number: `ARSIP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
              title: "",
              document_date: new Date().toISOString().split("T")[0],
              file_url: "https://minio.pln-sembalang.co.id/archives/doc_signed.pdf",
              category: "LEGALITAS_KONTRAK",
              status: "ARCHIVED",
            });
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Masukkan ke Arsip
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Lemari Dokumen Terarsip</CardTitle>
              <CardDescription className="text-xs">
                Dokumen tersimpan aman dan terenkripsi untuk kebutuhan audit kepatuhan (Compliance)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari arsip nomor atau judul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="h-9 px-3 text-xs">
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
                  <th className="py-3 px-4">No. Registrasi Arsip</th>
                  <th className="py-3 px-4">Judul Dokumen</th>
                  <th className="py-3 px-4">Modul / Jenis</th>
                  <th className="py-3 px-4">Kategori Berkas</th>
                  <th className="py-3 px-4">Tanggal Dokumen</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Memuat lemari arsip...
                    </td>
                  </tr>
                ) : archives.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <FolderArchive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada dokumen yang diarsipkan.
                    </td>
                  </tr>
                ) : (
                  archives.map((ar) => (
                    <tr key={ar.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{ar.document_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{ar.title}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <Badge variant="outline">{ar.module_name}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{ar.category}</td>
                      <td className="py-3 px-4 text-muted-foreground">{ar.document_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          {ar.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-primary gap-1"
                          onClick={() => {
                            window.open(ar.file_url, "_blank");
                          }}
                        >
                          <Download className="w-3.5 h-3.5" /> Unduh Dokumen
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

      {/* MODAL PENGARSIPAN (XL max-w-4xl) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FolderArchive className="w-5 h-5 text-primary" />
              Pengarsipan Dokumen Pengadaan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Nomor Registrasi Arsip *</Label>
                <Input
                  value={form.document_number}
                  onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                  className="mt-1.5 text-xs h-9"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Asal Modul Dokumen *</Label>
                <select
                  value={form.module_name}
                  onChange={(e) => setForm({ ...form, module_name: e.target.value })}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="PURCHASE_ORDER">Purchase Order & Kontrak</option>
                  <option value="BAST">Berita Acara Serah Terima (BAST)</option>
                  <option value="HPE_RKS">Dokumen HPE & RKS</option>
                  <option value="EVALUASI_VENDOR">Penilaian Rekanan</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">Judul / Perihal Dokumen *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Berkas Lengkap Kontrak PO Pengadaan Pelumas Turbin 2026"
                  className="mt-1.5 text-xs h-9"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Tanggal Dokumen *</Label>
                <Input
                  type="date"
                  value={form.document_date}
                  onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                  className="mt-1.5 text-xs h-9"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Kategori Arsip *</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="LEGALITAS_KONTRAK">Legalitas Kontrak & SPK</option>
                  <option value="BERITA_ACARA">Berita Acara (BAST / BAPHB)</option>
                  <option value="KEUANGAN">Jaminan Bank & Pembayaran</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">URL Penyimpanan File (Cloud Storage / MinIO) *</Label>
                <Input
                  value={form.file_url}
                  onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                  className="mt-1.5 text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-5 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs">
                {isSubmitting ? "Menyimpan..." : "Simpan ke Lemari Arsip"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

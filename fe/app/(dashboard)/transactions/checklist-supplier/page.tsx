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
import { FileSpreadsheet, Search, Plus, CheckCircle2, FileCheck, Layers, Building2 } from "lucide-react";
import { pengadaanSubmoduleService, masterService, poService } from "@/services/modules.service";
import { ChecklistSupplier, Supplier, PurchaseOrder } from "@/types";
import toast from "react-hot-toast";

interface DocumentRequirement {
  id: string;
  name: string;
  required: boolean;
  present: boolean;
  notes: string;
}

const DEFAULT_DOC_REQUIREMENTS: DocumentRequirement[] = [
  { id: "doc-1", name: "Salinan Dokumen Kontrak / Purchase Order (PO)", required: true, present: true, notes: "Rangkap 3 asli bertanda tangan" },
  { id: "doc-2", name: "Surat Jalan (Delivery Order) dari Supplier Asli", required: true, present: true, notes: "Mencantumkan nomor PO & rincian koli" },
  { id: "doc-3", name: "Faktur Pajak & Invoice Penagihan Resmi", required: true, present: true, notes: "Faktur pajak elektronik valid" },
  { id: "doc-4", name: "Sertifikat Uji Pabrikan (Mill Test Certificate / COO / COA)", required: false, present: false, notes: "Wajib untuk material mekanikal/kimia" },
  { id: "doc-5", name: "Kartu Garansi Resmi Pabrikan (Warranty Card)", required: false, present: false, notes: "Masa garansi minimal 12 bulan" },
  { id: "doc-6", name: "Material Safety Data Sheet (MSDS) & Label K3", required: false, present: false, notes: "Wajib bila barang kimia/B3" },
  { id: "doc-7", name: "Berita Acara Hasil Uji Terima / Komisioning di Lapangan", required: false, present: false, notes: "Ditandatangani User & Tim Penguji" },
];

export default function ChecklistSupplierPage() {
  const [checklists, setChecklists] = useState<ChecklistSupplier[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Checklist Supplier according to PDF Manual 4.5.2
  const [selectedPOId, setSelectedPOId] = useState("");
  const [selectedPOData, setSelectedPOData] = useState<PurchaseOrder | null>(null);
  const [docList, setDocList] = useState<DocumentRequirement[]>(DEFAULT_DOC_REQUIREMENTS);
  const [overallNotes, setOverallNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, pRes] = await Promise.all([
        pengadaanSubmoduleService.getChecklists(search),
        masterService.getSuppliers({ limit: 100 }),
        poService.getAllPO({ limit: 50 }),
      ]);
      if (cRes?.success) setChecklists(cRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
      if (pRes?.success) setPos(pRes.data || []);
    } catch {
      toast.error("Gagal memuat checklist supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setSelectedPOId("");
    setSelectedPOData(null);
    setDocList(DEFAULT_DOC_REQUIREMENTS.map((d) => ({ ...d, present: d.required })));
    setOverallNotes("Semua dokumen persyaratan penyerahan barang diverifikasi di Gudang UP Sembalang.");
    setIsDialogOpen(true);
  };

  const handleSelectPO = (poId: string) => {
    setSelectedPOId(poId);
    const p = pos.find((item) => item.id === poId);
    if (p) {
      setSelectedPOData(p);
    } else {
      setSelectedPOData(null);
    }
  };

  const handleTogglePresent = (index: number) => {
    const updated = [...docList];
    updated[index].present = !updated[index].present;
    setDocList(updated);
  };

  const handleItemNotesChange = (index: number, val: string) => {
    const updated = [...docList];
    updated[index].notes = val;
    setDocList(updated);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChecklist(false);
  };

  const handlePost = async () => {
    await saveChecklist(true);
  };

  const saveChecklist = async (isPosted: boolean) => {
    if (!selectedPOId || !selectedPOData) {
      toast.error("Pilih nomor Purchase Order (PO) terlebih dahulu");
      return;
    }
    const allRequiredPresent = docList.filter((d) => d.required).every((d) => d.present);
    setIsSubmitting(true);
    try {
      const status = allRequiredPresent ? "COMPLETE" : "INCOMPLETE";
      const res = await pengadaanSubmoduleService.createChecklist({
        po_id: selectedPOId,
        supplier_id: selectedPOData.supplier_id || suppliers[0]?.id || "",
        status,
        notes: overallNotes,
      });
      if (res?.success) {
        toast.success(isPosted ? "Checklist dokumen berhasil di-POSTING!" : "Checklist dokumen berhasil disimpan sebagai draft!");
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
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            Checklist Dokumen Supplier (Bab 4.5)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pemeriksaan kelengkapan dokumen persyaratan PO saat supplier mendatangi Gudang PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Checklist Dokumen PO
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Checklist Supplier</CardTitle>
              <CardDescription className="text-xs">
                Daftar verifikasi kelengkapan dokumen penyerahan barang yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari nomor PO / rekanan..."
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
                  <th className="py-3 px-4">Nomor PO</th>
                  <th className="py-3 px-4">Nama Rekanan / Supplier</th>
                  <th className="py-3 px-4">Tanggal Verifikasi</th>
                  <th className="py-3 px-4">Status Dokumen</th>
                  <th className="py-3 px-4">Catatan Verifikator Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data checklist...</td></tr>
                ) : checklists.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada verifikasi checklist supplier.</td></tr>
                ) : (
                  checklists.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{c.po?.po_number || "PO-UMUM"}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{c.supplier?.name || "Rekanan Terdaftar"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={c.status === "COMPLETE" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {c.status === "COMPLETE" ? "Lengkap & Sesuai" : "Dokumen Kurang"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{c.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM CHECKLIST SUPPLIER (Bab 4.5.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileCheck className="w-5 h-5 text-primary" />
              Form Checklist Dokumen Penyerahan PO Supplier (Bab 4.5.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Form lepas alur untuk memverifikasi dokumen fisik saat Supplier datang menyerahkan barang ke Gudang UP Sembalang.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: SEARCH & IDENTITAS PO */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Search className="w-4 h-4 text-primary" />
                1. Pencarian & Rujukan Purchase Order (PO)
              </div>

              <div>
                <Label className="text-xs font-semibold">Pilih Nomor PO Milik Supplier *</Label>
                <select
                  value={selectedPOId}
                  onChange={(e) => handleSelectPO(e.target.value)}
                  className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm font-mono"
                  required
                >
                  <option value="">-- [Pilih Nomor PO] --</option>
                  {pos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.po_number} - {p.title} (Rp {Number(p.contract_amount || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Gunakan dropdown atau pop-up untuk mencari nomor PO milik rekanan
                </p>
              </div>

              {selectedPOData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nomor PO:</span>
                    <span className="font-mono font-bold text-primary">{selectedPOData.po_number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Perihal Pengadaan:</span>
                    <span className="font-medium text-foreground">{selectedPOData.title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nilai Kontrak PO:</span>
                    <span className="font-bold text-emerald-600">
                      Rp {Number(selectedPOData.contract_amount || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: DETAIL CHECKLIST DOKUMEN PERSYARATAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileCheck className="w-4 h-4 text-primary" />
                2. Daftar Kelengkapan Dokumen Persyaratan PO
              </div>

              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Dokumen Persyaratan</th>
                      <th className="py-2.5 px-3 w-28 text-center">Ada / Hadir</th>
                      <th className="py-2.5 px-3">Catatan / No. Dokumen Fisik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {docList.map((doc, idx) => (
                      <tr key={doc.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 text-center font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-foreground">{doc.name}</div>
                          {doc.required && (
                            <span className="text-[10px] text-destructive font-semibold">* Wajib ada</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={doc.present}
                            onChange={() => handleTogglePresent(idx)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            value={doc.notes}
                            onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                            placeholder="Catatan kelengkapan fisik..."
                            className="h-8 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <Label className="text-xs font-semibold">Catatan Umum Pemeriksaan Gudang</Label>
                <Input
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  placeholder="Keterangan tambahan kelengkapan berkas fisik dari supplier..."
                  className="mt-1 text-xs h-9"
                />
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save], [Post] */}
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
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Save (Simpan Draft)
                </Button>
                <Button
                  type="button"
                  onClick={handlePost}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? "Memproses..." : "Post (Posting Dokumen)"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

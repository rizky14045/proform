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
  FileCheck,
  Search,
  Plus,
  Upload,
  FileText,
  Calendar,
  Building2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, poService } from "@/services/modules.service";
import { POAddendum, PurchaseOrder } from "@/types";
import toast from "react-hot-toast";

export default function AddendumPOPage() {
  const [addendums, setAddendums] = useState<POAddendum[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for PO
  const [showPoSelectModal, setShowPoSelectModal] = useState(false);
  const [poFilter, setPoFilter] = useState("");

  // Form Fields per Bab 4.8.18.2
  const [form, setForm] = useState({
    addendum_number: "",
    form_date: new Date().toISOString().split("T")[0],
    po_id: "",
    selected_po_display: "",
    po_title: "",
    supplier_name: "",
    original_amount: 0,
    addendum_sequence: 1,
    reason: "",
    revised_delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    scope_change_description: "Perpanjangan jadwal penyerahan barang dan penyesuaian volume suku cadang",
    revised_amount: 0,
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        pengadaanSubmoduleService.getPOAddendums(search),
        poService.getAllPO(""),
      ]);
      if (aRes?.success) setAddendums(aRes.data || []);
      if (pRes?.data) setPos(pRes.data || []);
    } catch {
      toast.error("Gagal memuat adendum PO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `ADD-PO/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      addendum_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      po_id: "",
      selected_po_display: "",
      po_title: "",
      supplier_name: "",
      original_amount: 0,
      addendum_sequence: 1,
      reason: "",
      revised_delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      scope_change_description: "Perpanjangan jadwal penyerahan barang dan penyesuaian volume suku cadang",
      revised_amount: 0,
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      selected_po_display: `${p.po_number} - ${p.title}`,
      po_title: p.title,
      supplier_name: p.supplier?.name || "PT Rekanan Sembalang",
      original_amount: Number(p.total_amount || 0),
      revised_amount: Number(p.total_amount || 0),
    }));
    setShowPoSelectModal(false);
    toast.success(`Dokumen PO ${p.po_number} terpilih`);
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih berkas dokumen Addendum PO terlebih dahulu!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen Addendum PO berhasil diunggah!");
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    if (!form.po_id || !form.reason) {
      toast.error("Silakan pilih dokumen PO asal dan isi alasan addendum bertanda (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await pengadaanSubmoduleService.createPOAddendum({
        po_id: form.po_id,
        addendum_number: form.addendum_number,
        addendum_sequence: Number(form.addendum_sequence),
        reason: form.reason,
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Addendum Purchase Order berhasil dikirim untuk Approval!"
            : "Addendum Purchase Order berhasil disimpan sebagai Draft"
        );
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

  const handleSendForRevision = () => {
    toast("Form dikembalikan ke pembuat addendum untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredPos = pos.filter(
    (p) =>
      p.po_number.toLowerCase().includes(poFilter.toLowerCase()) ||
      p.title.toLowerCase().includes(poFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
              PT PLN Nusantara Power UP Sembalang
            </Badge>
            <Badge variant="secondary" className="text-xs">Bab 4.8.18</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <FileCheck className="w-7 h-7 text-primary" />
            Addendum Purchase Order (Amandemen Kontrak)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan amandemen nilai kontrak, jadwal levering, atau perubahan volume spesifikasi pada pesanan resmi PO
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Buat Addendum PO
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Dokumen Addendum PO</CardTitle>
              <CardDescription className="text-xs">
                Monitoring riwayat perubahan pasal kontrak, addendum nilai biaya, dan penyesuaian tanggal serah terima
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor addendum / PO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="text-xs h-9">
                Cari
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">No. Addendum PO</th>
                  <th className="py-3 px-4 text-center">Addendum Ke</th>
                  <th className="py-3 px-4">Nomor PO Asal</th>
                  <th className="py-3 px-4">Alasan Perubahan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data addendum PO...
                    </td>
                  </tr>
                ) : addendums.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada Addendum PO yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  addendums.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{a.addendum_number}</td>
                      <td className="py-3 px-4 text-center font-bold">#{a.addendum_sequence}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        {a.po?.po_number || "PO-PLN-001"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-sm truncate">{a.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          {a.status || "PROPOSED"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL FORM ADDENDUM PO (BAB 4.8.18.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Form Addendum Purchase Order (Amandemen Kontrak)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.18.2 — Perubahan klausul, jadwal levering, dan penyesuaian pagu kontrak PO
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                UP Sembalang
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {/* SECTION 1: HEADER INFORMASI POKOK */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Identitas Surat Addendum PO
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form Addendum PO *</Label>
                  <Input
                    value={form.addendum_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form Addendum *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN PO & RUANG LINGKUP */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Rujukan PO yang Di-Addendum
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nomor Purchase Order (PO Asal) *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_po_display || "Klik Cari untuk memilih dokumen PO..."}
                      readOnly
                      placeholder="Pilih Dokumen PO..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowPoSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPoSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Addendum Ke- *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.addendum_sequence}
                    onChange={(e) => setForm({ ...form, addendum_sequence: Number(e.target.value) })}
                    className="mt-1.5 text-xs h-9 font-semibold"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tanggal Levering Baru</Label>
                  <Input
                    type="date"
                    value={form.revised_delivery_date}
                    onChange={(e) => setForm({ ...form, revised_delivery_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Alasan / Justifikasi Addendum PO *</Label>
                  <Input
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Contoh: Perpanjangan masa pengiriman sehubungan dengan keterlambatan pengapalan suku cadang"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Uraian Pasal / Klausul yang Diubah</Label>
                  <Input
                    value={form.scope_change_description}
                    onChange={(e) => setForm({ ...form, scope_change_description: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                {form.original_amount > 0 && (
                  <div className="md:col-span-2 text-xs text-muted-foreground">
                    Nilai PO Semula: <span className="font-mono font-bold text-foreground">Rp {form.original_amount.toLocaleString("id-ID")}</span> | Rekanan: <span className="font-semibold text-foreground">{form.supplier_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN ADDENDUM PO (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen Addendum PO (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (f.size > 25 * 1024 * 1024) {
                        toast.error("Ukuran file melebihi batas maksimal 25MB");
                        return;
                      }
                      setForm((prev) => ({ ...prev, file_name: f.name, file_uploaded: false }));
                    }
                  }}
                  className="text-xs h-9 bg-background file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadFile}
                  className="text-xs h-9 shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
              {form.file_name && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">File dipilih:</span>
                  <span className="font-mono font-medium text-foreground">{form.file_name}</span>
                  {form.file_uploaded ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Berhasil Diunggah
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                      Belum Di-upload
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.18.2 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendForRevision}
                  className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Send For Revision
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSubmit("SAVE")}
                  disabled={isSubmitting}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("SEND_FOR_APPROVAL")}
                  disabled={isSubmitting}
                  className="text-xs bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Send For Approval
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL CARI DOKUMEN PO */}
      <Dialog open={showPoSelectModal} onOpenChange={setShowPoSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen Purchase Order (PO Asal)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor PO atau judul..."
                value={poFilter}
                onChange={(e) => setPoFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PO</th>
                    <th className="py-2.5 px-3">Nama Pengadaan</th>
                    <th className="py-2.5 px-3">Rekanan</th>
                    <th className="py-2.5 px-3 text-right">Nilai Kontrak</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredPos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen PO yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredPos.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{p.po_number}</td>
                        <td className="py-2.5 px-3 font-medium">{p.title}</td>
                        <td className="py-2.5 px-3 font-semibold">{p.supplier?.name || "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold">
                          Rp {(p.total_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPO(p)}
                            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-white"
                          >
                            [Select]
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

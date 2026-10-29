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
  ClipboardCheck,
  Search,
  Plus,
  Upload,
  FileText,
  Award,
  Building2,
  Calendar,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService } from "@/services/modules.service";
import { QuotationRequest, Supplier } from "@/types";
import toast from "react-hot-toast";

export default function HasilPengadaanPage() {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [showSupplierSelectModal, setShowSupplierSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Form Fields per Bab 4.8.14.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    winner_vendor_id: "",
    selected_winner_display: "",
    final_contract_amount: 90000000,
    objection_period_start: new Date().toISOString().split("T")[0],
    objection_period_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        pengadaanSubmoduleService.getQuotations(search),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (qRes?.success) setQuotations(qRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
    } catch {
      toast.error("Gagal memuat hasil pengadaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `BAHP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      winner_vendor_id: "",
      selected_winner_display: "",
      final_contract_amount: 90000000,
      objection_period_start: new Date().toISOString().split("T")[0],
      objection_period_end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPP = (q: QuotationRequest) => {
    setForm((prev) => ({
      ...prev,
      pp_id: q.id,
      request_id: q.request_id || q.id,
      selected_pp_display: `${q.rfq_number} - ${q.request?.title || "Paket Pengadaan"}`,
      work_title: q.request?.title || "Pekerjaan Pengadaan",
    }));
    setShowPpSelectModal(false);
    toast.success(`Dokumen PP ${q.rfq_number} terpilih`);
  };

  const handleSelectWinner = (s: Supplier) => {
    setForm((prev) => ({
      ...prev,
      winner_vendor_id: s.id,
      selected_winner_display: `${s.name} (${s.code})`,
    }));
    setShowSupplierSelectModal(false);
    toast.success(`Rekanan ${s.name} dipilih sebagai Calon Pemenang`);
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih berkas Berita Acara Hasil Pengadaan (BAHP)!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen BAHP berhasil diunggah!");
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    if (!form.request_id || !form.winner_vendor_id) {
      toast.error("Silakan lengkapi dokumen PP dan rekanan pemenang bertanda (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        actionType === "SEND_FOR_APPROVAL"
          ? "Penetapan Hasil Pengadaan (BAHP) berhasil dikirim untuk Approval SPPBJ!"
          : "Penetapan Hasil Pengadaan berhasil disimpan sebagai Draft"
      );
      setIsDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForRevision = () => {
    toast("Form dikembalikan ke panitia pengadaan untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      q.rfq_number.toLowerCase().includes(ppFilter.toLowerCase()) ||
      (q.request?.title && q.request.title.toLowerCase().includes(ppFilter.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierFilter.toLowerCase()) ||
      s.code.toLowerCase().includes(supplierFilter.toLowerCase())
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.14</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Award className="w-7 h-7 text-primary" />
            Hasil Pengadaan (BAHP & Usulan Pemenang)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penetapan Berita Acara Hasil Pengadaan (BAHP), pengumuman masa sanggah, dan penerbitan SPPBJ (Surat 02 & Surat 05)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tetapkan Hasil Pengadaan
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Dokumen BAHP Ditetapkan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring usulan pemenang lelang, status masa sanggah, dan penerbitan SPPBJ
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor PP / RFQ..."
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
                  <th className="py-3 px-4">No. Form BAHP</th>
                  <th className="py-3 px-4">Nomor PP / RFQ</th>
                  <th className="py-3 px-4">Paket Pengadaan</th>
                  <th className="py-3 px-4">Masa Sanggah</th>
                  <th className="py-3 px-4 text-center">Status Penetapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data hasil pengadaan...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada Berita Acara Hasil Pengadaan yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {`BAHP/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{q.rfq_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{q.request?.title || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">5 Hari Kerja (Tanpa Sanggahan)</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          PEMENANG DITETAPKAN
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

      {/* MODAL FORM HASIL PENGADAAN (BAB 4.8.14.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-primary" />
                  Form Hasil Pengadaan (BAHP & Usulan Pemenang)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.14.2 — Berita Acara Hasil Pengadaan dan Usulan Penerbitan SPPBJ
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen BAHP
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form BAHP *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form BAHP *</Label>
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

            {/* SECTION 2: RUJUKAN NOMOR PP & CALON PEMENANG */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Rekanan Pemenang & Nilai Kontrak
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nomor Permintaan Penawaran (PP) Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_pp_display || "Klik Cari untuk memilih dokumen PP..."}
                      readOnly
                      placeholder="Pilih Dokumen PP..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowPpSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPpSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Rekanan Usulan Calon Pemenang *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_winner_display || "Klik Cari untuk memilih pemenang..."}
                      readOnly
                      placeholder="Pilih Rekanan Pemenang..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowSupplierSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowSupplierSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Nilai Akhir Kesepakatan Kontrak (Rp) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.final_contract_amount}
                    onChange={(e) => setForm({ ...form, final_contract_amount: Number(e.target.value) })}
                    className="mt-1.5 text-xs h-9 font-mono font-bold text-primary"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Rentang Masa Sanggah Rekanan (FMT-06.1.2.1.19)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Input
                      type="date"
                      value={form.objection_period_start}
                      onChange={(e) => setForm({ ...form, objection_period_start: e.target.value })}
                      className="text-xs h-9"
                    />
                    <Input
                      type="date"
                      value={form.objection_period_end}
                      onChange={(e) => setForm({ ...form, objection_period_end: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN BAHP (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen BAHP & Surat Usulan Pemenang (Maks. 25MB)
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

            {/* ACTION BUTTONS PER BAB 4.8.14.2 */}
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

      {/* POP-UP MODAL CARI DOKUMEN PP */}
      <Dialog open={showPpSelectModal} onOpenChange={setShowPpSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen Permintaan Penawaran (PP) Rujukan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor PP atau nama pengadaan..."
                value={ppFilter}
                onChange={(e) => setPpFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PP</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3">Tgl Penerbitan</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen PP yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{q.rfq_number}</td>
                        <td className="py-2.5 px-3 font-medium">{q.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{q.issue_date?.split("T")[0]}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPP(q)}
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

      {/* POP-UP MODAL CARI DATA REKANAN PEMENANG */}
      <Dialog open={showSupplierSelectModal} onOpenChange={setShowSupplierSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pilih Rekanan Usulan Calon Pemenang
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama rekanan atau kode..."
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Perusahaan</th>
                    <th className="py-2.5 px-3">PIC</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada data rekanan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{s.code}</td>
                        <td className="py-2.5 px-3 font-semibold">{s.name}</td>
                        <td className="py-2.5 px-3">{s.pic_name || "-"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectWinner(s)}
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

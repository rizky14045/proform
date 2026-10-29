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
  Building2,
  Search,
  Plus,
  Trash2,
  Upload,
  FileText,
  Calendar,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, masterService } from "@/services/modules.service";
import { UmbrellaContract, Supplier, QuotationRequest } from "@/types";
import toast from "react-hot-toast";

interface UmbrellaItem {
  id: string;
  item_code: string;
  item_name: string;
  uom: string;
  unit_price: number;
  est_min_volume: number;
  est_max_volume: number;
  subtotal_max: number;
}

export default function KontrakPayungPage() {
  const [contracts, setContracts] = useState<UmbrellaContract[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modals
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [showSupplierSelectModal, setShowSupplierSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Form Fields per Bab 4.8.16.2
  const [form, setForm] = useState({
    contract_number: "",
    contract_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    title: "",
    vendor_id: "",
    selected_vendor_display: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    delivery_terms: "30 Hari Kalender setelah penerbitan Purchase Order / Delivery Order",
    evaluator_team: "Komisi Penerimaan Barang & Jasa UP Sembalang",
    total_ceiling_amount: 0,
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Items Table
  const [items, setItems] = useState<UmbrellaItem[]>([]);
  const [itemInput, setItemInput] = useState({
    item_code: "1001-MAT",
    item_name: "",
    uom: "LTR",
    unit_price: 50000,
    est_min_volume: 100,
    est_max_volume: 2000,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, qRes] = await Promise.all([
        pengadaanSubmoduleService.getUmbrellaContracts(search),
        masterService.getSuppliers({ limit: 100 }),
        pengadaanSubmoduleService.getQuotations(""),
      ]);
      if (cRes?.success) setContracts(cRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
      if (qRes?.success) setQuotations(qRes.data || []);
    } catch {
      toast.error("Gagal memuat kontrak payung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `KP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      contract_number: autoNumber,
      contract_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      title: "",
      vendor_id: "",
      selected_vendor_display: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      delivery_terms: "30 Hari Kalender setelah penerbitan Purchase Order / Delivery Order",
      evaluator_team: "Komisi Penerimaan Barang & Jasa UP Sembalang",
      total_ceiling_amount: 0,
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setItems([]);
    setIsDialogOpen(true);
  };

  const handleSelectPP = (q: QuotationRequest) => {
    setForm((prev) => ({
      ...prev,
      pp_id: q.id,
      request_id: q.request_id || q.id,
      selected_pp_display: `${q.rfq_number} - ${q.request?.title || "Paket Pengadaan"}`,
      title: q.request?.title ? `Perjanjian Kontrak Payung ${q.request.title}` : prev.title,
    }));
    setShowPpSelectModal(false);
    toast.success(`Dokumen PP ${q.rfq_number} terpilih`);
  };

  const handleSelectSupplier = (s: Supplier) => {
    setForm((prev) => ({
      ...prev,
      vendor_id: s.id,
      selected_vendor_display: `${s.name} (${s.code})`,
    }));
    setShowSupplierSelectModal(false);
    toast.success(`Rekanan ${s.name} terpilih`);
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file berkas Kontrak Payung terlebih dahulu!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen Kontrak Payung berhasil diunggah!");
  };

  const handleAddItem = () => {
    if (!itemInput.item_name) {
      toast.error("Masukkan nama komoditas barang / jasa");
      return;
    }
    const maxSubtotal = itemInput.est_max_volume * itemInput.unit_price;
    const newItem: UmbrellaItem = {
      id: String(Date.now()),
      item_code: itemInput.item_code,
      item_name: itemInput.item_name,
      uom: itemInput.uom,
      unit_price: Number(itemInput.unit_price),
      est_min_volume: Number(itemInput.est_min_volume),
      est_max_volume: Number(itemInput.est_max_volume),
      subtotal_max: maxSubtotal,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    const newCeiling = newItems.reduce((acc, curr) => acc + curr.subtotal_max, 0);
    setForm((prev) => ({ ...prev, total_ceiling_amount: newCeiling }));

    setItemInput({
      item_code: "1001-MAT",
      item_name: "",
      uom: "LTR",
      unit_price: 50000,
      est_min_volume: 100,
      est_max_volume: 2000,
    });
    toast.success("Item komoditas ditambahkan ke Kontrak Payung");
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    if (!form.vendor_id || !form.title) {
      toast.error("Lengkapi judul kontrak dan rekanan bertanda (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const ceiling = Number(form.total_ceiling_amount);
      const res = await pengadaanSubmoduleService.createUmbrellaContract({
        contract_number: form.contract_number,
        title: form.title,
        vendor_id: form.vendor_id,
        start_date: form.start_date,
        end_date: form.end_date,
        total_ceiling_amount: ceiling,
        remaining_amount: ceiling,
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Kontrak Payung berhasil dikirim untuk Approval!"
            : "Kontrak Payung berhasil disimpan sebagai Draft"
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
    toast("Form dikembalikan ke pembuat kontrak untuk revisi");
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.16</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Building2 className="w-7 h-7 text-primary" />
            Kontrak Payung (Umbrella Contract)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan perjanjian kerja sama jangka panjang (Long Term Agreement) dengan harga satuan terkunci (Fixed Unit Price)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Daftarkan Kontrak Payung
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Kontrak Payung Berjalan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring sisa pagu plafon kontrak payung dan masa berlaku perjanjian
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor kontrak / rekanan..."
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
                  <th className="py-3 px-4">No. Kontrak Payung</th>
                  <th className="py-3 px-4">Ruang Lingkup Perjanjian</th>
                  <th className="py-3 px-4">Penyedia / Rekanan</th>
                  <th className="py-3 px-4 text-right">Total Plafon Pagu</th>
                  <th className="py-3 px-4 text-right">Sisa Pagu Tersedia</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Memuat data kontrak payung...
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Belum ada kontrak payung yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{c.contract_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{c.title}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {c.vendor?.name || "PT Mitra Rekanan"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                        Rp {Number(c.total_ceiling_amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-600">
                        Rp {Number(c.remaining_amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {c.start_date?.split("T")[0]} s.d {c.end_date?.split("T")[0]}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          {c.status || "ACTIVE"}
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

      {/* MODAL FORM KONTRAK PAYUNG (BAB 4.8.16.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Building2 className="w-5 h-5 text-primary" />
                  Form Kontrak Payung (Long Term Agreement)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.16.2 — Penetapan kontrak payung dan daftar komoditas harga satuan terkunci
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen Kontrak Payung
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Kontrak Payung *</Label>
                  <Input
                    value={form.contract_number}
                    onChange={(e) => setForm({ ...form, contract_number: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Format resmi sesuai surat perjanjian UP Sembalang</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Kontrak *</Label>
                  <Input
                    type="date"
                    value={form.contract_date}
                    onChange={(e) => setForm({ ...form, contract_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN PP, REKANAN & JANGKA WAKTU */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Mitra Penyedia & Ketentuan Kontrak
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Permintaan Penawaran (PP) Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_pp_display || "Klik Cari untuk memilih PP..."}
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
                  <Label className="text-xs font-semibold">Rekanan / Penyedia Terikat *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_vendor_display || "Klik Cari untuk memilih rekanan..."}
                      readOnly
                      placeholder="Pilih Rekanan..."
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

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Judul / Ruang Lingkup Kontrak Payung *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Perjanjian Kontrak Payung Pengadaan Bahan Kimia Water Treatment Unit 1-2"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Masa Berlaku Kontrak (Mulai s.d Selesai) *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="text-xs h-9"
                    />
                    <Input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Ketentuan Pengiriman / Levering SLA</Label>
                  <Input
                    value={form.delivery_terms}
                    onChange={(e) => setForm({ ...form, delivery_terms: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Tim Penilai BA Penerima Barang/Jasa</Label>
                  <Input
                    value={form.evaluator_team}
                    onChange={(e) => setForm({ ...form, evaluator_team: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN KONTRAK PAYUNG (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen Kontrak Payung Bertandatangan (Maks. 25MB)
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

            {/* SECTION 4: DETAIL KOMODITAS BARANG/JASA KONTRAK PAYUNG */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Rincian Komoditas & Harga Satuan Terkunci (Fixed Unit Price)
              </h4>

              {/* Subform Item */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div>
                  <Label className="text-[11px] font-semibold">Kode Barang</Label>
                  <Input
                    value={itemInput.item_code}
                    onChange={(e) => setItemInput({ ...itemInput, item_code: e.target.value })}
                    className="text-xs h-8 mt-1 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nama Barang / Layanan *</Label>
                  <Input
                    placeholder="Contoh: Oli Pelumas Turbin Shell Turbo T-46"
                    value={itemInput.item_name}
                    onChange={(e) => setItemInput({ ...itemInput, item_name: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Satuan</Label>
                  <Input
                    value={itemInput.uom}
                    onChange={(e) => setItemInput({ ...itemInput, uom: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Harga Terkunci (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemInput.unit_price}
                    onChange={(e) => setItemInput({ ...itemInput, unit_price: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Maks. Estimasi Volume</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemInput.est_max_volume}
                    onChange={(e) =>
                      setItemInput({ ...itemInput, est_max_volume: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div className="sm:col-span-6 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    className="text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Add To List]
                  </Button>
                </div>
              </div>

              {/* Table of Items */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Kode</th>
                      <th className="py-2.5 px-3">Nama Komoditas</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan Terkunci (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Maks. Volume Kuota</th>
                      <th className="py-2.5 px-3 text-right">Plafon Maksimal (Rp)</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          Belum ada item komoditas yang didaftarkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono text-muted-foreground">{it.item_code}</td>
                          <td className="py-2 px-3 font-semibold text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.uom}</td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-primary">
                            Rp {it.unit_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-medium">{it.est_max_volume}</td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-foreground">
                            Rp {it.subtotal_max.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = items.filter((i) => i.id !== it.id);
                                setItems(updated);
                                setForm((prev) => ({
                                  ...prev,
                                  total_ceiling_amount: updated.reduce((a, c) => a + c.subtotal_max, 0),
                                }));
                              }}
                              className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="bg-muted/30 border-t font-semibold">
                      <tr>
                        <td colSpan={5} className="py-2.5 px-3 text-right font-bold text-sm">
                          TOTAL PLAFON ANGGARAN KONTRAK PAYUNG:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary text-base">
                          Rp {form.total_ceiling_amount.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.16.2 */}
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

      {/* POP-UP MODAL CARI DATA REKANAN */}
      <Dialog open={showSupplierSelectModal} onOpenChange={setShowSupplierSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pilih Rekanan Penyedia Kontrak Payung
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
                            onClick={() => handleSelectSupplier(s)}
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

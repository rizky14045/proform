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
  FileText,
  Search,
  Plus,
  Calculator,
  Upload,
  Trash2,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { oeService, hpeService } from "@/services/modules.service";
import { OwnerEstimate, EngineeringEstimate } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface HPSItem {
  id: string;
  item_name: string;
  uom: string;
  qty: number;
  hpe_unit_price: number;
  hps_unit_price: number;
  subtotal: number;
}

export default function PenyusunanHPSPage() {
  const [estimates, setEstimates] = useState<OwnerEstimate[]>([]);
  const [hpeList, setHpeList] = useState<EngineeringEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for HPE
  const [showHpeSelectModal, setShowHpeSelectModal] = useState(false);
  const [hpeFilter, setHpeFilter] = useState("");

  // Form Fields per Bab 4.8.3.2
  const [form, setForm] = useState({
    oe_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    hpe_id: "",
    selected_hpe_display: "",
    hpe_title: "",
    hpe_total: 0,
    market_survey_method: "SURVEY_HARGA_PASAR",
    ppn_included: true,
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Items table
  const [items, setItems] = useState<HPSItem[]>([]);
  const [itemInput, setItemInput] = useState({
    item_name: "",
    uom: "EA",
    qty: 1,
    hpe_unit_price: 0,
    hps_unit_price: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oeRes, hpeRes] = await Promise.all([
        oeService.getAllOE(search),
        hpeService.getAllHPE({ limit: 50 }),
      ]);
      if (oeRes?.success) setEstimates(oeRes.data || []);
      if (hpeRes?.success) setHpeList(hpeRes.data || []);
    } catch {
      toast.error("Gagal memuat dokumen HPS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `HPS/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      oe_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      hpe_id: "",
      selected_hpe_display: "",
      hpe_title: "",
      hpe_total: 0,
      market_survey_method: "SURVEY_HARGA_PASAR",
      ppn_included: true,
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setItems([]);
    setItemInput({
      item_name: "",
      uom: "EA",
      qty: 1,
      hpe_unit_price: 0,
      hps_unit_price: 0,
    });
    setIsDialogOpen(true);
  };

  const handleSelectHPE = (est: EngineeringEstimate) => {
    setForm((prev) => ({
      ...prev,
      hpe_id: est.id,
      request_id: est.request_id || est.id,
      selected_hpe_display: `${est.ee_number} - ${est.request?.title || "Paket Pengadaan"}`,
      hpe_title: est.request?.title || "Paket Pengadaan",
      hpe_total: Number(est.total_estimated_cost || 0),
    }));
    setShowHpeSelectModal(false);
    toast.success(`HPE ${est.ee_number} terpilih`);

    // Auto seed an item from HPE if available
    if (items.length === 0) {
      const initialItem: HPSItem = {
        id: "1",
        item_name: est.request?.title || "Item Pengadaan Utama",
        uom: "LOT",
        qty: 1,
        hpe_unit_price: Number(est.total_estimated_cost || 0),
        hps_unit_price: Number(est.total_estimated_cost || 0) * 0.98, // default slight negotiation
        subtotal: Number(est.total_estimated_cost || 0) * 0.98,
      };
      setItems([initialItem]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, file_name: res.fileName, file_uploaded: true }));
    }
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file terlebih dahulu");
    } else {
      toast.success("File telah lolos verifikasi keamanan dan tersimpan");
    }
  };

  const handleAddItem = () => {
    if (!itemInput.item_name) {
      toast.error("Masukkan nama item pengadaan");
      return;
    }
    const subtotal = itemInput.qty * itemInput.hps_unit_price;
    const newItem: HPSItem = {
      id: String(Date.now()),
      item_name: itemInput.item_name,
      uom: itemInput.uom,
      qty: Number(itemInput.qty),
      hpe_unit_price: Number(itemInput.hpe_unit_price),
      hps_unit_price: Number(itemInput.hps_unit_price),
      subtotal,
    };
    setItems((prev) => [...prev, newItem]);
    setItemInput({
      item_name: "",
      uom: "EA",
      qty: 1,
      hpe_unit_price: 0,
      hps_unit_price: 0,
    });
    toast.success("Item berhasil ditambahkan ke daftar HPS");
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const subtotalHPS = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const ppnAmount = form.ppn_included ? subtotalHPS * 0.11 : 0;
  const totalHPS = subtotalHPS + ppnAmount;

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Dokumen HPE", value: form.request_id, required: true },
      { field: "oe_number", label: "Nomor Dokumen HPS", value: form.oe_number, required: true, minLength: 3 },
      { field: "form_date", label: "Tanggal Form HPS", value: form.form_date, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    if (items.length === 0) {
      toast.error("Minimal harus ada 1 item rincian HPS");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await oeService.createOE({
        request_id: form.request_id,
        oe_number: form.oe_number,
        total_oe_amount: totalHPS,
        market_survey_method: form.market_survey_method,
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Dokumen HPS berhasil dikirim untuk Approval!"
            : "Dokumen HPS berhasil disimpan sebagai Draft"
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
    toast("Form HPS dikembalikan ke pembuat untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredHpe = hpeList.filter(
    (est) =>
      (est.ee_number && est.ee_number.toLowerCase().includes(hpeFilter.toLowerCase())) ||
      (est.hpe_number && est.hpe_number.toLowerCase().includes(hpeFilter.toLowerCase())) ||
      (est.request?.title && est.request.title.toLowerCase().includes(hpeFilter.toLowerCase()))
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.3</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Calculator className="w-7 h-7 text-primary" />
            Harga Perkiraan Sendiri (HPS / Owner Estimate)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penetapan batas atas nilai pagu pelelangan dan rincian komponen harga pasar wajar oleh Pejabat Pelaksana Pengadaan
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Susun Dokumen HPS
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Dokumen HPS / Owner Estimate</CardTitle>
              <CardDescription className="text-xs">
                Dokumen referensi harga untuk batas evaluasi penawaran dan dasar negosiasi harga
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor HPS..."
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
                  <th className="py-3 px-4">Nomor Dokumen HPS</th>
                  <th className="py-3 px-4">Nama Paket Pengadaan</th>
                  <th className="py-3 px-4">Metode Survei</th>
                  <th className="py-3 px-4 text-right">Total Nilai HPS</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Klasifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Memuat data dokumen HPS...
                    </td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada dokumen HPS yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  estimates.map((oe) => (
                    <tr key={oe.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{oe.oe_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{oe.request?.title || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {oe.market_survey_method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                        Rp {Number(oe.total_oe_amount || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          {oe.status || "APPROVED"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] text-amber-600 font-medium">Dokumen Rahasia</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL FORM PENYUSUNAN HPS (BAB 4.8.3.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Calculator className="w-5 h-5 text-primary" />
                  Form Harga Perkiraan Sendiri (HPS / Owner Estimate)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.3.2 — Penyusunan formulir HPS berdasarkan rujukan Dokumen HPE
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen HPS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form / Dokumen HPS *</Label>
                  <Input
                    value={form.oe_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
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

            {/* SECTION 2: RUJUKAN DOKUMEN HPE & METODE SURVEI */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> Rujukan Dokumen HPE & Metodologi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Dokumen HPE Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_hpe_display || "Klik Cari untuk memilih dokumen HPE..."}
                      readOnly
                      placeholder="Pilih Dokumen HPE..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowHpeSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHpeSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                  {form.hpe_total > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Nilai HPE Acuan: <span className="font-mono font-bold text-foreground">Rp {form.hpe_total.toLocaleString("id-ID")}</span>
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold">Metode Survei Pasar *</Label>
                  <select
                    value={form.market_survey_method}
                    onChange={(e) => setForm({ ...form, market_survey_method: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    <option value="SURVEY_HARGA_PASAR">Survei Harga Pasar / Brosur Resmi</option>
                    <option value="KONTRAK_SEJENIS">Kontrak Pengadaan Sejenis (Historical Data)</option>
                    <option value="STANDAR_TARIF_PLN">Standar Biaya & Tarif Resmi PLN</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="ppn_toggle"
                    checked={form.ppn_included}
                    onChange={(e) => setForm({ ...form, ppn_included: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="ppn_toggle" className="text-xs font-semibold cursor-pointer">
                    Termasuk PPN 11% (Pajak Pertambahan Nilai)
                  </Label>
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN KAJIAN HPS (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Kajian / Kertas Kerja HPS (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
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

            {/* SECTION 4: DETAIL RINCIAN ITEM HPS & ADD TO LIST */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Detail Komponen Pengadaan HPS (Bab 4.8.3.2 Langkah 8-12)
              </h4>

              {/* Subform Input Baris */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nama Item Pengadaan *</Label>
                  <Input
                    placeholder="Nama material / jasa..."
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
                  <Label className="text-[11px] font-semibold">Volume (Qty)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemInput.qty}
                    onChange={(e) => setItemInput({ ...itemInput, qty: Number(e.target.value) })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Harga Satuan HPE (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemInput.hpe_unit_price}
                    onChange={(e) => setItemInput({ ...itemInput, hpe_unit_price: Number(e.target.value) })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Harga Satuan HPS (Rp) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemInput.hps_unit_price}
                    onChange={(e) => setItemInput({ ...itemInput, hps_unit_price: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
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

              {/* Table of HPS Items */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item Pengadaan</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga HPE (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Harga HPS (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal HPS (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          Belum ada item HPS yang ditambahkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.uom}</td>
                          <td className="py-2 px-3 text-center font-semibold">{it.qty}</td>
                          <td className="py-2 px-3 font-mono text-right text-muted-foreground">
                            {it.hpe_unit_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 font-mono text-right font-bold text-primary">
                            {it.hps_unit_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-foreground">
                            {it.subtotal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(it.id)}
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
                    <tfoot className="bg-muted/30 border-t font-semibold divide-y divide-border/40">
                      <tr>
                        <td colSpan={5} className="py-2 px-3 text-right font-medium">
                          SUBTOTAL HPS:
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          Rp {subtotalHPS.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                      {form.ppn_included && (
                        <tr>
                          <td colSpan={5} className="py-2 px-3 text-right font-medium">
                            PPN 11%:
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-muted-foreground">
                            Rp {ppnAmount.toLocaleString("id-ID")}
                          </td>
                          <td></td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={5} className="py-2.5 px-3 text-right font-bold text-sm">
                          TOTAL NILAI HPS RESMI:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary text-base">
                          Rp {totalHPS.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.3.2 */}
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

      {/* POP-UP MODAL CARI DOKUMEN HPE (BAB 4.8.3.2 LANGKAH 4) */}
      <Dialog open={showHpeSelectModal} onOpenChange={setShowHpeSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen HPE (Harga Perkiraan Engineering)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor HPE atau judul pengadaan..."
                value={hpeFilter}
                onChange={(e) => setHpeFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor HPE</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3 text-right">Total Nilai HPE</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredHpe.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen HPE yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredHpe.map((est) => (
                      <tr key={est.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{est.ee_number}</td>
                        <td className="py-2.5 px-3 font-medium">{est.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold">
                          Rp {(est.total_estimated_cost || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectHPE(est)}
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

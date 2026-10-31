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
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  Building,
  TrendingUp,
  Upload,
  Coins,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { hpeService, masterService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { EngineeringEstimate, ProcurementRequest, Supplier } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface HPEItemRow {
  id: string;
  item_name: string;
  qty: number;
  unit: string;
  ref_price_1: number;
  ref_price_2: number;
  ref_price_3: number;
  ref_price_4: number;
  hpe_agreed_price: number;
}

export default function HpeRksPage() {
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedRefFile, setUploadedRefFile] = useState("");

  // Form HPE state according to PDF Manual 4.7.3.2
  const [form, setForm] = useState({
    hpe_number: "00" + Math.floor(10 + Math.random() * 90) + "/HPE/600/UP-SMBL/" + new Date().getFullYear(),
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    procurement_method: "PENGADAAN_LANGSUNG",
    vendor_ref_1: "",
    vendor_ref_2: "",
    vendor_ref_3: "",
    vendor_ref_4: "",
    include_ppn: true,
  });

  const [hpeItems, setHpeItems] = useState<HPEItemRow[]>([
    {
      id: "1",
      item_name: "Cartridge Air Intake Filter Gas Turbine",
      qty: 48,
      unit: "PCS",
      ref_price_1: 2600000,
      ref_price_2: 2550000,
      ref_price_3: 2700000,
      ref_price_4: 0,
      hpe_agreed_price: 2500000,
    },
    {
      id: "2",
      item_name: "Pre-Filter Mat G4 Washable Panel",
      qty: 50,
      unit: "PCS",
      ref_price_1: 550000,
      ref_price_2: 520000,
      ref_price_3: 500000,
      ref_price_4: 0,
      hpe_agreed_price: 500000,
    },
  ]);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hRes, rRes, sRes] = await Promise.all([
        hpeService.getAllHPE(search).catch(() => ({ data: [] })),
        procurementService.getAll({ limit: 50 }).catch(() => ({ data: [] })),
        masterService.getSuppliers({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      if (hRes?.data) setEstimates(hRes.data);
      if (rRes?.data) setRequests(rRes.data);
      if (sRes?.data) setSuppliers(sRes.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleOpenCreate = () => {
    setForm({
      hpe_number: "00" + Math.floor(10 + Math.random() * 90) + "/HPE/600/UP-SMBL/" + new Date().getFullYear(),
      form_date: new Date().toISOString().split("T")[0],
      request_id: requests[0]?.id || "",
      procurement_method: "PENGADAAN_LANGSUNG",
      vendor_ref_1: suppliers[0]?.name || "PT Mitra Rekayasa Daya",
      vendor_ref_2: suppliers[1]?.name || "PT Pama Indo Sentosa",
      vendor_ref_3: suppliers[2]?.name || "PT Teknik Mandiri Jaya",
      vendor_ref_4: "",
      include_ppn: true,
    });
    setUploadedRefFile("");
    setIsCreateOpen(true);
  };

  const handleUpdateItem = (id: string, field: keyof HPEItemRow, val: any) => {
    setHpeItems(
      hpeItems.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const subtotalHPE = hpeItems.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.hpe_agreed_price) || 0),
    0
  );
  const ppnAmount = form.include_ppn ? Math.round(subtotalHPE * 0.11) : 0;
  const grandTotalHPE = subtotalHPE + ppnAmount;

  const handleRefFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setUploadedRefFile(res.fileName);
    }
  };

  const handleSaveHPE = async (isSendApproval: boolean) => {
    const validation = validateForm([
      { field: "hpe_number", label: "Nomor Dokumen HPE", value: form.hpe_number, required: true },
      { field: "request_id", label: "Rujukan Usulan PPA", value: form.request_id, required: true },
      { field: "procurement_method", label: "Metode Pengadaan", value: form.procurement_method, required: true },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    if (hpeItems.length === 0) {
      toast.error("Rincian item barang/jasa HPE tidak boleh kosong");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        hpe_number: form.hpe_number,
        request_id: form.request_id,
        procurement_method: form.procurement_method,
        total_hpe: grandTotalHPE,
        status: isSendApproval ? "APPROVED" : "DRAFT",
      };
      const res = await hpeService.createHPE(payload);
      if (res?.success) {
        toast.success(
          isSendApproval
            ? "Dokumen HPE berhasil disetujui & dikirim untuk approval!"
            : "Draft dokumen HPE berhasil disimpan!"
        );
        setIsCreateOpen(false);
        loadData();
      } else {
        toast.error(res?.message || "Gagal menyimpan HPE");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Harga Perkiraan Engineering (HPE) (Bab 4.7.3)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penyusunan estimasi harga engineering berdasar 1-4 referensi rekanan resmi PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Buat Form HPE Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Dokumen HPE</p>
            <h3 className="text-2xl font-bold mt-1">{estimates.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Draft / Review</p>
            <h3 className="text-2xl font-bold mt-1">
              {estimates.filter((e) => e.status === "DRAFT").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">HPE Disetujui</p>
            <h3 className="text-2xl font-bold mt-1">
              {estimates.filter((e) => e.status === "APPROVED").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Nilai HPE</p>
            <h3 className="text-base font-bold mt-1">
              {formatRupiah(estimates.reduce((acc, curr) => acc + (curr.total_hpe || 0), 0))}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Dokumen HPE</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi Harga Perkiraan Engineering yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor / judul..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Form HPE</th>
                  <th className="py-3 px-4">Paket Rujukan Usulan</th>
                  <th className="py-3 px-4">Total Nilai HPE</th>
                  <th className="py-3 px-4">Status Dokumen</th>
                  <th className="py-3 px-4">Tanggal Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      Memuat data HPE...
                    </td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      Belum ada dokumen HPE terdaftar.
                    </td>
                  </tr>
                ) : (
                  estimates.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-xs text-primary font-bold">
                        {item.hpe_number || "DRAFT-HPE"}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item.procurement_request?.title || item.procurement_request?.request_number || item.request_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 font-mono">
                        {formatRupiah(item.total_hpe || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className={item.status === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {item.status === "APPROVED" ? "Disetujui" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM HARGA PERKIRAAN ENGINEERING (Bab 4.7.3.2) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Coins className="w-5 h-5 text-primary" />
              Form Harga Perkiraan Engineering (HPE) (Bab 4.7.3.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff Inventori PT PLN Nusantara Power UP Sembalang yang telah ditunjuk melalui Distribusi Perencanaan.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* SECTION 1: HEADER & METODE PENGADAAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Dokumen & Metode Pengadaan
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.hpe_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor form terbentuk otomatis oleh sistem</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Metode Pengadaan *</Label>
                  <select
                    value={form.procurement_method}
                    onChange={(e) => setForm({ ...form, procurement_method: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="PENGADAAN_LANGSUNG">Pengadaan Langsung</option>
                    <option value="PENUNJUKAN_LANGSUNG">Penunjukan Langsung</option>
                    <option value="LELANG_TERBUKA">Pelelangan Terbuka</option>
                    <option value="LELANG_TERBATAS">Pelelangan Terbatas</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Paket Usulan Pengadaan (RO) Terkait *</Label>
                <select
                  value={form.request_id}
                  onChange={(e) => setForm({ ...form, request_id: e.target.value })}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                  required
                >
                  <option value="">-- [Pilih Paket Usulan Pengadaan] --</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.request_number} - {r.title} (RAB: Rp {Number(r.rab_amount || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* UPLOAD REFERENSI HARGA */}
              <div>
                <Label className="text-xs font-semibold">Upload Dokumen Referensi Harga (Katalog/Survei Pasar/Riwayat PO)</Label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    [Choose File / Pilih File]
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.xls,.docx,.doc"
                      onChange={handleRefFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {uploadedRefFile ? (
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi: {uploadedRefFile}
                      </span>
                    ) : (
                      "Belum ada berkas referensi dipilih (Maks. 25MB)"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: 1-4 REFERENSI REKANAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Building className="w-4 h-4 text-primary" />
                2. Pemilihan 1 - 4 Rekanan Referensi Harga Pasar
              </div>
              <p className="text-[11px] text-muted-foreground">
                Bila hanya memilih 1 referensi, kolom referensi lain akan dinonaktifkan. Anda dapat membandingkan hingga 4 rekanan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nama Rekanan Referensi 1 *</Label>
                  <Input
                    value={form.vendor_ref_1}
                    onChange={(e) => setForm({ ...form, vendor_ref_1: e.target.value })}
                    placeholder="Nama Vendor / Sumber Harga 1"
                    className="mt-1 text-xs h-9"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nama Rekanan Referensi 2</Label>
                  <Input
                    value={form.vendor_ref_2}
                    onChange={(e) => setForm({ ...form, vendor_ref_2: e.target.value })}
                    placeholder="Nama Vendor / Sumber Harga 2"
                    className="mt-1 text-xs h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nama Rekanan Referensi 3</Label>
                  <Input
                    value={form.vendor_ref_3}
                    onChange={(e) => setForm({ ...form, vendor_ref_3: e.target.value })}
                    placeholder="Nama Vendor / Sumber Harga 3"
                    className="mt-1 text-xs h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nama Rekanan Referensi 4</Label>
                  <Input
                    value={form.vendor_ref_4}
                    onChange={(e) => setForm({ ...form, vendor_ref_4: e.target.value })}
                    placeholder="Nama Vendor / Sumber Harga 4"
                    className="mt-1 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: TABEL RINCIAN ITEM & ANALISIS HARGA HPE */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Coins className="w-4 h-4 text-primary" />
                3. Matriks Perbandingan Harga & Penetapan HPE
              </div>

              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Nama Barang / Jasa</th>
                      <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-14">UOI</th>
                      <th className="py-2.5 px-3 text-right">Harga Ref 1</th>
                      <th className="py-2.5 px-3 text-right">Harga Ref 2</th>
                      <th className="py-2.5 px-3 text-right">Harga Ref 3</th>
                      <th className="py-2.5 px-3 text-right font-bold text-primary">Harga HPE (Satuan)</th>
                      <th className="py-2.5 px-3 text-right font-bold">Subtotal HPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {hpeItems.map((it, idx) => {
                      const itemSubtotal = (Number(it.qty) || 0) * (Number(it.hpe_agreed_price) || 0);
                      return (
                        <tr key={it.id} className="hover:bg-muted/20">
                          <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.qty}</td>
                          <td className="py-2 px-3 font-mono">{it.unit}</td>
                          <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                            {formatRupiah(it.ref_price_1)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                            {it.ref_price_2 ? formatRupiah(it.ref_price_2) : "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                            {it.ref_price_3 ? formatRupiah(it.ref_price_3) : "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            <Input
                              type="number"
                              value={it.hpe_agreed_price}
                              onChange={(e) =>
                                handleUpdateItem(it.id, "hpe_agreed_price", Number(e.target.value) || 0)
                              }
                              className="h-7 w-28 text-xs font-mono text-right font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatRupiah(itemSubtotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PPN & TOTAL CALCULATION */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal Nilai HPE (Sebelum Pajak):</span>
                  <span className="font-mono font-bold">{formatRupiah(subtotalHPE)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ppn_toggle"
                      checked={form.include_ppn}
                      onChange={(e) => setForm({ ...form, include_ppn: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <Label htmlFor="ppn_toggle" className="cursor-pointer font-semibold">
                      Termasuk PPN 11%
                    </Label>
                  </div>
                  <span className="font-mono font-medium text-muted-foreground">{formatRupiah(ppnAmount)}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-primary/10 rounded-xl border border-primary/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Total Harga Perkiraan Engineering (HPE Final):
                  </span>
                  <span className="text-xl font-black font-mono text-primary">
                    {formatRupiah(grandTotalHPE)}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save as Draft], [Send For Approval] */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                Back (Kembali)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSaveHPE(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Save (Simpan Draft)
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSaveHPE(true)}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Memproses..." : "Send For Approval"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

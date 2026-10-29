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
  Truck,
  Search,
  Plus,
  Building2,
  Calendar,
  AlertTriangle,
  UploadCloud,
  FileText,
  Boxes,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
} from "lucide-react";
import { warehouseService, poService } from "@/services/modules.service";
import { GoodsReceipt, PurchaseOrder } from "@/types";
import toast from "react-hot-toast";

interface ReceiptItem {
  id: string;
  item_name: string;
  stock_code: string;
  warehouse_target: string;
  bin_location: string;
  qty_received: number;
  unit: string;
  unit_price: number;
}

export default function WarehouseReceiptsPage() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector modal states
  const [poSelectOpen, setPoSelectOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [itemSelectOpen, setItemSelectOpen] = useState(false);

  const [form, setForm] = useState({
    receipt_number: `RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    receipt_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    vendor_name: "",
    delivery_note_number: `SJ-VND/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    contract_delivery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    actual_delivery_date: new Date().toISOString().split("T")[0],
    penalty_days: 5,
    penalty_rate_per_mil: 1, // 1 per mil (1/1000) per hari
    penalty_amount: 0,
    uploaded_file_name: "",
    notes: "Penerimaan fisik material lengkap di Gudang Sentral UP Sembalang",
  });

  const [items, setItems] = useState<ReceiptItem[]>([
    {
      id: "it-1",
      item_name: "Bearing SKF 6205-2RSH/C3 High Temp",
      stock_code: "10023481",
      warehouse_target: "Gudang Sentral UP Sembalang",
      bin_location: "BIN-A02-R3",
      qty_received: 20,
      unit: "PCS",
      unit_price: 350000,
    },
    {
      id: "it-2",
      item_name: "Mechanical Seal Burgmann M7N/35-G9",
      stock_code: "10049281",
      warehouse_target: "Gudang Sentral UP Sembalang",
      bin_location: "BIN-B01-R1",
      qty_received: 5,
      unit: "SET",
      unit_price: 2450000,
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        warehouseService.getAllReceipts({ search }).catch(() => ({ data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ data: [] })),
      ]);
      if (rRes?.data) setReceipts(rRes.data || []);
      if (pRes?.data) setPos(pRes.data || []);
    } catch {
      toast.error("Gagal memuat data penerimaan barang gudang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  // Hitung keterlambatan otomatis
  useEffect(() => {
    if (form.contract_delivery_date && form.actual_delivery_date) {
      const t1 = new Date(form.contract_delivery_date).getTime();
      const t2 = new Date(form.actual_delivery_date).getTime();
      const diffDays = Math.max(0, Math.ceil((t2 - t1) / (1000 * 60 * 60 * 24)));

      // Total PO
      const totalPoValue = items.reduce(
        (acc, curr) => acc + (curr.qty_received * curr.unit_price),
        0
      );
      // Denda = 1/1000 * diffDays * total PO (max 5%)
      const penalty = Math.min(
        totalPoValue * 0.05,
        (diffDays * 0.001) * totalPoValue
      );

      setForm((prev) => ({
        ...prev,
        penalty_days: diffDays,
        penalty_amount: penalty,
      }));
    }
  }, [form.contract_delivery_date, form.actual_delivery_date, items]);

  const openAddModal = () => {
    setForm({
      receipt_number: `RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      receipt_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      vendor_name: "",
      delivery_note_number: `SJ-VND/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      contract_delivery_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      actual_delivery_date: new Date().toISOString().split("T")[0],
      penalty_days: 5,
      penalty_rate_per_mil: 1,
      penalty_amount: 0,
      uploaded_file_name: "",
      notes: "Penerimaan fisik material lengkap di Gudang Sentral UP Sembalang",
    });
    setIsDialogOpen(true);
  };

  const handleSelectPO = (p: PurchaseOrder) => {
    setForm((prev) => ({
      ...prev,
      po_id: p.id,
      po_number: p.po_number || "",
      po_title: p.title || "",
      vendor_name: p.vendor?.name || p.supplier?.name || "Vendor Rekanan",
    }));

    if (p.items && p.items.length > 0) {
      setItems(
        p.items.map((it, idx) => ({
          id: `it-${idx}`,
          item_name: it.item_name || it.name || `Material Item ${idx + 1}`,
          stock_code: `100${Math.floor(10000 + Math.random() * 90000)}`,
          warehouse_target: "Gudang Sentral UP Sembalang",
          bin_location: `BIN-A0${(idx % 5) + 1}-R${idx + 1}`,
          qty_received: Number(it.quantity || 1),
          unit: it.unit || "PCS",
          unit_price: Number(it.unit_price || 500000),
        }))
      );
    }

    setPoSelectOpen(false);
    toast.success(`PO ${p.po_number} dipilih`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas 25 MB");
      return;
    }
    setForm((prev) => ({ ...prev, uploaded_file_name: file.name }));
    toast.success(`File ${file.name} berhasil diunggah`);
  };

  const handleSubmit = async (actionType: "DRAFT" | "SUBMITTED") => {
    if (!form.po_id) {
      toast.error("Rujukan Purchase Order wajib dipilih");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await warehouseService.createReceipt({
        receipt_number: form.receipt_number,
        po_id: form.po_id,
        delivery_note_number: form.delivery_note_number,
        inspector_name: "Staff Gudang UP Sembalang",
        status: actionType === "SUBMITTED" ? "PENDING_APPROVAL" : "DRAFT",
        notes: `${form.notes} [Keterlambatan: ${form.penalty_days} Hari, Denda: Rp ${form.penalty_amount.toLocaleString("id-ID")}] [Berkas: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "SUBMITTED"
            ? "Penerimaan Barang berhasil dikirim untuk persetujuan [Send For Approval]"
            : "Penerimaan Barang berhasil disimpan sebagai Draft"
        );
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(res?.message || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPOs = pos.filter((p) => {
    const q = poSearch.toLowerCase();
    return (
      p.po_number?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.vendor?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Penerimaan Barang (Goods Receipt) (Bab 4.9.4)
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Pencatatan material dan persediaan fisik masuk gudang, perhitungan denda keterlambatan levering, dan alokasi Bin Lokasi
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> [Add] Penerimaan Barang
        </Button>
      </div>

      {/* Tabel List Penerimaan Barang */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Penerimaan Barang (Bab 4.9.4.1)</CardTitle>
              <CardDescription className="text-xs">
                Melihat dan memonitor data transaksi penerimaan barang di Gudang UP Sembalang
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor penerimaan / PO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={loadData} className="h-9 px-3 text-xs">
                [Find]
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">No. Penerimaan</th>
                  <th className="py-3 px-4">No. Purchase Order</th>
                  <th className="py-3 px-4">No. Surat Jalan</th>
                  <th className="py-3 px-4">Pemeriksa Gudang</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      Memuat data penerimaan barang...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada data penerimaan barang di gudang. Klik [Add] untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{r.receipt_number}</td>
                      <td className="py-3 px-4 font-mono">{r.po?.po_number || "-"}</td>
                      <td className="py-3 px-4">{r.delivery_note_number || "-"}</td>
                      <td className="py-3 px-4">{r.inspector_name || "-"}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {r.status}
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

      {/* FORM MODAL PENERIMAAN BARANG (BAB 4.9.4.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
              </div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Truck className="w-5 h-5 text-primary" />
                Form Penerimaan Barang (Bab 4.9.4.2)
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dikerjakan oleh Staff Gudang berdasarkan hasil distribusi penerimaan SPV Gudang UP Sembalang
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form Penerimaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Form <span className="text-xs text-muted-foreground">(Otomatis Sistem)</span>
                  </Label>
                  <Input
                    value={form.receipt_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-mono bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tanggal Form <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.receipt_date}
                    onChange={(e) => setForm({ ...form, receipt_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Rujukan PO (Purchase Order) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      placeholder="Klik [Select] PO"
                      value={form.po_number || ""}
                      readOnly
                      className="text-xs h-9 bg-background font-mono font-semibold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPoSelectOpen(true)}
                      className="h-9 px-3 text-xs shrink-0"
                    >
                      [Select]
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Surat Jalan (Delivery Order) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.delivery_note_number}
                    onChange={(e) => setForm({ ...form, delivery_note_number: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Vendor / Supplier</Label>
                  <Input
                    value={form.vendor_name || "Pilih PO terlebih dahulu"}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Perhitungan Tanggal Levering & Denda Keterlambatan */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Perhitungan Tanggal Levering & Denda Keterlambatan
                </h3>
                {form.penalty_days > 0 && (
                  <Badge variant="destructive" className="text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Terlambat {form.penalty_days} Hari
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tgl Levering Kontrak PO <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.contract_delivery_date}
                    onChange={(e) => setForm({ ...form, contract_delivery_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Tgl Penerimaan Aktual <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.actual_delivery_date}
                    onChange={(e) => setForm({ ...form, actual_delivery_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">Jumlah Hari Keterlambatan</Label>
                  <Input
                    value={`${form.penalty_days} Hari`}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-bold bg-muted text-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Estimasi Denda Keterlambatan (1‰/hari)
                  </Label>
                  <Input
                    value={`Rp ${Math.round(form.penalty_amount).toLocaleString("id-ID")}`}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-bold text-red-600 bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bagian Detail Barang & Stock Code Ellipse & Bin Rak */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-primary" />
                  Detail Barang, Stock Code Ellipse & Bin Lokasi Gudang
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {items.length} Item Material
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Nama Barang</th>
                      <th className="py-2.5 px-3">Stock Code (Ellipse)</th>
                      <th className="py-2.5 px-3">Gudang Tujuan</th>
                      <th className="py-2.5 px-3">Bin Lokasi / Rak</th>
                      <th className="py-2.5 px-3 text-center">Qty Diterima</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{it.item_name}</td>
                        <td className="py-2.5 px-3">
                          <Input
                            value={it.stock_code}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((item) => (item.id === it.id ? { ...item, stock_code: val } : item))
                              );
                            }}
                            className="font-mono text-xs h-8 w-28 font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground font-medium">
                          {it.warehouse_target}
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            value={it.bin_location}
                            onChange={(e) => {
                              const val = e.target.value;
                              setItems((prev) =>
                                prev.map((item) => (item.id === it.id ? { ...item, bin_location: val } : item))
                              );
                            }}
                            className="font-mono text-xs h-8 w-28 uppercase"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={it.qty_received}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setItems((prev) =>
                                prev.map((item) => (item.id === it.id ? { ...item, qty_received: val } : item))
                              );
                            }}
                            className="font-mono text-xs h-8 w-16 text-center font-bold mx-auto"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                          {it.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upload Dokumen Surat Jalan / Tanda Terima */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Berkas Tanda Terima / Surat Jalan Vendor
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-muted text-xs bg-background">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Pilih File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-xs text-muted-foreground">
                  {form.uploaded_file_name ? (
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {form.uploaded_file_name}
                    </span>
                  ) : (
                    "Belum ada file dipilih (Maksimal 25 MB, format: PDF/DOC/XLS)"
                  )}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS PERSIS PDF */}
            <div className="flex items-center justify-between pt-5 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> [Back]
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="text-xs text-muted-foreground"
                >
                  [Cancel]
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("DRAFT")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> [Save as Draft]
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("SUBMITTED")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> [Send For Approval]
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP UP SELECTOR PO */}
      <Dialog open={poSelectOpen} onOpenChange={setPoSelectOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Purchase Order Barang
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor PO, judul, vendor..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {filteredPOs.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Tidak ada data Purchase Order ditemukan
                </div>
              ) : (
                filteredPOs.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-muted/50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-primary">{p.po_number}</div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Vendor: {p.vendor?.name || p.supplier?.name || "Rekanan"} | Nilai: Rp{" "}
                        {Number(p.total_amount || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectPO(p)}
                      className="h-7 text-xs px-2.5"
                    >
                      [Select]
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

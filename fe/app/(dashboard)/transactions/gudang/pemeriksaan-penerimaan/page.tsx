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
  FileSpreadsheet,
  Search,
  Plus,
  CheckCircle2,
  Building2,
  UploadCloud,
  FileText,
  Boxes,
  ClipboardCheck,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";
import { gudangSubmoduleService, poService, masterService } from "@/services/modules.service";
import { GoodsReceiptInspection, PurchaseOrder, User } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface RequirementDoc {
  id: string;
  name: string;
  checked: boolean;
}

interface ItemInspection {
  id: string;
  item_name: string;
  qty_po: number;
  qty_received: number;
  unit: string;
  receipt_date: string;
}

export default function PemeriksaanPenerimaanBarangPage() {
  const [inspections, setInspections] = useState<GoodsReceiptInspection[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector modal
  const [poSelectOpen, setPoSelectOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");

  const [form, setForm] = useState({
    form_number: `INSP-RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
    inspection_date: new Date().toISOString().split("T")[0],
    po_id: "",
    po_number: "",
    po_title: "",
    vendor_name: "",
    delivery_note_number: "",
    is_condition_good: true,
    package_box_count: 5,
    uploaded_file_name: "",
    status: "DRAFT",
    notes: "Barang diterima di Gudang Sentral UP Sembalang, kondisi packing kayu dan kardus utuh.",
  });

  const [items, setItems] = useState<ItemInspection[]>([
    {
      id: "item-1",
      item_name: "Bearing SKF 6205-2RSH/C3 High Temp",
      qty_po: 20,
      qty_received: 20,
      unit: "PCS",
      receipt_date: new Date().toISOString().split("T")[0],
    },
    {
      id: "item-2",
      item_name: "Mechanical Seal Burgmann M7N/35-G9",
      qty_po: 5,
      qty_received: 5,
      unit: "SET",
      receipt_date: new Date().toISOString().split("T")[0],
    },
  ]);

  const [requirements, setRequirements] = useState<RequirementDoc[]>([
    { id: "req-1", name: "Surat Jalan (Delivery Order) Asli Bertanda Tangan & Cap Vendor", checked: true },
    { id: "req-2", name: "Packing List Rincian Muatan Koli / Kotak", checked: true },
    { id: "req-3", name: "Certificate of Compliance / Factory Test Certificate", checked: true },
    { id: "req-4", name: "Surat Jaminan Garansi Resmi Pabrik", checked: true },
    { id: "req-5", name: "Manual Book / Instruksi Pemakaian & Penyimpanan", checked: false },
    { id: "req-6", name: "MSDS (Material Safety Data Sheet) untuk Material Kimia/Pelumas", checked: false },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [iRes, pRes, uRes] = await Promise.all([
        gudangSubmoduleService.getInspections(search).catch(() => ({ success: true, data: [] })),
        poService.getAllPO({ limit: 50 }).catch(() => ({ success: true, data: [] })),
        masterService.getUsers({ limit: 50 }).catch(() => ({ success: true, data: [] })),
      ]);
      if (iRes?.success) setInspections(iRes.data || []);
      if (pRes?.success) setPos(pRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat data pemeriksaan penerimaan barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({
      form_number: `INSP-RCV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      inspection_date: new Date().toISOString().split("T")[0],
      po_id: "",
      po_number: "",
      po_title: "",
      vendor_name: "",
      delivery_note_number: "",
      is_condition_good: true,
      package_box_count: 5,
      uploaded_file_name: "",
      status: "DRAFT",
      notes: "Barang diterima di Gudang Sentral UP Sembalang, kondisi packing kayu dan kardus utuh.",
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

    // If PO has items, populate them
    if (p.items && p.items.length > 0) {
      setItems(
        p.items.map((item, idx) => ({
          id: `item-${idx}`,
          item_name: item.item_name || item.name || `Material Item ${idx + 1}`,
          qty_po: Number(item.quantity || 10),
          qty_received: Number(item.quantity || 10),
          unit: item.unit || "PCS",
          receipt_date: new Date().toISOString().split("T")[0],
        }))
      );
    }

    setPoSelectOpen(false);
    toast.success(`PO ${p.po_number} dipilih`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, uploaded_file_name: res.fileName }));
    }
  };

  const toggleRequirement = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r))
    );
  };

  const handleItemQtyChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty_received: qty } : item))
    );
  };

  const totalQtyReceived = items.reduce((acc, curr) => acc + (Number(curr.qty_received) || 0), 0);

  const handleSubmit = async (actionType: "DRAFT" | "POSTED") => {
    const validation = validateForm([
      { field: "po_id", label: "Rujukan Purchase Order", value: form.po_id, required: true },
      { field: "inspection_date", label: "Tanggal Form Pemeriksaan", value: form.inspection_date, required: true, type: "date" },
      { field: "package_box_count", label: "Jumlah Dos/Koli Packing", value: form.package_box_count, required: true, type: "number", min: 1 },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await gudangSubmoduleService.createInspection({
        receipt_id: form.po_id,
        inspector_user_id: users[0]?.id || "default",
        inspection_date: form.inspection_date,
        physical_condition: form.is_condition_good ? "BAIK" : "RUSAK",
        quantity_passed: totalQtyReceived,
        quantity_rejected: 0,
        status: actionType === "POSTED" ? "PASSED" : "DRAFT",
        notes: `${form.notes} [Koli: ${form.package_box_count} dos] [File: ${form.uploaded_file_name || "None"}]`,
      });
      if (res?.success) {
        toast.success(
          actionType === "POSTED"
            ? "Pemeriksaan Penerimaan Barang berhasil diposting"
            : "Pemeriksaan Penerimaan Barang berhasil disimpan sebagai Draft"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
            <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            Pemeriksaan Penerimaan Barang (Bab 4.9.2)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pemeriksaan fisik barang datang, kelengkapan berkas surat jalan vendor, dan jumlah koli/dos di Gudang Sembalang
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> [Add] Pemeriksaan Penerimaan
        </Button>
      </div>

      {/* Tabel List */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Pemeriksaan Penerimaan Barang (Bab 4.9.2.1)</CardTitle>
              <CardDescription className="text-xs">
                Data histori pemeriksaan berkas penerimaan barang logistik pembangkit
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="h-9 px-3 text-xs">
                [Find]
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Pemeriksaan</th>
                  <th className="py-3 px-4">Tgl Periksa</th>
                  <th className="py-3 px-4">Kondisi Fisik</th>
                  <th className="py-3 px-4 text-center">Jumlah Lolos</th>
                  <th className="py-3 px-4 text-center">Jumlah Ditolak</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat pemeriksaan penerimaan barang...
                    </td>
                  </tr>
                ) : inspections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada catatan pemeriksaan penerimaan. Klik [Add] untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  inspections.map((i) => (
                    <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        INSP-{i.id?.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{i.inspection_date?.split("T")[0]}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={i.physical_condition === "BAIK" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {i.physical_condition}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {i.quantity_passed}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-red-500">
                        {i.quantity_rejected}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {i.status}
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

      {/* MODAL FORM PEMERIKSAAN PENERIMAAN BARANG (BAB 4.9.2.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Building2 className="w-3.5 h-3.5" /> PT PLN Nusantara Power UP Sembalang
              </div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Boxes className="w-5 h-5 text-primary" />
                Form Pemeriksaan Penerimaan Barang (Bab 4.9.2.2)
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dikerjakan oleh Staff Gudang untuk memverifikasi kedatangan fisik barang & checklist dokumen PO
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-4">
            {/* Bagian Informasi Form */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Form Pemeriksaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Nomor Form <span className="text-xs text-muted-foreground">(Otomatis Sistem)</span>
                  </Label>
                  <Input
                    value={form.form_number}
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
                    value={form.inspection_date}
                    onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
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

              {form.po_title && (
                <div className="p-2.5 rounded bg-background border text-xs grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Judul Pengadaan:</span>{" "}
                    <span className="font-semibold text-foreground">{form.po_title}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor / Supplier:</span>{" "}
                    <span className="font-semibold text-foreground">{form.vendor_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Kondisi Fisik & Packing */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Kondisi Fisik & Kemasan Pembungkus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="cond-bagus"
                    checked={form.is_condition_good}
                    onChange={(e) => setForm({ ...form, is_condition_good: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor="cond-bagus" className="text-xs font-bold text-foreground cursor-pointer">
                    Centang [Bagus] jika barang diterima dalam kondisi baik
                  </Label>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Jumlah Dos / Koli Packing <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.package_box_count}
                    onChange={(e) => setForm({ ...form, package_box_count: Number(e.target.value) })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Total Qty Barang Diterima <span className="text-xs text-muted-foreground">(Akumulasi Detail)</span>
                  </Label>
                  <Input
                    value={totalQtyReceived}
                    readOnly
                    className="mt-1.5 text-xs h-9 font-bold bg-muted text-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Detail Barang */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-primary" />
                  Detail Barang Diterima
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {items.length} Item Material Terdaftar
                </span>
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Nama Barang / Deskripsi</th>
                      <th className="py-2.5 px-3 text-center">Qty Kontrak PO</th>
                      <th className="py-2.5 px-3 text-center">Qty Diterima</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3">Tanggal Penerimaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{item.item_name}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.qty_po}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Input
                            type="number"
                            min="0"
                            value={item.qty_received}
                            onChange={(e) => handleItemQtyChange(item.id, Number(e.target.value))}
                            className="w-20 mx-auto text-xs h-8 text-center font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">{item.unit}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.receipt_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail Persyaratan Dokumen Kelengkapan PO */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Detail Persyaratan Kelengkapan Dokumen Sesuai PO
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Centang setiap dokumen yang diserahkan oleh kurir / ekspedisi / vendor saat mengantarkan barang ke gudang
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => toggleRequirement(req.id)}
                    className="flex items-center gap-2.5 p-2 rounded border bg-background hover:bg-muted/40 cursor-pointer transition-colors text-xs"
                  >
                    {req.checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={req.checked ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {req.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Berkas Dokumen */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/60 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload Dokumen Berkas Penerimaan / Surat Jalan
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
                  onClick={() => handleSubmit("POSTED")}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> [Post]
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

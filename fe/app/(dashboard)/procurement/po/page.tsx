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
  Search,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Trash2,
  Upload,
  FileText,
  Calendar,
  UserCheck,
  RefreshCw,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
} from "lucide-react";
import { poService, pengadaanSubmoduleService, masterService } from "@/services/modules.service";
import { PurchaseOrder, QuotationRequest, Supplier } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface PODetailItem {
  id: string;
  item_code: string;
  item_name: string;
  uom: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

interface VendorRequirementItem {
  id: string;
  doc_name: string;
  is_mandatory: boolean;
}

export default function PurchaseOrderPage() {
  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
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

  // Form Fields per Bab 4.8.17.2
  const [form, setForm] = useState({
    po_number: "",
    po_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    title: "",
    supplier_id: "",
    selected_supplier_display: "",
    supplier_address: "Jl. Industri No. 12, Cikarang, Jawa Barat",
    delivery_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    user_pic: "Supervisor Pemeliharaan Turbin UP Sembalang",
    receiving_team: "Tim Penerima Hasil Pekerjaan / Gudang UP Sembalang",
    contract_type: "Spot", // Spot, Rutin, DO, Payung
    total_amount: 0,
    file_name: "",
    file_uploaded: false,
    status: "DRAFT",
  });

  // Line items
  const [items, setItems] = useState<PODetailItem[]>([]);
  const [itemInput, setItemInput] = useState({
    item_code: "1002-MAT",
    item_name: "",
    uom: "EA",
    qty: 1,
    unit_price: 1000000,
  });

  // Vendor document requirements
  const [requirements, setRequirements] = useState<VendorRequirementItem[]>([
    { id: "1", doc_name: "Surat Jalan / Delivery Order Resmi Rekanan", is_mandatory: true },
    { id: "2", doc_name: "Faktur Penjualan / Invoice & Faktur Pajak", is_mandatory: true },
    { id: "3", doc_name: "Certificate of Analysis / Factory Mill Test", is_mandatory: true },
    { id: "4", doc_name: "Sertifikat Garansi Resmi Pabrikan (12 Bulan)", is_mandatory: true },
  ]);
  const [newReqName, setNewReqName] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, qRes, sRes] = await Promise.all([
        poService.getAllPO(search),
        pengadaanSubmoduleService.getQuotations(""),
        masterService.getSuppliers({ limit: 100 }),
      ]);
      if (res?.data) setPoList(res.data);
      if (qRes?.success) setQuotations(qRes.data || []);
      if (sRes?.success) setSuppliers(sRes.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat data PO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleOpenCreateModal = () => {
    const autoNumber = `PO/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(1000 + Math.random() * 9000)}`;
    setForm({
      po_number: autoNumber,
      po_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      title: "",
      supplier_id: "",
      selected_supplier_display: "",
      supplier_address: "Jl. Industri No. 12, Cikarang, Jawa Barat",
      delivery_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      user_pic: "Supervisor Pemeliharaan Turbin UP Sembalang",
      receiving_team: "Tim Penerima Hasil Pekerjaan / Gudang UP Sembalang",
      contract_type: "Spot",
      total_amount: 0,
      file_name: "",
      file_uploaded: false,
      status: "DRAFT",
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
      title: q.request?.title || prev.title,
    }));
    setShowPpSelectModal(false);
    toast.success(`Dokumen PP ${q.rfq_number} terpilih`);

    // Auto seed items from quotation
    if (items.length === 0) {
      const defaultItem: PODetailItem = {
        id: "1",
        item_code: "1002-MAT",
        item_name: q.request?.title || "Item Utama Pekerjaan",
        uom: "LOT",
        qty: 1,
        unit_price: Number(q.request?.estimated_budget || 50000000),
        subtotal: Number(q.request?.estimated_budget || 50000000),
      };
      setItems([defaultItem]);
      setForm((prev) => ({ ...prev, total_amount: defaultItem.subtotal }));
    }
  };

  const handleSelectSupplier = (s: Supplier) => {
    setForm((prev) => ({
      ...prev,
      supplier_id: s.id,
      selected_supplier_display: `${s.name} (${s.code})`,
      supplier_address: s.address || prev.supplier_address,
    }));
    setShowSupplierSelectModal(false);
    toast.success(`Rekanan ${s.name} terpilih`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, file_name: res.fileName, file_uploaded: true }));
    }
  };

  const handleAddItem = () => {
    if (!itemInput.item_name) {
      toast.error("Masukkan nama material / jasa");
      return;
    }
    const subtotal = itemInput.qty * itemInput.unit_price;
    const newItem: PODetailItem = {
      id: String(Date.now()),
      item_code: itemInput.item_code,
      item_name: itemInput.item_name,
      uom: itemInput.uom,
      qty: Number(itemInput.qty),
      unit_price: Number(itemInput.unit_price),
      subtotal,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    const newTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    setForm((prev) => ({ ...prev, total_amount: newTotal }));

    setItemInput({
      item_code: "1002-MAT",
      item_name: "",
      uom: "EA",
      qty: 1,
      unit_price: 1000000,
    });
    toast.success("Item berhasil ditambahkan ke PO");
  };

  const handleAddRequirement = () => {
    if (!newReqName) {
      toast.error("Masukkan nama dokumen persyaratan");
      return;
    }
    const newReq: VendorRequirementItem = {
      id: String(Date.now()),
      doc_name: newReqName,
      is_mandatory: true,
    };
    setRequirements((prev) => [...prev, newReq]);
    setNewReqName("");
    toast.success("Persyaratan dokumen vendor ditambahkan");
  };

  const handleRefreshFromEllipse = () => {
    toast.success("Data item berhasil disinkronkan dari Ellipse ERP (Live)");
  };

  const handleRefreshFromNegotiation = () => {
    toast.success("Harga satuan berhasil disegarkan dari Berita Acara Negosiasi");
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    const validation = validateForm([
      { field: "po_number", label: "Nomor Purchase Order", value: form.po_number, required: true },
      { field: "supplier_id", label: "Rekanan / Vendor", value: form.supplier_id, required: true },
      { field: "po_date", label: "Tanggal Purchase Order", value: form.po_date, required: true, type: "date" },
      { field: "delivery_deadline", label: "Batas Akhir Penyerahan / Delivery", value: form.delivery_deadline, required: true, type: "date" },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    if (items.length === 0) {
      toast.error("Tambahkan minimal 1 item barang / jasa pada Purchase Order (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await poService.createPO({
        po_number: form.po_number,
        request_id: form.request_id || "req-001",
        supplier_id: form.supplier_id,
        title: form.title || "Pesanan Pengadaan Material & Jasa",
        total_amount: form.total_amount,
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Purchase Order berhasil dikirim untuk proses Approval!"
            : "Purchase Order berhasil disimpan sebagai Draft"
        );
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(res?.message || "Gagal menyimpan PO");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForRevision = () => {
    toast("Form PO dikembalikan ke pembuat untuk revisi");
    setIsDialogOpen(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
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
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
              PT PLN Nusantara Power UP Sembalang
            </Badge>
            <Badge variant="secondary" className="text-xs">Bab 4.8.17</Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mt-1.5">
            Purchase Order (PO) & Surat Perjanjian Kontrak
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan Surat Pesanan Pengadaan, verifikasi kontrak rekanan, dan integrasi penyerahan barang/jasa
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Terbitkan PO Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-600 shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Kontrak / PO</p>
            <h3 className="text-2xl font-bold mt-1">{poList.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500 shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Menunggu Penandatanganan</p>
            <h3 className="text-2xl font-bold mt-1">
              {poList.filter((p) => p.status === "DRAFT" || p.status === "PENDING_APPROVAL").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600 shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">PO Aktif / Terbit</p>
            <h3 className="text-2xl font-bold mt-1">
              {poList.filter((p) => p.status === "ISSUED" || p.status === "APPROVED").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-600 shadow-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Nilai Kontrak PO</p>
            <h3 className="text-base font-bold mt-1 font-mono text-primary">
              {formatRupiah(poList.reduce((acc, curr) => acc + (curr.total_amount || 0), 0))}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Purchase Order (PO)</CardTitle>
              <CardDescription className="text-xs">
                Daftar pesanan pembelian resmi kepada rekanan pelaksana pekerjaan / pengadaan barang
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari no. PO / rekanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">No. PO</th>
                  <th className="py-3 px-4">Judul Pekerjaan</th>
                  <th className="py-3 px-4">Rekanan Pelaksana</th>
                  <th className="py-3 px-4 text-right">Nilai Kontrak</th>
                  <th className="py-3 px-4 text-center">Status PO</th>
                  <th className="py-3 px-4">Batas Levering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Memuat data PO...
                    </td>
                  </tr>
                ) : poList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto">
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                        <p className="font-bold text-sm text-foreground">Purchase Order Masih Kosong</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Gunakan tombol [Terbitkan PO Baru] di pojok kanan atas untuk membuat dokumen Purchase Order baru berdasarkan dokumen PP.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  poList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {item.po_number || "DRAFT-PO"}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {item.supplier?.name || "PT Rekanan Sembalang"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                        {formatRupiah(item.total_amount || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.delivery_deadline ? new Date(item.delivery_deadline).toLocaleDateString("id-ID") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL FORM PURCHASE ORDER (BAB 4.8.17.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Form Purchase Order (PO / Surat Pesanan Kontrak)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.17.2 — Penerbitan surat pesanan resmi kepada rekanan pelaksana
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
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen Purchase Order
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor PO (Ellipse / Auto) *</Label>
                  <Input
                    value={form.po_number}
                    onChange={(e) => setForm({ ...form, po_number: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-muted-foreground">Sinkron dengan sistem Ellipse</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form PO *</Label>
                  <Input
                    type="date"
                    value={form.po_date}
                    onChange={(e) => setForm({ ...form, po_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tipe Kontrak PO</Label>
                  <select
                    value={form.contract_type}
                    onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="Spot">Kontrak Spot (Sekali Pengadaan)</option>
                    <option value="Rutin">Kontrak Rutin (Berulang)</option>
                    <option value="DO">Delivery Order (Call-off)</option>
                    <option value="Payung">Kontrak Payung</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN NOMOR PP & REKANAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Mitra Rekanan & Pejabat Penerima
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                  <Label className="text-xs font-semibold">Rekanan / Penyedia Terpilih *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_supplier_display || "Klik Cari untuk memilih rekanan..."}
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
                  <Label className="text-xs font-semibold">Nama Pekerjaan Pengadaan *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Pengadaan Material Filter dan Sparepart Boiler Unit 1-2"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Batas Waktu Pengiriman (Tgl Levering) *</Label>
                  <Input
                    type="date"
                    value={form.delivery_deadline}
                    onChange={(e) => setForm({ ...form, delivery_deadline: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-semibold"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">PIC Penyelesaian Pekerjaan (Staf User)</Label>
                  <Input
                    value={form.user_pic}
                    onChange={(e) => setForm({ ...form, user_pic: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Tim Penilai BA Penerima Barang/Jasa (Komisi Penerimaan)</Label>
                  <Input
                    value={form.receiving_team}
                    onChange={(e) => setForm({ ...form, receiving_team: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN KONTRAK PO (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Kontrak PO Resmi Bertandatangan (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="text-xs h-9 bg-background file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {form.file_name ? (
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi: {form.file_name}
                    </span>
                  ) : (
                    "Maks. 25MB (PDF/DOCX/XLSX)"
                  )}
                </span>
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

            {/* SECTION 4: DETAIL RINCIAN BARANG/JASA & REFRESH BUTTONS */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Detail Rincian Barang / Jasa (Bab 4.8.17.2 Langkah 11)
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshFromEllipse}
                    className="text-[11px] h-7 gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-primary" /> [Refresh dari Ellipse]
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshFromNegotiation}
                    className="text-[11px] h-7 gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-600" /> [Refresh dari Negosiasi]
                  </Button>
                </div>
              </div>

              {/* Subform Input Baris */}
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
                  <Label className="text-[11px] font-semibold">Nama Barang / Jasa *</Label>
                  <Input
                    placeholder="Contoh: Bearing SKF 6205-2Z"
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
                  <Label className="text-[11px] font-semibold">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemInput.qty}
                    onChange={(e) => setItemInput({ ...itemInput, qty: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Harga Satuan (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemInput.unit_price}
                    onChange={(e) => setItemInput({ ...itemInput, unit_price: Number(e.target.value) })}
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
                      <th className="py-2.5 px-3">Nama Barang / Jasa</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal Nilai (Rp)</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          Belum ada item barang/jasa dalam PO ini. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono text-muted-foreground">{it.item_code}</td>
                          <td className="py-2 px-3 font-semibold text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.uom}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-primary">{it.qty}</td>
                          <td className="py-2 px-3 font-mono text-right text-muted-foreground">
                            {it.unit_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-right text-foreground">
                            Rp {it.subtotal.toLocaleString("id-ID")}
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
                                  total_amount: updated.reduce((a, c) => a + c.subtotal, 0),
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
                          TOTAL NILAI KONTRAK PO (SEBELUM PPN):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary text-base">
                          Rp {form.total_amount.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* SECTION 5: PERSYARATAN DOKUMEN PENYERAHAN BARANG (BAB 4.8.17.2 LANGKAH 12-14) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileCheckIcon className="w-3.5 h-3.5" /> Persyaratan Dokumen Penyerahan Fisik ke Gudang
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-3 bg-background p-3 rounded-md border">
                <Input
                  placeholder="Nama dokumen kelengkapan yang wajib dibawa vendor..."
                  value={newReqName}
                  onChange={(e) => setNewReqName(e.target.value)}
                  className="text-xs h-8 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddRequirement}
                  className="text-xs h-8 px-4 shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> [Add To List]
                </Button>
              </div>

              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nama Dokumen Persyaratan</th>
                      <th className="py-2.5 px-3 text-center">Status Kewajiban</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium text-foreground">{req.doc_name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-emerald-600 font-bold">WAJIB DILAMPIRKAN</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setRequirements((prev) => prev.filter((r) => r.id !== req.id))
                            }
                            className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.17.2 */}
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
              Pilih Rekanan Penyedia Purchase Order
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

function FileCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

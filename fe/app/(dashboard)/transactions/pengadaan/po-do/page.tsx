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
  ShoppingCart,
  Search,
  Plus,
  Trash2,
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
import { PODeliveryOrder, PurchaseOrder, UmbrellaContract } from "@/types";
import toast from "react-hot-toast";

interface PODOItem {
  id: string;
  item_name: string;
  uom: string;
  unit_price: number;
  call_off_qty: number;
  subtotal: number;
}

interface DocReqItem {
  id: string;
  doc_name: string;
  mandatory: boolean;
}

export default function PODOPage() {
  const [deliveryOrders, setDeliveryOrders] = useState<PODeliveryOrder[]>([]);
  const [contracts, setContracts] = useState<UmbrellaContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for Umbrella Contract
  const [showContractSelectModal, setShowContractSelectModal] = useState(false);
  const [contractFilter, setContractFilter] = useState("");

  // Form Fields per Bab 4.8.19.2
  const [form, setForm] = useState({
    do_number: "",
    do_date: new Date().toISOString().split("T")[0],
    po_id: "",
    contract_id: "",
    selected_contract_display: "",
    title: "",
    vendor_name: "",
    remaining_ceiling: 0,
    delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    receiving_evaluator_team: "Komisi Penerimaan Barang & Jasa UP Sembalang",
    total_do_amount: 0,
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Call-off line items
  const [items, setItems] = useState<PODOItem[]>([]);
  const [itemInput, setItemInput] = useState({
    item_name: "Bahan Kimia NaOH 48%",
    uom: "KG",
    unit_price: 15000,
    call_off_qty: 500,
  });

  // Checklist dokumen fisik
  const [docReqs, setDocReqs] = useState<DocReqItem[]>([
    { id: "1", doc_name: "Surat Jalan / Bukti Pengiriman DO Asli", mandatory: true },
    { id: "2", doc_name: "Sertifikat Analisis (COA) / Uji Mutu", mandatory: true },
    { id: "3", doc_name: "Faktur Penjualan / Invoice Pajak", mandatory: true },
  ]);
  const [newReqName, setNewReqName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doRes, cRes] = await Promise.all([
        pengadaanSubmoduleService.getDeliveryOrders(search),
        pengadaanSubmoduleService.getUmbrellaContracts(""),
      ]);
      if (doRes?.success) setDeliveryOrders(doRes.data || []);
      if (cRes?.success) setContracts(cRes.data || []);
    } catch {
      toast.error("Gagal memuat PO Delivery Order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `PO-DO/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      do_number: autoNumber,
      do_date: new Date().toISOString().split("T")[0],
      po_id: "",
      contract_id: "",
      selected_contract_display: "",
      title: "",
      vendor_name: "",
      remaining_ceiling: 0,
      delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      receiving_evaluator_team: "Komisi Penerimaan Barang & Jasa UP Sembalang",
      total_do_amount: 0,
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setItems([]);
    setIsDialogOpen(true);
  };

  const handleSelectContract = (c: UmbrellaContract) => {
    setForm((prev) => ({
      ...prev,
      contract_id: c.id,
      po_id: c.id,
      selected_contract_display: `${c.contract_number} - ${c.title}`,
      title: `Delivery Order ${c.title}`,
      vendor_name: c.vendor?.name || "PT Mitra Rekanan",
      remaining_ceiling: Number(c.remaining_amount || c.total_ceiling_amount || 0),
    }));
    setShowContractSelectModal(false);
    toast.success(`Kontrak Payung ${c.contract_number} terpilih`);
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih berkas dokumen PO Delivery Order!");
      return;
    }
    setForm((prev) => ({ ...prev, file_uploaded: true }));
    toast.success("Dokumen PO DO berhasil diunggah!");
  };

  const handleAddItem = () => {
    if (!itemInput.item_name || itemInput.call_off_qty <= 0) {
      toast.error("Masukkan item dan kuantitas call-off valid");
      return;
    }
    const subtotal = itemInput.call_off_qty * itemInput.unit_price;
    const newItem: PODOItem = {
      id: String(Date.now()),
      item_name: itemInput.item_name,
      uom: itemInput.uom,
      unit_price: Number(itemInput.unit_price),
      call_off_qty: Number(itemInput.call_off_qty),
      subtotal,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    const newTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    setForm((prev) => ({ ...prev, total_do_amount: newTotal }));

    setItemInput({
      item_name: "Bahan Kimia NaOH 48%",
      uom: "KG",
      unit_price: 15000,
      call_off_qty: 500,
    });
    toast.success("Item call-off DO berhasil ditambahkan");
  };

  const handleAddReq = () => {
    if (!newReqName) {
      toast.error("Masukkan nama dokumen persyaratan");
      return;
    }
    setDocReqs((prev) => [
      ...prev,
      { id: String(Date.now()), doc_name: newReqName, mandatory: true },
    ]);
    setNewReqName("");
    toast.success("Persyaratan dokumen penyerahan ditambahkan");
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    if (!form.contract_id || items.length === 0) {
      toast.error("Silakan pilih Kontrak Payung asal dan minimal 1 item call-off (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await pengadaanSubmoduleService.createDeliveryOrder({
        po_id: form.po_id,
        do_number: form.do_number,
        do_date: form.do_date,
        ordered_quantity: items.reduce((acc, curr) => acc + curr.call_off_qty, 0),
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "PO Delivery Order berhasil dikirim untuk Approval!"
            : "PO Delivery Order berhasil disimpan sebagai Draft"
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
    toast("Form dikembalikan ke pembuat PO DO untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredContracts = contracts.filter(
    (c) =>
      c.contract_number.toLowerCase().includes(contractFilter.toLowerCase()) ||
      c.title.toLowerCase().includes(contractFilter.toLowerCase())
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
            <Badge variant="secondary" className="text-xs">Bab 4.8.19</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <ShoppingCart className="w-7 h-7 text-primary" />
            PO Delivery Order (Call-off Kontrak Payung)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan surat pesanan bertahap (Call-off Order) pemanfaatan kuota material dari Kontrak Payung berjalan
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Terbitkan PO DO
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar PO Delivery Order</CardTitle>
              <CardDescription className="text-xs">
                Monitoring pelaksanaan pengiriman barang bertahap per Surat Pesanan DO
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor DO..."
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
                  <th className="py-3 px-4">Nomor PO DO</th>
                  <th className="py-3 px-4">Rujukan Kontrak Payung</th>
                  <th className="py-3 px-4 text-center">Volume Total DO</th>
                  <th className="py-3 px-4">Tgl Terbit DO</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data PO DO...
                    </td>
                  </tr>
                ) : deliveryOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada pesanan Delivery Order yang diterbitkan.
                    </td>
                  </tr>
                ) : (
                  deliveryOrders.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{d.do_number}</td>
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {d.po?.po_number || "KP-PLN-001"}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                        {d.ordered_quantity} Unit
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{d.do_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {d.status || "ISSUED"}
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

      {/* MODAL FORM PO DELIVERY ORDER (BAB 4.8.19.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  Form PO Delivery Order (Call-off Order)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.19.2 — Penerbitan surat pesanan pengiriman dari kuota Kontrak Payung
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
                <FileText className="w-3.5 h-3.5" /> Identitas Surat Pesanan DO
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form PO DO *</Label>
                  <Input
                    value={form.do_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form PO DO *</Label>
                  <Input
                    type="date"
                    value={form.do_date}
                    onChange={(e) => setForm({ ...form, do_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN KONTRAK PAYUNG & KETENTUAN LEVERING */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Kontrak Payung Acuan & Jadwal Penyerahan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Usulan / Kontrak Payung yang Memiliki Tipe DO *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_contract_display || "Klik Cari untuk memilih Kontrak Payung..."}
                      readOnly
                      placeholder="Pilih Kontrak Payung..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowContractSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowContractSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tanggal Batas Levering DO *</Label>
                  <Input
                    type="date"
                    value={form.delivery_date}
                    onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                    className="mt-1.5 text-xs h-9 font-semibold"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tim Penilai Kinerja Supplier (BA Penerima)</Label>
                  <Input
                    value={form.receiving_evaluator_team}
                    onChange={(e) =>
                      setForm({ ...form, receiving_evaluator_team: e.target.value })
                    }
                    className="mt-1.5 text-xs h-9"
                  />
                </div>

                {form.remaining_ceiling > 0 && (
                  <div className="md:col-span-2 text-xs text-muted-foreground">
                    Mitra Penyedia: <span className="font-semibold text-foreground">{form.vendor_name}</span> | Sisa Pagu Plafon Tersedia: <span className="font-mono font-bold text-emerald-600">Rp {form.remaining_ceiling.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN PO DO (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen PO DO (Maks. 25MB)
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

            {/* SECTION 4: DETAIL BARANG CALL-OFF DO */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Rincian Item Barang Call-Off DO
              </h4>

              {/* Subform Item */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nama Komoditas Barang *</Label>
                  <Input
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
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Volume Call-off DO *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemInput.call_off_qty}
                    onChange={(e) =>
                      setItemInput({ ...itemInput, call_off_qty: Number(e.target.value) })
                    }
                    className="text-xs h-8 mt-1 font-bold text-primary"
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
                      <th className="py-2.5 px-3">Komoditas Barang</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Harga Kontrak (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Volume Call-off</th>
                      <th className="py-2.5 px-3 text-right">Subtotal DO (Rp)</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-muted-foreground">
                          Belum ada item call-off yang ditambahkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-semibold text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.uom}</td>
                          <td className="py-2 px-3 font-mono text-right text-muted-foreground">
                            {it.unit_price.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-primary">
                            {it.call_off_qty}
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
                                  total_do_amount: updated.reduce((a, c) => a + c.subtotal, 0),
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
                        <td colSpan={4} className="py-2.5 px-3 text-right font-bold text-sm">
                          TOTAL NILAI PO DELIVERY ORDER:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary text-base">
                          Rp {form.total_do_amount.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* SECTION 5: PERSYARATAN PENYERAHAN BARANG (BAB 4.8.19.2 LANGKAH 11-13) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Persyaratan Penyerahan Dokumen Pengiriman Fisik
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-3 bg-background p-3 rounded-md border">
                <Input
                  placeholder="Nama dokumen kelengkapan fisik..."
                  value={newReqName}
                  onChange={(e) => setNewReqName(e.target.value)}
                  className="text-xs h-8 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddReq}
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
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {docReqs.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium text-foreground">{d.doc_name}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-emerald-600 font-bold">WAJIB</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocReqs((prev) => prev.filter((r) => r.id !== d.id))}
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

            {/* ACTION BUTTONS PER BAB 4.8.19.2 */}
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

      {/* POP-UP MODAL CARI KONTRAK PAYUNG */}
      <Dialog open={showContractSelectModal} onOpenChange={setShowContractSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Kontrak Payung Rujukan (Tipe DO)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor kontrak atau judul..."
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor Kontrak</th>
                    <th className="py-2.5 px-3">Judul Kontrak Payung</th>
                    <th className="py-2.5 px-3">Rekanan</th>
                    <th className="py-2.5 px-3 text-right">Sisa Pagu Tersedia</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredContracts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Tidak ada kontrak payung yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{c.contract_number}</td>
                        <td className="py-2.5 px-3 font-medium">{c.title}</td>
                        <td className="py-2.5 px-3 font-semibold">{c.vendor?.name || "-"}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold text-emerald-600">
                          Rp {Number(c.remaining_amount || c.total_ceiling_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectContract(c)}
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

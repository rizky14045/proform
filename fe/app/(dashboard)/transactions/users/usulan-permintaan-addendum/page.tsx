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
  Trash2,
  Upload,
  FileText,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { usersSubmoduleService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { RequestAddendum, ProcurementRequest } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface AddendumItem {
  id: string;
  item_name: string;
  uom: string;
  qty_old: number;
  qty_new: number;
  unit_price: number;
  subtotal: number;
}

export default function UsulanAddendumUserPage() {
  const [addendums, setAddendums] = useState<RequestAddendum[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for Request
  const [showRequestSelectModal, setShowRequestSelectModal] = useState(false);
  const [requestFilter, setRequestFilter] = useState("");

  // Form Fields per Bab 4.6.4.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    item_type: "SC", // 'SC' (Barang) or 'PR' (Jasa)
    original_request_id: "",
    selected_request_display: "",
    request_title: "",
    addendum_sequence: 1,
    reason: "",
    scope_change_description: "",
    revised_estimated_budget: 0,
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Detail Items Table
  const [items, setItems] = useState<AddendumItem[]>([]);
  const [itemInput, setItemInput] = useState({
    item_name: "",
    uom: "EA",
    qty_old: 1,
    qty_new: 1,
    unit_price: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, rRes] = await Promise.all([
        usersSubmoduleService.getAddendums(search),
        procurementService.getAll({ limit: 50 }),
      ]);
      if (aRes?.success) setAddendums(aRes.data || []);
      if (rRes?.success) setRequests(rRes.data || []);
    } catch {
      toast.error("Gagal memuat usulan addendum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `ADD-UP/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      item_type: "SC",
      original_request_id: "",
      selected_request_display: "",
      request_title: "",
      addendum_sequence: 1,
      reason: "",
      scope_change_description: "",
      revised_estimated_budget: 0,
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setItems([]);
    setItemInput({
      item_name: "",
      uom: "EA",
      qty_old: 1,
      qty_new: 1,
      unit_price: 0,
    });
    setIsDialogOpen(true);
  };

  const handleSelectRequest = (r: ProcurementRequest) => {
    setForm((prev) => ({
      ...prev,
      original_request_id: r.id,
      selected_request_display: `${r.request_number} - ${r.title}`,
      request_title: r.title,
      revised_estimated_budget: Number(r.estimated_budget) || 0,
    }));
    setShowRequestSelectModal(false);
    toast.success(`Paket ${r.request_number} terpilih`);
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
      toast.error("Masukkan nama barang / jasa");
      return;
    }
    const subtotal = itemInput.qty_new * itemInput.unit_price;
    const newItem: AddendumItem = {
      id: String(Date.now()),
      item_name: itemInput.item_name,
      uom: itemInput.uom,
      qty_old: Number(itemInput.qty_old),
      qty_new: Number(itemInput.qty_new),
      unit_price: Number(itemInput.unit_price),
      subtotal,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    const newTotal = newItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    setForm((prev) => ({ ...prev, revised_estimated_budget: newTotal }));

    setItemInput({
      item_name: "",
      uom: "EA",
      qty_old: 1,
      qty_new: 1,
      unit_price: 0,
    });
    toast.success("Item berhasil ditambahkan ke daftar");
  };

  const handleRemoveItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    const newTotal = updated.reduce((acc, curr) => acc + curr.subtotal, 0);
    setForm((prev) => ({ ...prev, revised_estimated_budget: newTotal }));
  };

  const handleSubmit = async (actionType: "SAVE" | "SEND_FOR_APPROVAL") => {
    const validation = validateForm([
      { field: "original_request_id", label: "Pilihan Usulan Permintaan Asal", value: form.original_request_id, required: true },
      { field: "form_number", label: "Nomor Dokumen Usulan Addendum", value: form.form_number, required: true, minLength: 3 },
      { field: "form_date", label: "Tanggal Form Addendum", value: form.form_date, required: true, type: "date" },
      { field: "reason", label: "Alasan Perubahan / Addendum", value: form.reason, required: true, minLength: 5 },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await usersSubmoduleService.createAddendum({
        original_request_id: form.original_request_id,
        addendum_number: form.form_number,
        addendum_sequence: Number(form.addendum_sequence),
        reason: form.reason,
        scope_change_description: form.scope_change_description,
        revised_estimated_budget: Number(form.revised_estimated_budget),
        status: actionType === "SEND_FOR_APPROVAL" ? "PENDING_APPROVAL" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "SEND_FOR_APPROVAL"
            ? "Usulan Addendum berhasil dikirim untuk Approval!"
            : "Usulan Addendum berhasil disimpan sebagai Draft"
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
    toast("Form dikembalikan ke pembuat usulan untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.request_number.toLowerCase().includes(requestFilter.toLowerCase()) ||
      r.title.toLowerCase().includes(requestFilter.toLowerCase())
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
            <Badge variant="secondary" className="text-xs">Bab 4.6.4</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Usulan Permintaan Addendum
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengajuan addendum ruang lingkup (scope change), penyesuaian volume, atau perubahan anggaran usulan permintaan pengadaan
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Usulan Addendum
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Usulan Addendum Pengadaan</CardTitle>
              <CardDescription className="text-xs">
                Monitoring addendum usulan permintaan barang (SC) dan jasa (PR)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor addendum..."
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
                  <th className="py-3 px-4">No. Form / Addendum</th>
                  <th className="py-3 px-4 text-center">Addendum Ke</th>
                  <th className="py-3 px-4">Usulan PPA Rujukan</th>
                  <th className="py-3 px-4">Alasan Addendum</th>
                  <th className="py-3 px-4 text-right">Revisi Anggaran</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Memuat data usulan addendum...
                    </td>
                  </tr>
                ) : addendums.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Belum ada pengajuan usulan addendum.
                    </td>
                  </tr>
                ) : (
                  addendums.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{a.addendum_number}</td>
                      <td className="py-3 px-4 text-center font-bold">#{a.addendum_sequence}</td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {a.original_request?.request_number || "PPA-001"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-sm truncate">{a.reason}</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                        Rp {Number(a.revised_estimated_budget || 0).toLocaleString("id-ID")}
                      </td>
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

      {/* MODAL FORM USULAN PERMINTAAN ADDENDUM (BAB 4.6.4.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  Form Usulan Permintaan Addendum
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.6.4.2 — Pengajuan revisi ruang lingkup dan penyesuaian anggaran usulan permintaan
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                UP Sembalang
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {/* SECTION 1: HEADER INFORMASI POKOK & TIPE */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen & Tipe Addendum
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form Addendum *</Label>
                  <Input
                    value={form.form_number}
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

                <div>
                  <Label className="text-xs font-semibold">Tipe Permintaan (Bab 4.6.4.2 a/b) *</Label>
                  <select
                    value={form.item_type}
                    onChange={(e) => setForm({ ...form, item_type: e.target.value })}
                    className="w-full mt-1.5 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="SC">a. Tipe: Barang (SC - Stock Code)</option>
                    <option value="PR">b. Tipe: Jasa (Service atau Goods)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN USULAN PERMINTAAN */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" /> Rujukan Usulan Permintaan yang Di-Addendum
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nomor Usulan / PPA Asal *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_request_display || "Klik Cari untuk memilih usulan asal..."}
                      readOnly
                      placeholder="Pilih Usulan Permintaan..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowRequestSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRequestSelectModal(true)}
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
                  <Label className="text-xs font-semibold">Alasan Addendum Permintaan *</Label>
                  <Input
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Contoh: Penyesuaian volume material sesuai kondisi aktual"
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Uraian Perubahan Ruang Lingkup (Scope of Work)</Label>
                  <Input
                    value={form.scope_change_description}
                    onChange={(e) => setForm({ ...form, scope_change_description: e.target.value })}
                    placeholder="Deskripsi perubahan spesifikasi teknis, waktu pelaksanaan, atau volume pekerjaan"
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN PENDUKUNG (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Dokumen Pendukung KAK / Justifikasi (Maks. 25MB)
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

            {/* SECTION 4: RINCIAN PERUBAHAN ITEM (DETAIL FORM & ADD TO LIST) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Detail Perubahan Item Barang / Jasa (Bab 4.6.4.2 Langkah 11-16)
              </h4>

              {/* Input baris */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-background p-3 rounded-md border">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-semibold">Nama Barang / Jasa *</Label>
                  <Input
                    placeholder="Contoh: Gasket Flange High Temp"
                    value={itemInput.item_name}
                    onChange={(e) => setItemInput({ ...itemInput, item_name: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Satuan (UOM)</Label>
                  <Input
                    value={itemInput.uom}
                    onChange={(e) => setItemInput({ ...itemInput, uom: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Qty Awal</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemInput.qty_old}
                    onChange={(e) => setItemInput({ ...itemInput, qty_old: Number(e.target.value) })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Qty Addendum</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemInput.qty_new}
                    onChange={(e) => setItemInput({ ...itemInput, qty_new: Number(e.target.value) })}
                    className="text-xs h-8 mt-1 font-semibold"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Estimasi Harga (Rp)</Label>
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

              {/* Table of items */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nama Barang / Jasa</th>
                      <th className="py-2.5 px-3 text-center">Satuan</th>
                      <th className="py-2.5 px-3 text-center">Qty Lama</th>
                      <th className="py-2.5 px-3 text-center">Qty Baru</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Total Subtotal (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-muted-foreground">
                          Belum ada rincian item addendum yang ditambahkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono">{it.uom}</td>
                          <td className="py-2 px-3 text-center text-muted-foreground">{it.qty_old}</td>
                          <td className="py-2 px-3 text-center font-bold text-primary">{it.qty_new}</td>
                          <td className="py-2 px-3 font-mono text-right">
                            {it.unit_price.toLocaleString("id-ID")}
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
                    <tfoot className="bg-muted/30 border-t font-semibold">
                      <tr>
                        <td colSpan={5} className="py-2.5 px-3 text-right font-bold">
                          TOTAL REVISI ANGGARAN USULAN:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-primary text-sm">
                          Rp {form.revised_estimated_budget.toLocaleString("id-ID")}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.6.4.2 */}
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

      {/* POP-UP MODAL CARI USULAN PENGADAAN (BAB 4.6.4.2 LANGKAH 4) */}
      <Dialog open={showRequestSelectModal} onOpenChange={setShowRequestSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen Usulan Permintaan Asal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor atau judul paket usulan..."
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor Usulan</th>
                    <th className="py-2.5 px-3">Judul Pengadaan</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-right">Anggaran Saat Ini</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        Tidak ada usulan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{r.request_number}</td>
                        <td className="py-2.5 px-3 font-medium">{r.title}</td>
                        <td className="py-2.5 px-3">{r.contract_type || "Spot"}</td>
                        <td className="py-2.5 px-3 font-mono text-right font-semibold">
                          Rp {(r.estimated_budget || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectRequest(r)}
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

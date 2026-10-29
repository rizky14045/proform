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
import { FileText, Search, Plus, Trash2, Send, Upload, Layers, Coins, Calendar, CheckCircle2 } from "lucide-react";
import { procurementService } from "@/services/procurement.service";
import { ProcurementRequest, RequestItem } from "@/types";
import toast from "react-hot-toast";

export default function UsulanPermintaan2Page() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");

  // Form Usulan Permintaan II according to PDF Manual 4.6.3.2
  const [form, setForm] = useState({
    form_number: "00" + Math.floor(10 + Math.random() * 90) + "/UPM-II/600/UP-SMBL/" + new Date().getFullYear(),
    form_date: new Date().toISOString().split("T")[0],
    priority: "NORMAL",
    wo_number: "",
    pr_number_ellipse: "",
    prk_number: "",
    request_type: "BARANG",
    contract_type: "KONTRAK_SPOT",
    umbrella_contract_ref: "",
    description: "",
    supervisor_rendal: "Supervisor Rendal Har Pemeliharaan",
  });

  // Items table state
  const [items, setItems] = useState<RequestItem[]>([
    {
      id: "1",
      request_id: "",
      item_type: "BARANG",
      item_name: "Gasket Ring High Pressure Turbine",
      specification: "Material SS316 with Graphite filler, ANSI Class 600",
      quantity: 12,
      unit: "PCS",
      estimated_price: 1850000,
    },
  ]);

  const [newItemType, setNewItemType] = useState<"BARANG" | "JASA">("BARANG");
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemSpec, setNewItemSpec] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("PCS");
  const [newItemPrice, setNewItemPrice] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getAll({ search, limit: 50 });
      if (res?.success) {
        setRequests(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat usulan permintaan tahap 2");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      form_number: "00" + Math.floor(10 + Math.random() * 90) + "/UPM-II/600/UP-SMBL/" + new Date().getFullYear(),
      form_date: new Date().toISOString().split("T")[0],
      priority: "NORMAL",
      wo_number: "WO-2026-0922",
      pr_number_ellipse: "PR-ELIPSE-8831",
      prk_number: "PRK-2026-009",
      request_type: "BARANG",
      contract_type: "KONTRAK_SPOT",
      umbrella_contract_ref: "",
      description: "Usulan permintaan tahap II terintegrasi nomor Purchase Requisition (PR) Ellipse",
      supervisor_rendal: "Supervisor Rendal Har Pemeliharaan",
    });
    setUploadedFile("");
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemName) {
      toast.error("Isikan nama barang atau uraian jasa");
      return;
    }
    setItems([
      ...items,
      {
        id: String(Date.now()),
        request_id: "",
        item_type: newItemType,
        item_name: newItemName,
        specification: newItemSpec || newItemCode,
        quantity: newItemQty,
        unit: newItemUnit,
        estimated_price: newItemPrice,
      },
    ]);
    setNewItemName("");
    setNewItemCode("");
    setNewItemSpec("");
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalRAB = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.estimated_price) || 0),
    0
  );

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRequest(false);
  };

  const handleSendForApproval = async () => {
    await saveRequest(true);
  };

  const saveRequest = async (sendApproval: boolean) => {
    if (!form.wo_number || !form.prk_number || items.length === 0) {
      toast.error("Nomor WO, PRK, dan minimal 1 rincian item wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await procurementService.create({
        request_number: form.form_number,
        wo_number: form.wo_number,
        prk_number: form.prk_number,
        title: form.description.slice(0, 80),
        description: `${form.description} (PR Ellipse: ${form.pr_number_ellipse})`,
        structure_id: "00000000-0000-0000-0000-000000000001",
        contract_type: form.request_type as any,
        priority: form.priority as any,
        rab_amount: totalRAB,
        items,
      });
      if (res?.success) {
        toast.success(sendApproval ? "Usulan Permintaan II berhasil dikirim untuk Approval!" : "Usulan Permintaan II berhasil disimpan sebagai draft!");
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            Usulan Permintaan II (Bab 4.6.3)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Form Usulan Permintaan kedua dengan sinkronisasi nomor PR ERP Ellipse PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Usulan Permintaan II
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">List Usulan Permintaan II</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi usulan permintaan kedua yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nomor usulan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Nomor Usulan Form</th>
                  <th className="py-3 px-4">Perihal Pengadaan</th>
                  <th className="py-3 px-4">No. WO & PR Ellipse</th>
                  <th className="py-3 px-4">Total RAB</th>
                  <th className="py-3 px-4">Sifat Permintaan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Memuat data usulan permintaan...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada usulan permintaan II.</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{r.request_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{r.title}</td>
                      <td className="py-3 px-4 text-xs font-mono">
                        <div>WO: {r.wo_number || "-"}</div>
                        <div className="text-muted-foreground">PRK: {r.prk_number || "-"}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        Rp {Number(r.rab_amount || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={r.priority === "EMERGENCY" ? "bg-red-100 text-red-800 border-none" : r.priority === "URGENT" ? "bg-amber-100 text-amber-800 border-none" : "bg-blue-100 text-blue-800 border-none"}>
                          {r.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge color="secondary">{r.current_status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG FORM USULAN PERMINTAAN II (Bab 4.6.3.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              Form Usulan Permintaan II (Bab 4.6.3.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh User dan Rendal Har PT PLN Nusantara Power UP Sembalang dengan integrasi nomor PR Ellipse.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER INFORMASI PENGADAAN */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <Layers className="w-4 h-4 text-primary" />
                1. Header Dokumen & Integrasi ERP Ellipse
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.form_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
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
                  <Label className="text-xs font-semibold">Sifat Permintaan *</Label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Work Order (Ellipse) *</Label>
                  <Input
                    value={form.wo_number}
                    onChange={(e) => setForm({ ...form, wo_number: e.target.value })}
                    placeholder="e.g. WO-2026-0899"
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nomor PR dari Ellipse *</Label>
                  <Input
                    value={form.pr_number_ellipse}
                    onChange={(e) => setForm({ ...form, pr_number_ellipse: e.target.value })}
                    placeholder="e.g. PR-ELIPSE-8831"
                    className="text-xs mt-1 font-mono font-bold text-primary"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor PR hasil konversi di sistem ERP Ellipse</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Nomor PRK Anggaran *</Label>
                  <Input
                    value={form.prk_number}
                    onChange={(e) => setForm({ ...form, prk_number: e.target.value })}
                    placeholder="e.g. PRK-2026-004"
                    className="text-xs mt-1 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Tipe Permintaan *</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="request_type"
                        value="BARANG"
                        checked={form.request_type === "BARANG"}
                        onChange={() => setForm({ ...form, request_type: "BARANG" })}
                        className="text-primary"
                      />
                      Barang (SC)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="request_type"
                        value="JASA"
                        checked={form.request_type === "JASA"}
                        onChange={() => setForm({ ...form, request_type: "JASA" })}
                        className="text-primary"
                      />
                      Jasa (PR Goods/Service)
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Jenis Kontrak *</Label>
                  <select
                    value={form.contract_type}
                    onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="KONTRAK_SPOT">Kontrak Spot</option>
                    <option value="KONTRAK_PAYUNG">Kontrak Payung</option>
                    <option value="KONTRAK_RUTIN">Kontrak Rutin</option>
                    <option value="DELIVERY_ORDER">Delivery Order (DO)</option>
                  </select>
                </div>

                {form.contract_type === "DELIVERY_ORDER" && (
                  <div>
                    <Label className="text-xs font-semibold">Nomor Kontrak Payung Acuan *</Label>
                    <Input
                      value={form.umbrella_contract_ref}
                      onChange={(e) => setForm({ ...form, umbrella_contract_ref: e.target.value })}
                      placeholder="Cari Kontrak Payung..."
                      className="text-xs mt-1 font-mono"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Supervisor Rendal Har *</Label>
                  <Input
                    value={form.supervisor_rendal}
                    onChange={(e) => setForm({ ...form, supervisor_rendal: e.target.value })}
                    className="text-xs mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Upload Berkas Pendukung (Max 25MB)</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md border border-input cursor-pointer text-xs font-medium text-foreground transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      [Pilih Dokumen]
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUploadedFile(e.target.files[0].name);
                            toast.success(`File ${e.target.files[0].name} siap diunggah`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                      {uploadedFile || "Belum ada berkas"}
                    </span>
                  </div>
                  {form.request_type === "JASA" && (
                    <span className="text-[10px] text-destructive font-semibold block mt-0.5">
                      * Khusus pemilihan tipe Jasa, file pendukung KAK wajib diisi.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Keterangan / Latar Belakang Kebutuhan</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Justifikasi dan uraian operasional usulan permintaan..."
                  className="mt-1 text-xs h-9"
                />
              </div>
            </div>

            {/* SECTION 2: DETAIL ITEM BARANG / JASA */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-primary" />
                  2. Detail Kebutuhan Material & Jasa (RAB)
                </div>
              </div>

              {/* Input Item Sub-Form */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-muted/20 rounded-lg border border-border/60">
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-semibold">Tipe</Label>
                  <select
                    value={newItemType}
                    onChange={(e: any) => setNewItemType(e.target.value)}
                    className="w-full mt-1 h-8 rounded border border-input bg-background px-2 text-xs"
                  >
                    <option value="BARANG">SC (Barang)</option>
                    <option value="JASA">PR (Jasa)</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <Label className="text-[11px] font-semibold">Nama Barang / Jasa</Label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Nama material / uraian jasa..."
                    className="mt-1 text-xs h-8"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-semibold">Jumlah (Qty)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value) || 1)}
                    className="mt-1 text-xs h-8 font-mono"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-[11px] font-semibold">Satuan</Label>
                  <Input
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value.toUpperCase())}
                    placeholder="PCS"
                    className="mt-1 text-xs h-8 uppercase font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-semibold">Est. Harga Satuan (Rp)</Label>
                  <Input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="mt-1 text-xs h-8 font-mono"
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full h-8 text-xs font-semibold px-2"
                  >
                    [Add]
                  </Button>
                </div>
              </div>

              {/* Tabel Detail Items */}
              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 w-20">Tipe</th>
                      <th className="py-2.5 px-3">Nama Barang / Jasa & Spesifikasi</th>
                      <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-16">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Est. Harga (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {items.map((it, idx) => {
                      const subtotal = (Number(it.quantity) || 0) * (Number(it.estimated_price) || 0);
                      return (
                        <tr key={it.id || idx} className="hover:bg-muted/20">
                          <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{it.item_type || "SC"}</Badge>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-foreground">{it.item_name}</div>
                            {it.specification && (
                              <div className="text-[11px] text-muted-foreground">{it.specification}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{it.quantity}</td>
                          <td className="py-2 px-3 font-mono">{it.unit}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            Rp {Number(it.estimated_price || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            Rp {subtotal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(idx)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total RAB Callout */}
              <div className="flex items-center justify-between p-3.5 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Total Estimasi Biaya (RAB Usulan II):
                </span>
                <span className="text-lg font-black font-mono text-primary">
                  Rp {totalRAB.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save as Draft], [Send For Approval] */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Back (Kembali)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Save (Simpan Draft)
                </Button>
                <Button
                  type="button"
                  onClick={handleSendForApproval}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Mengirim..." : "Send For Approval"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

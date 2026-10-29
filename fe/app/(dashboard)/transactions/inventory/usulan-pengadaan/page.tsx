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
import { ShoppingCart, Search, Plus, Trash2, Send, Layers, Coins, Calendar, FileText } from "lucide-react";
import { inventorySubmoduleService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { PurchaseRequisitionRO, ProcurementRequest } from "@/types";
import toast from "react-hot-toast";

interface ROItemLine {
  id: string;
  ellipse_pr_no: string;
  item_name: string;
  qty: number;
  unit: string;
  estimated_price: number;
}

export default function UsulanPengadaanROPage() {
  const [ros, setROs] = useState<PurchaseRequisitionRO[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Usulan Pengadaan (RO) according to PDF Manual 4.7.2.2
  const [form, setForm] = useState({
    ro_number: "RO-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
    form_date: new Date().toISOString().split("T")[0],
    funding_source: "ANGGARAN_OPERASI",
    entity: "PLN_NP_UP_SEMBALANG",
    work_nature: "NORMAL",
    contract_type: "KONTRAK_SPOT",
    request_id: "",
    notes: "",
  });

  const [roItems, setRoItems] = useState<ROItemLine[]>([
    {
      id: "1",
      ellipse_pr_no: "PR-ELIPSE-9011",
      item_name: "Cartridge Air Intake Filter Gas Turbine",
      qty: 48,
      unit: "PCS",
      estimated_price: 2500000,
    },
  ]);

  const [newEllipsePR, setNewEllipsePR] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("PCS");
  const [newItemPrice, setNewItemPrice] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roRes, rRes] = await Promise.all([
        inventorySubmoduleService.getROs(search),
        procurementService.getAll({ limit: 50 }),
      ]);
      if (roRes?.success) setROs(roRes.data || []);
      if (rRes?.success) setRequests(rRes.data || []);
    } catch {
      toast.error("Gagal memuat usulan pengadaan RO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      ro_number: "RO-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      form_date: new Date().toISOString().split("T")[0],
      funding_source: "ANGGARAN_OPERASI",
      entity: "PLN_NP_UP_SEMBALANG",
      work_nature: "NORMAL",
      contract_type: "KONTRAK_SPOT",
      request_id: requests[0]?.id || "",
      notes: "Usulan Pengadaan suku cadang pemeliharaan unit pembangkit",
    });
    setRoItems([
      {
        id: "1",
        ellipse_pr_no: "PR-ELIPSE-9011",
        item_name: "Cartridge Air Intake Filter Gas Turbine",
        qty: 48,
        unit: "PCS",
        estimated_price: 2500000,
      },
    ]);
    setIsDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!newItemName || !newEllipsePR) {
      toast.error("Isikan nama material dan nomor PR Ellipse");
      return;
    }
    setRoItems([
      ...roItems,
      {
        id: String(Date.now()),
        ellipse_pr_no: newEllipsePR,
        item_name: newItemName,
        qty: newItemQty,
        unit: newItemUnit,
        estimated_price: newItemPrice,
      },
    ]);
    setNewEllipsePR("");
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setRoItems(roItems.filter((it) => it.id !== id));
  };

  const totalEstimate = roItems.reduce(
    (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.estimated_price) || 0),
    0
  );

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRO(false);
  };

  const handleSendApproval = async () => {
    await saveRO(true);
  };

  const saveRO = async (isSendApproval: boolean) => {
    if (!form.request_id || roItems.length === 0) {
      toast.error("Pilih usulan permintaan asal dan tambahkan minimal 1 baris item RO");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await inventorySubmoduleService.createRO({
        request_id: form.request_id,
        ro_number: form.ro_number,
        submission_date: form.form_date,
        total_estimate: totalEstimate,
        status: isSendApproval ? "APPROVED" : "DRAFT",
        notes: `${form.notes} (Entitas: ${form.entity}, Sumber Dana: ${form.funding_source})`,
      });
      if (res?.success) {
        toast.success(
          isSendApproval
            ? "Usulan Pengadaan (RO) berhasil dikirim untuk approval!"
            : "Usulan Pengadaan (RO) berhasil disimpan sebagai draft!"
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-primary" />
            Usulan Pengadaan (RO) (Bab 4.7.2)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pembuatan Rencana Order (RO) dan sinkronisasi nomor Purchase Requisition (PR) sistem ERP Ellipse UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Buat Usulan Pengadaan (RO)
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Usulan Pengadaan (RO)</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi usulan pengadaan yang sudah tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari nomor RO / paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 h-9 text-xs rounded-md border border-input bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                <tr>
                  <th className="py-3 px-4">Nomor RO</th>
                  <th className="py-3 px-4">Paket Usulan Pengadaan</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Total Nilai RO</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data RO...</td></tr>
                ) : ros.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada dokumen RO terdaftar.</td></tr>
                ) : (
                  ros.map((ro) => (
                    <tr key={ro.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{ro.ro_number}</td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {ro.request?.title || ro.request?.request_number || "Paket Pengadaan UP Sembalang"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {ro.submission_date ? new Date(ro.submission_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        Rp {Number(ro.total_estimate || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={ro.status === "APPROVED" || ro.status === "SUBMITTED" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {ro.status === "APPROVED" ? "Disetujui" : "Diajukan"}
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

      {/* DIALOG FORM USULAN PENGADAAN RO (Bab 4.7.2.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Form Usulan Pengadaan (RO) (Bab 4.7.2.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dikerjakan oleh Staff Inventori PT PLN Nusantara Power UP Sembalang yang telah ditunjuk melalui Distribusi Permintaan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & ENTITAS / SUMBER DANA */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" />
                1. Identitas Form & Klasifikasi Anggaran
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis)</Label>
                  <Input
                    value={form.ro_number}
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
                  <Label className="text-xs font-semibold">Sifat Pekerjaan *</Label>
                  <select
                    value={form.work_nature}
                    onChange={(e) => setForm({ ...form, work_nature: e.target.value })}
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
                  <Label className="text-xs font-semibold">Sumber Dana *</Label>
                  <select
                    value={form.funding_source}
                    onChange={(e) => setForm({ ...form, funding_source: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="ANGGARAN_OPERASI">Anggaran Operasi (AO)</option>
                    <option value="ANGGARAN_INVESTASI">Anggaran Investasi (AI)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Entitas *</Label>
                  <select
                    value={form.entity}
                    onChange={(e) => setForm({ ...form, entity: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="PLN_NP_UP_SEMBALANG">PT PLN Nusantara Power UP Sembalang</option>
                    <option value="BLOK_1">PLTGU Blok 1</option>
                    <option value="BLOK_2">PLTGU Blok 2</option>
                    <option value="COMMON_FACILITIES">Fasilitas Bersama (Common)</option>
                  </select>
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
              </div>

              <div>
                <Label className="text-xs font-semibold">Rujukan Usulan Permintaan (UPM) *</Label>
                <select
                  value={form.request_id}
                  onChange={(e) => setForm({ ...form, request_id: e.target.value })}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium"
                  required
                >
                  <option value="">-- [Pilih Paket Usulan Permintaan] --</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.request_number} - {r.title} (RAB: Rp {Number(r.rab_amount || 0).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION 2: DETAIL ITEM RO DENGAN KODE PR ELLIPSE */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Coins className="w-4 h-4 text-primary" />
                  2. Rincian Item RO & Kode Purchase Requisition (PR) Ellipse
                </div>
              </div>

              {/* Sub-form Input Item */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-muted/20 rounded-lg border border-border/60">
                <div className="md:col-span-3">
                  <Label className="text-[11px] font-semibold">Kode PR Ellipse *</Label>
                  <Input
                    value={newEllipsePR}
                    onChange={(e) => setNewEllipsePR(e.target.value)}
                    placeholder="PR-ELIPSE-XXXX"
                    className="mt-1 text-xs h-8 font-mono"
                  />
                </div>
                <div className="md:col-span-4">
                  <Label className="text-[11px] font-semibold">Nama Barang / Material</Label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Deskripsi material suku cadang..."
                    className="mt-1 text-xs h-8"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label className="text-[11px] font-semibold">Qty</Label>
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
                  <Label className="text-[11px] font-semibold">Est. Harga (Rp)</Label>
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

              {/* Table RO Items */}
              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Kode PR Ellipse</th>
                      <th className="py-2.5 px-3">Nama Material Kebutuhan</th>
                      <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-16">Satuan</th>
                      <th className="py-2.5 px-3 text-right">Est. Harga Satuan (Rp)</th>
                      <th className="py-2.5 px-3 text-right">Total Subtotal (Rp)</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {roItems.map((it, idx) => {
                      const lineTotal = (Number(it.qty) || 0) * (Number(it.estimated_price) || 0);
                      return (
                        <tr key={it.id} className="hover:bg-muted/20">
                          <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-primary">{it.ellipse_pr_no}</td>
                          <td className="py-2 px-3 font-medium text-foreground">{it.item_name}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{it.qty}</td>
                          <td className="py-2 px-3 font-mono">{it.unit}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            Rp {Number(it.estimated_price || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                            Rp {lineTotal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(it.id)}
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

              {/* Total Callout */}
              <div className="flex items-center justify-between p-3.5 bg-primary/10 rounded-xl border border-primary/20">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Total Estimasi Usulan RO:
                </span>
                <span className="text-lg font-black font-mono text-primary">
                  Rp {totalEstimate.toLocaleString("id-ID")}
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
                  onClick={handleSendApproval}
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

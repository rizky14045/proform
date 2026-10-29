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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClipboardCheck, Search, CheckCircle2, XCircle, RotateCcw, Eye, FileText, Calendar, DollarSign, Clock } from "lucide-react";
import { procurementService } from "@/services/procurement.service";
import { ProcurementRequest } from "@/types";
import toast from "react-hot-toast";

export default function ApprovalPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "RETURNED">("PENDING");

  // Selected item for detail view modal
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);

  // Action dialog state (Approve / Reject / Return)
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "RETURN" | null>(null);
  const [actionTarget, setActionTarget] = useState<ProcurementRequest | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getAll(search);
      if (res?.data) {
        setRequests(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat dokumen approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const status = r.current_status || r.status;
    if (activeTab === "PENDING") return status === "SUBMITTED" || status === "REVIEWED_SPV" || status === "DRAFT";
    if (activeTab === "APPROVED") return status === "APPROVED_MAN" || status === "APPROVED_GM" || status === "PO_ISSUED";
    if (activeTab === "RETURNED") return status === "REJECTED";
    return true;
  });

  const handleActionConfirm = async () => {
    if (!actionTarget || !actionType) return;
    if ((actionType === "REJECT" || actionType === "RETURN") && !actionNotes.trim()) {
      toast.error("Wajib mengisi alasan penolakan / pengembalian");
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === "APPROVE") {
        await procurementService.approve(actionTarget.id, actionNotes);
        toast.success("Dokumen berhasil disetujui (Approved)");
      } else if (actionType === "REJECT") {
        await procurementService.reject(actionTarget.id, actionNotes);
        toast.success("Dokumen telah ditolak");
      } else {
        await procurementService.revise(actionTarget.id, actionNotes);
        toast.success("Dokumen dikembalikan untuk revisi");
      }

      setActionType(null);
      setActionTarget(null);
      setActionNotes("");
      setSelectedRequest(null);
      fetchData();
    } catch {
      toast.error("Terjadi kesalahan sistem saat memproses persetujuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            Halaman Approval Dokumen (Bab 2.3)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pusat persetujuan bertingkat usulan PPA, telaah teknis, dan dokumen pengadaan di lingkungan UP Sembalang
          </p>
        </div>
      </div>

      {/* TABS FILTER */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <Button
          variant={activeTab === "PENDING" ? undefined : "ghost"}
          color={activeTab === "PENDING" ? "primary" : undefined}
          size="sm"
          onClick={() => setActiveTab("PENDING")}
          className="text-xs h-8 gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan
          <Badge color="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
            {requests.filter((r) => (r.current_status || r.status) === "SUBMITTED" || (r.current_status || r.status) === "REVIEWED_SPV").length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "APPROVED" ? undefined : "ghost"}
          color={activeTab === "APPROVED" ? "primary" : undefined}
          size="sm"
          onClick={() => setActiveTab("APPROVED")}
          className="text-xs h-8 gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Telah Disetujui
          <Badge color="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
            {requests.filter((r) => (r.current_status || r.status) === "APPROVED_MAN" || (r.current_status || r.status) === "APPROVED_GM").length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "RETURNED" ? undefined : "ghost"}
          color={activeTab === "RETURNED" ? "primary" : undefined}
          size="sm"
          onClick={() => setActiveTab("RETURNED")}
          className="text-xs h-8 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Dikembalikan / Ditolak
          <Badge color="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
            {requests.filter((r) => (r.current_status || r.status) === "REJECTED").length}
          </Badge>
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Berkas Masuk</CardTitle>
              <CardDescription className="text-xs">
                Klik tombol detail untuk meninjau rincian item, spesifikasi, dan memberikan keputusan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor usulan atau judul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="h-9 px-3 text-xs">
                Cari
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">No. Pengajuan</th>
                  <th className="py-3 px-4">Judul Pengadaan</th>
                  <th className="py-3 px-4">Unit Peminta</th>
                  <th className="py-3 px-4">Estimasi Pagu</th>
                  <th className="py-3 px-4">Tgl Pengajuan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Memuat daftar dokumen approval...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                      Tidak ada dokumen dalam kategori ini.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{r.request_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground max-w-xs truncate">{r.title}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{r.creator?.name || r.user?.name || "Unit Peminta"}</td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        Rp {Number(r.rab_amount || r.estimated_budget || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{r.created_at?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          color={
                            (r.current_status || r.status) === "APPROVED_GM" || (r.current_status || r.status) === "APPROVED_MAN"
                              ? "success"
                              : (r.current_status || r.status) === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {r.current_status || r.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 gap-1 shadow-xs"
                          onClick={() => setSelectedRequest(r)}
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" /> Periksa Berkas
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL (XL max-w-4xl, Eye-Catching & Full View) */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Lembar Pemeriksaan Dokumen Pengadaan
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {selectedRequest?.request_number}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5 pt-3">
              {/* Highlight Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Estimasi Anggaran (Pagu)
                  </span>
                  <p className="text-base font-bold text-foreground mt-1">
                    Rp {Number(selectedRequest.rab_amount || selectedRequest.estimated_budget || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Tanggal Pengajuan
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {selectedRequest.created_at?.split("T")[0]}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Status Dokumen
                  </span>
                  <div className="mt-1">
                    <Badge color="default" className="text-[10px]">
                      {selectedRequest.current_status || selectedRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Judul Pengadaan</Label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Unit Peminta / Pemohon</Label>
                  <p className="text-xs text-foreground mt-0.5">{selectedRequest.creator?.name || selectedRequest.user?.name || "Unit Pengusul"}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Deskripsi / Kerangka Acuan Kerja</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 bg-muted/20 p-2.5 rounded-md border">
                    {selectedRequest.description || "Spesifikasi dan ketentuan mengacu pada lampiran Kerangka Acuan Kerja (KAK) terlampir."}
                  </p>
                </div>
              </div>

              {/* Items Table if any */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Daftar Rincian Item</Label>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/40 font-semibold border-b">
                        <tr>
                          <th className="py-2 px-3">Item / Material</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Harga Satuan</th>
                          <th className="py-2 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedRequest.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-medium">{item.item_name}</td>
                            <td className="py-2 px-3 text-center">{item.quantity} {item.unit}</td>
                            <td className="py-2 px-3 text-right">Rp {Number(item.estimated_price).toLocaleString("id-ID")}</td>
                            <td className="py-2 px-3 text-right font-semibold">Rp {Number(item.quantity * item.estimated_price).toLocaleString("id-ID")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                  className="text-xs w-full sm:w-auto"
                >
                  Tutup Rincian
                </Button>

                {(selectedRequest.current_status || selectedRequest.status) !== "APPROVED_GM" && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs text-amber-600 border-amber-300 hover:bg-amber-50 gap-1 flex-1 sm:flex-none"
                      onClick={() => {
                        setActionType("RETURN");
                        setActionTarget(selectedRequest);
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Kembalikan (Revisi)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 flex-1 sm:flex-none"
                      onClick={() => {
                        setActionType("REJECT");
                        setActionTarget(selectedRequest);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </Button>
                    <Button
                      type="button"
                      color="success"
                      className="text-xs gap-1 flex-1 sm:flex-none"
                      onClick={() => {
                        setActionType("APPROVE");
                        setActionTarget(selectedRequest);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Setujui Dokumen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION ACTION DIALOG (Eye-Catching, Clear, Clean) */}
      <AlertDialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent className="max-w-lg p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold flex items-center gap-2">
              {actionType === "APPROVE" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {actionType === "REJECT" && <XCircle className="w-5 h-5 text-destructive" />}
              {actionType === "RETURN" && <RotateCcw className="w-5 h-5 text-amber-600" />}
              Konfirmasi Keputusan Persetujuan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-1">
              Anda akan memberikan keputusan <strong>{actionType}</strong> untuk dokumen nomor{" "}
              <strong className="text-foreground">{actionTarget?.request_number}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Label className="text-xs font-semibold">
              Catatan / Alasan {actionType === "APPROVE" ? "(Opsional)" : "*"}
            </Label>
            <Input
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                actionType === "APPROVE"
                  ? "Catatan persetujuan bila ada"
                  : "Wajib mengisi alasan penolakan atau perbaikan yang dibutuhkan"
              }
              className="mt-1.5 text-xs h-9"
              required={actionType !== "APPROVE"}
            />
          </div>

          <AlertDialogFooter className="pt-3">
            <AlertDialogCancel className="text-xs" disabled={isSubmitting}>
              Batal
            </AlertDialogCancel>
            <Button
              color={
                actionType === "APPROVE"
                  ? "success"
                  : actionType === "REJECT"
                  ? "destructive"
                  : "warning"
              }
              className="text-xs"
              onClick={handleActionConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi Keputusan"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

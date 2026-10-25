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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  History,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  Send,
  Building,
  User,
  ExternalLink,
  Layers,
  Filter,
} from "lucide-react";
import { procurementService } from "@/services/procurement.service";
import { ProcurementRequest, ApprovalHistory } from "@/types";
import toast from "react-hot-toast";

const DEMO_TRACKING_REQUESTS: ProcurementRequest[] = [
  {
    id: "req-001",
    request_number: "0019/UPM/600/UPMT/2026",
    wo_number: "WO-2026-0911",
    prk_number: "PRK-2026-004",
    title: "Pengadaan Spare Part Filter Udara Gas Turbine Sembalang Blok 1",
    description: "Penggantian filter udara intake turbin gas GT 1.1 dan 1.2 untuk persiapan pemeliharaan periodik",
    creator_id: "usr-staff_user",
    contract_type: "BARANG",
    priority: "URGENT",
    rab_amount: 145000000,
    current_step: "USULAN_PERMINTAAN_I",
    current_status: "IN_APPROVAL" as any,
    is_distributed: false,
    structure_id: "struct-1",
    created_at: "2026-10-24T08:30:00Z",
    items: [
      {
        id: "item-1",
        request_id: "req-001",
        item_type: "BARANG",
        item_name: "Cartridge Air Intake Filter",
        specification: "Dimensi 324 x 660 mm, Synthetic media F9 EN779",
        quantity: 48,
        unit: "PCS",
        estimated_price: 2500000,
      },
    ],
    histories: [
      {
        id: "hist-1",
        request_id: "req-001",
        approver_id: "usr-staff_user",
        approver_role: "STAFF_USER",
        stage_name: "USULAN_PERMINTAAN_I",
        action: "SUBMIT",
        evaluation_notes: "Usulan diajukan sesuai jadwal pemeliharaan PLTGU Blok 1",
        sequence_order: 1,
        action_timestamp: "2026-10-24T08:30:00Z",
      },
    ],
  },
  {
    id: "req-002",
    request_number: "0018/UPM/600/UPMT/2026",
    wo_number: "WO-2026-0855",
    prk_number: "PRK-2026-002",
    title: "Jasa Overhaul & Pemeliharaan Katup Utama Steam Turbine Blok 2",
    description: "Jasa inspeksi NDT dan balancing rotor katup turbin uap",
    creator_id: "usr-staff_user",
    contract_type: "JASA",
    priority: "NORMAL",
    rab_amount: 320000000,
    current_step: "INVENTORY",
    current_status: "APPROVED" as any,
    is_distributed: true,
    structure_id: "struct-1",
    created_at: "2026-10-22T09:15:00Z",
    items: [
      {
        id: "item-3",
        request_id: "req-002",
        item_type: "JASA",
        item_name: "Jasa Machining & NDT Inspection",
        specification: "Liquid penetrant test & ultrasonic test sesuai ASME Sec V",
        quantity: 1,
        unit: "LOT",
        estimated_price: 320000000,
      },
    ],
    histories: [
      {
        id: "hist-2",
        request_id: "req-002",
        approver_id: "usr-staff_user",
        approver_role: "STAFF_USER",
        stage_name: "USULAN_PERMINTAAN_I",
        action: "SUBMIT",
        evaluation_notes: "Diajukan untuk proses pengadaan jasa overhaul",
        sequence_order: 1,
        action_timestamp: "2026-10-22T09:15:00Z",
      },
      {
        id: "hist-3",
        request_id: "req-002",
        approver_id: "usr-spv_user",
        approver_role: "SPV_USER",
        stage_name: "SPV_USER_HAR",
        action: "APPROVE",
        evaluation_notes: "Spesifikasi dan lingkup pekerjaan telah diverifikasi sesuai kebutuhan teknis",
        sequence_order: 2,
        action_timestamp: "2026-10-22T14:20:00Z",
      },
      {
        id: "hist-4",
        request_id: "req-002",
        approver_id: "usr-mgr_user",
        approver_role: "MGR_USER",
        stage_name: "MGR_PEMELIHARAAN",
        action: "APPROVE",
        evaluation_notes: "Disetujui. Lanjutkan ke Perencanaan Inventori (RO & HPE)",
        sequence_order: 3,
        action_timestamp: "2026-10-23T11:00:00Z",
      },
    ],
  },
  {
    id: "req-003",
    request_number: "0021/UPM/600/UPMT/2026",
    wo_number: "WO-2026-0920",
    prk_number: "PRK-2026-007",
    title: "Pengadaan Mechanical Seal Pompa Pendingin Bantu (CWP)",
    description: "Penggantian mechanical seal pompa pendingin auxiliary",
    creator_id: "usr-staff_user",
    contract_type: "BARANG",
    priority: "NORMAL",
    rab_amount: 65000000,
    current_step: "USULAN_PERMINTAAN_I",
    current_status: "REVISED" as any,
    is_distributed: false,
    structure_id: "struct-1",
    created_at: "2026-10-23T10:00:00Z",
    items: [],
    histories: [
      {
        id: "hist-5",
        request_id: "req-003",
        approver_id: "usr-staff_user",
        approver_role: "STAFF_USER",
        stage_name: "USULAN_PERMINTAAN_I",
        action: "SUBMIT",
        evaluation_notes: "Pengajuan awal",
        sequence_order: 1,
        action_timestamp: "2026-10-23T10:00:00Z",
      },
      {
        id: "hist-6",
        request_id: "req-003",
        approver_id: "usr-spv_user",
        approver_role: "SPV_USER",
        stage_name: "SPV_USER_HAR",
        action: "REVISE",
        evaluation_notes: "Mohon lampirkan sertifikat kesesuaian drawing pompa dan periksa kembali estimasi harga referensi pasar terbaru.",
        sequence_order: 2,
        action_timestamp: "2026-10-23T16:45:00Z",
      },
    ],
  },
  {
    id: "req-004",
    request_number: "0022/UPM/600/UPMT/2026",
    wo_number: "WO-2026-0935",
    prk_number: "PRK-2026-009",
    title: "Pengadaan AC Split Ruang Kontrol Generator Unit 3",
    description: "Penggantian pendingin ruangan CCR Unit 3",
    creator_id: "usr-staff_user",
    contract_type: "BARANG",
    priority: "NORMAL",
    rab_amount: 45000000,
    current_step: "USULAN_PERMINTAAN_I",
    current_status: "REJECTED" as any,
    is_distributed: false,
    structure_id: "struct-1",
    created_at: "2026-10-21T09:00:00Z",
    items: [],
    histories: [
      {
        id: "hist-7",
        request_id: "req-004",
        approver_id: "usr-staff_user",
        approver_role: "STAFF_USER",
        stage_name: "USULAN_PERMINTAAN_I",
        action: "SUBMIT",
        evaluation_notes: "Usulan diajukan",
        sequence_order: 1,
        action_timestamp: "2026-10-21T09:00:00Z",
      },
      {
        id: "hist-8",
        request_id: "req-004",
        approver_id: "usr-mgr_user",
        approver_role: "MGR_USER",
        stage_name: "MGR_PEMELIHARAAN",
        action: "REJECT",
        evaluation_notes: "Anggaran PRK fasilitas umum dialihkan untuk perbaikan darurat boiler. Usulan ditolak.",
        sequence_order: 2,
        action_timestamp: "2026-10-21T15:30:00Z",
      },
    ],
  },
  {
    id: "req-005",
    request_number: "0023/UPM/600/UPMT/2026",
    wo_number: "WO-2026-0940",
    prk_number: "PRK-2026-011",
    title: "Pengadaan Pelumas Sintetik Turbin Gas (Mobil DTE 832)",
    description: "Penyediaan oli pelumas cadangan untuk turbin gas Sembalang",
    creator_id: "usr-staff_user",
    contract_type: "BARANG",
    priority: "NORMAL",
    rab_amount: 85000000,
    current_step: "USULAN_PERMINTAAN_I",
    current_status: "DRAFT" as any,
    is_distributed: false,
    structure_id: "struct-1",
    created_at: "2026-10-25T11:20:00Z",
    items: [],
    histories: [],
  },
];

export default function TrackingPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>(DEMO_TRACKING_REQUESTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stepFilter, setStepFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await procurementService.getAll().catch(() => null);
      if (res?.data && res.data.length > 0) {
        setRequests(res.data);
      }
    } catch (e) {
      console.warn("Using demo tracking requests");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredRequests = requests.filter((r) => {
    const s = search.toLowerCase();
    const matchSearch =
      r.request_number.toLowerCase().includes(s) ||
      r.title.toLowerCase().includes(s) ||
      (r.wo_number && r.wo_number.toLowerCase().includes(s)) ||
      (r.prk_number && r.prk_number.toLowerCase().includes(s));

    if (!matchSearch) return false;
    if (statusFilter !== "ALL" && r.current_status !== statusFilter) return false;
    if (stepFilter !== "ALL" && (r.current_step || "USULAN_PERMINTAAN_I") !== stepFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Tracking & Riwayat Permohonan Pengadaan
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Pelacakan status berkas pengadaan end-to-end (posisi meja kerja, catatan revisi, approval, dan penolakan) sesuai User Manual Bab 4.4
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor permohonan, WO, judul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="ALL">Semua Status Persetujuan</option>
                <option value="IN_APPROVAL">Menunggu Persetujuan (In Approval)</option>
                <option value="APPROVED">Disetujui (Approved)</option>
                <option value="REVISED">Perlu Revisi (Revised)</option>
                <option value="REJECTED">Ditolak (Rejected)</option>
                <option value="DRAFT">Draft</option>
              </select>

              <select
                value={stepFilter}
                onChange={(e) => setStepFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="ALL">Semua Posisi Tahapan</option>
                <option value="USULAN_PERMINTAAN_I">1. Usulan Permintaan (UPM I/II)</option>
                <option value="INVENTORY">2. Perencanaan Inventori (RO / HPE / RKS)</option>
                <option value="TENDER">3. Sourcing & Tender (HPS / BAPP / PO)</option>
                <option value="GUDANG">4. Logistik Gudang (GR & BAST)</option>
              </select>
            </div>

            <div className="text-xs text-muted-foreground self-center">
              Total: <strong className="text-foreground">{filteredRequests.length}</strong> Permohonan
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">No. Form UPM / WO</th>
                  <th className="py-3 px-4">Judul Pekerjaan</th>
                  <th className="py-3 px-4">Tipe & Prioritas</th>
                  <th className="py-3 px-4">Nilai RAB</th>
                  <th className="py-3 px-4">Posisi Meja (Tahapan)</th>
                  <th className="py-3 px-4 text-center">Status Berkas</th>
                  <th className="py-3 px-4 text-center w-32">Jejak Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Tidak ada permohonan yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => {
                    const statusStr = String(r.current_status || "DRAFT");
                    const lastHistory =
                      r.histories && r.histories.length > 0
                        ? r.histories[r.histories.length - 1]
                        : null;

                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-foreground">{r.request_number}</div>
                          <div className="text-[10px] text-muted-foreground">
                            WO: {r.wo_number || "-"} | PRK: {r.prk_number || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-foreground line-clamp-1">{r.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Inisiator: <strong>{r.creator_id?.replace("usr-", "") || "User"}</strong>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit text-[10px] font-mono">
                              {r.contract_type}
                            </Badge>
                            {r.priority === "URGENT" && (
                              <Badge className="w-fit text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                URGENT
                              </Badge>
                            )}
                            {r.priority === "EMERGENCY" && (
                              <Badge className="w-fit text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                EMERGENCY
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap font-mono">
                          {formatCurrency(r.rab_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">
                            {r.current_step === "INVENTORY"
                              ? "Perencanaan Inventori"
                              : r.current_step === "TENDER"
                              ? "Pengadaan & Tender"
                              : r.current_step === "GUDANG"
                              ? "Logistik Gudang"
                              : "Unit Peminta (UPM)"}
                          </div>
                          {lastHistory && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Meja: <span className="font-mono">{lastHistory.approver_role}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {statusStr === "APPROVED" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                              APPROVED
                            </Badge>
                          )}
                          {statusStr === "IN_APPROVAL" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold animate-pulse">
                              IN APPROVAL
                            </Badge>
                          )}
                          {statusStr === "REVISED" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
                              REVISED
                            </Badge>
                          )}
                          {statusStr === "REJECTED" && (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
                              REJECTED
                            </Badge>
                          )}
                          {statusStr === "DRAFT" && (
                            <Badge variant="outline" className="text-muted-foreground text-[10px]">
                              DRAFT
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRequest(r)}
                            className="h-7 px-2.5 text-xs text-primary hover:text-primary gap-1"
                          >
                            <History className="w-3.5 h-3.5" /> Riwayat
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL RIWAYAT PERMOHONAN & TIMELINE AUDIT */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between gap-2 pr-6">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Riwayat Persetujuan Berkas: {selectedRequest.request_number}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Judul: <strong>{selectedRequest.title}</strong>
                  </DialogDescription>
                </div>
                <div>
                  {String(selectedRequest.current_status) === "APPROVED" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs">
                      APPROVED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "IN_APPROVAL" && (
                    <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs animate-pulse">
                      IN APPROVAL
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "REVISED" && (
                    <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs">
                      REVISED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "REJECTED" && (
                    <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs">
                      REJECTED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "DRAFT" && (
                    <Badge variant="outline" className="text-xs">
                      DRAFT
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Meta Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/40 border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">No. Work Order:</span>
                  <strong className="text-foreground font-mono">{selectedRequest.wo_number || "-"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">No. PRK Anggaran:</span>
                  <strong className="text-foreground font-mono">{selectedRequest.prk_number || "-"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tipe Kontrak:</span>
                  <strong className="text-foreground font-mono">{selectedRequest.contract_type}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Nilai Usulan (RAB):</span>
                  <strong className="text-primary font-bold font-mono">
                    {formatCurrency(selectedRequest.rab_amount)}
                  </strong>
                </div>
              </div>

              {/* TIMELINE HISTORY */}
              <div className="space-y-3 pt-2">
                <div className="font-bold text-xs text-foreground flex items-center justify-between">
                  <span>Linimasa Keputusan Approval & Evaluasi Meja:</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Total: {selectedRequest.histories?.length || 0} Aksi Tercatat
                  </span>
                </div>

                {(!selectedRequest.histories || selectedRequest.histories.length === 0) ? (
                  <div className="p-6 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                    Berkas masih berstatus draft dan belum pernah diproses di meja persetujuan.
                  </div>
                ) : (
                  <div className="flow-root pl-2">
                    <ul className="-mb-6">
                      {selectedRequest.histories.map((item, idx) => {
                        const isLast = idx === selectedRequest.histories!.length - 1;
                        let badgeBg = "bg-blue-100 text-blue-800 border-blue-300";
                        if (item.action === "APPROVE") {
                          badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300";
                        } else if (item.action === "REVISE") {
                          badgeBg = "bg-amber-100 text-amber-800 border-amber-300";
                        } else if (item.action === "REJECT") {
                          badgeBg = "bg-rose-100 text-rose-800 border-rose-300";
                        }

                        return (
                          <li key={item.id || idx}>
                            <div className="relative pb-6">
                              {!isLast && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3 items-start">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-card border flex items-center justify-center ring-4 ring-background text-xs font-bold text-muted-foreground shadow-xs">
                                    {idx + 1}
                                  </span>
                                </div>
                                <div className="flex-1 pt-0.5">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs font-semibold text-foreground">
                                      {item.stage_name} &bull;{" "}
                                      <span className="text-muted-foreground font-normal">
                                        {item.approver?.name || item.approver_role}
                                      </span>{" "}
                                      <span className="text-[10px] text-muted-foreground font-mono">
                                        ({item.approver_role})
                                      </span>
                                    </p>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}
                                    >
                                      {item.action}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                    {new Date(item.action_timestamp).toLocaleString("id-ID")}
                                  </p>
                                  {item.evaluation_notes && (
                                    <div className="mt-2 text-xs text-foreground bg-muted/40 p-2.5 rounded-md border border-border/80">
                                      <span className="font-semibold text-muted-foreground">
                                        Catatan Evaluasi / Alasan:
                                      </span>{" "}
                                      {item.evaluation_notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button size="sm" variant="outline" onClick={() => setSelectedRequest(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


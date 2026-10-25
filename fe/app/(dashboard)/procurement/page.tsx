"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  UserCheck,
  Check,
  XCircle,
  RotateCcw,
  History,
  ShieldCheck,
  AlertTriangle,
  FilePlus,
  Hash,
  Coins,
  Layers,
  Calculator,
} from "lucide-react";
import { procurementService, CreateProcurementPayload } from "@/services/procurement.service";
import { ProcurementRequest, RequestItem, ApprovalHistory } from "@/types";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

// Initial Demo Requests representing the full cycle
const INITIAL_DEMO_REQUESTS: ProcurementRequest[] = [
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
      {
        id: "item-2",
        request_id: "req-001",
        item_type: "BARANG",
        item_name: "Pre-Filter Mat G4",
        specification: "Panel 592 x 592 x 48 mm, Sintetis Washable",
        quantity: 50,
        unit: "PCS",
        estimated_price: 500000,
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
        evaluation_notes: "Spesifikasi dan lingkup pekerjaan telah diverifikasi sesuai kebutuhan",
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
    items: [
      {
        id: "item-4",
        request_id: "req-003",
        item_type: "BARANG",
        item_name: "Cartridge Mechanical Seal 85mm",
        specification: "SiC vs Carbon, Elastomer Viton, Spring SS316",
        quantity: 2,
        unit: "SET",
        estimated_price: 32500000,
      },
    ],
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
    items: [
      {
        id: "item-5",
        request_id: "req-004",
        item_type: "BARANG",
        item_name: "AC Split Inverter 2.5 PK",
        specification: "R32, Heavy Duty, anti korosi pesisir laut",
        quantity: 3,
        unit: "UNIT",
        estimated_price: 15000000,
      },
    ],
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
        evaluation_notes: "Anggaran PRK fasilitas umum dialihkan untuk perbaikan darurat boiler. Usulan ditolak dan dapat diajukan kembali pada RKAP tahun depan.",
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
    items: [
      {
        id: "item-6",
        request_id: "req-005",
        item_type: "BARANG",
        item_name: "Mobil DTE 832 Turbine Oil",
        specification: "ISO VG 32, Drum 208 Liter, Segel Resmi",
        quantity: 10,
        unit: "DRUM",
        estimated_price: 8500000,
      },
    ],
    histories: [],
  },
];

export default function ProcurementPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ProcurementRequest[]>(INITIAL_DEMO_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProcurementRequest | null>(null);

  // Approval Action Dialog State
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "APPROVE" | "REVISE" | "REJECT" | "SUBMIT";
    targetRequest: ProcurementRequest | null;
  }>({
    open: false,
    type: "APPROVE",
    targetRequest: null,
  });
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Inline Decision State inside Detail Modal (avoids clunky double modal)
  const [inlineAction, setInlineAction] = useState<"APPROVE" | "REVISE" | "REJECT" | "SUBMIT" | null>(null);
  const [inlineNotes, setInlineNotes] = useState("");

  // Detect current user role
  let currentRole = ((session?.user as any)?.role || "ADMIN").toUpperCase();
  let currentUserName = session?.user?.name || "Pengguna Aktif";
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("user_info");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role?.code) currentRole = parsed.role.code.toUpperCase();
        if (parsed.name) currentUserName = parsed.name;
      }
    } catch (e) {}
  }

  // Can approve if user is Supervisor, Manager, GM, or Admin
  const canApprove = [
    "ADMIN",
    "SUPERADMIN",
    "GM",
    "MGR_USER",
    "SPV_USER",
    "SPV_RENDALHAR",
    "MGR_LOGISTIK",
  ].includes(currentRole);

  // Form State for New UPM
  const [formData, setFormData] = useState<CreateProcurementPayload>({
    request_number: "",
    wo_number: "",
    prk_number: "",
    title: "",
    description: "",
    structure_id: "00000000-0000-0000-0000-000000000001",
    contract_type: "BARANG",
    priority: "NORMAL",
    rab_amount: 0,
    items: [
      {
        item_type: "BARANG",
        item_name: "",
        specification: "",
        quantity: 1,
        unit: "PCS",
        estimated_price: 0,
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await procurementService.getAll(search).catch(() => null);
      if (res?.data && res.data.length > 0) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn("Using memory/local procurement list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        {
          item_type: "BARANG",
          item_name: "",
          specification: "",
          quantity: 1,
          unit: "PCS",
          estimated_price: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...(formData.items || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.items || [])];
    (updated[index] as any)[field] = val;
    const total = updated.reduce(
      (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.estimated_price) || 0),
      0
    );
    setFormData({ ...formData, items: updated, rab_amount: total });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const generatedNum =
        formData.request_number ||
        `00${requests.length + 20}/UPM/600/UPMT/${new Date().getFullYear()}`;

      const newReq: ProcurementRequest = {
        id: `req-${Date.now()}`,
        request_number: generatedNum,
        wo_number: formData.wo_number,
        prk_number: formData.prk_number,
        title: formData.title,
        description: formData.description,
        creator_id: "usr-" + currentRole.toLowerCase(),
        contract_type: formData.contract_type,
        priority: formData.priority,
        rab_amount: formData.rab_amount,
        current_step: "USULAN_PERMINTAAN_I",
        current_status: "DRAFT" as any,
        is_distributed: false,
        structure_id: formData.structure_id,
        items: (formData.items || []).map((it, i) => ({
          ...it,
          id: `item-${Date.now()}-${i}`,
          request_id: `req-${Date.now()}`,
        })),
        histories: [],
      };

      // Try server call
      try {
        await procurementService.create(formData);
      } catch (err) {}

      setRequests([newReq, ...requests]);
      setIsCreateOpen(false);
      toast.success("Draft Usulan Pengadaan berhasil dibuat!");
      setFormData({
        request_number: "",
        wo_number: "",
        prk_number: "",
        title: "",
        description: "",
        structure_id: "00000000-0000-0000-0000-000000000001",
        contract_type: "BARANG",
        priority: "NORMAL",
        rab_amount: 0,
        items: [
          {
            item_type: "BARANG",
            item_name: "",
            specification: "",
            quantity: 1,
            unit: "PCS",
            estimated_price: 0,
          },
        ],
      });
    } catch (err: any) {
      toast.error("Gagal membuat usulan: " + err.message);
    }
  };

  // Open Standalone Action Dialog (for quick actions from table list)
  const handleOpenAction = (
    type: "APPROVE" | "REVISE" | "REJECT" | "SUBMIT",
    req: ProcurementRequest
  ) => {
    setActionDialog({
      open: true,
      type,
      targetRequest: req,
    });
    setActionNotes("");
  };

  // Shared Action Execution Logic
  const handleExecuteActionLogic = async (
    type: "APPROVE" | "REVISE" | "REJECT" | "SUBMIT",
    targetRequest: ProcurementRequest,
    notes: string
  ) => {
    if ((type === "REVISE" || type === "REJECT") && !notes.trim()) {
      toast.error(
        type === "REVISE"
          ? "Catatan perbaikan / arahan revisi wajib diisi"
          : "Alasan penolakan berkas wajib diisi"
      );
      return false;
    }

    try {
      setIsSubmittingAction(true);

      // Determine new status and stage
      let newStatus: any = targetRequest.current_status;
      let newStep = targetRequest.current_step || "USULAN_PERMINTAAN_I";
      let stageName = "USULAN_PERMINTAAN_I";

      if (type === "SUBMIT") {
        newStatus = "IN_APPROVAL";
        stageName = "PENGAJUAN_USER";
        try {
          await procurementService.submitForApproval(targetRequest.id, notes);
        } catch (e) {}
      } else if (type === "APPROVE") {
        newStatus = "APPROVED";
        newStep = "INVENTORY";
        stageName = currentRole.includes("MGR")
          ? "APPROVAL_MANAGER"
          : currentRole.includes("GM")
          ? "APPROVAL_GM"
          : "APPROVAL_SPV";
        try {
          await procurementService.approve(targetRequest.id, notes);
        } catch (e) {}
      } else if (type === "REVISE") {
        newStatus = "REVISED";
        stageName = currentRole.includes("MGR") ? "REVISI_MANAGER" : "REVISI_SPV";
        try {
          await procurementService.revise(targetRequest.id, notes);
        } catch (e) {}
      } else if (type === "REJECT") {
        newStatus = "REJECTED";
        stageName = currentRole.includes("MGR") ? "PENOLAKAN_MANAGER" : "PENOLAKAN_SPV";
        try {
          await procurementService.reject(targetRequest.id, notes);
        } catch (e) {}
      }

      // Add audit history
      const newHistory: ApprovalHistory = {
        id: `hist-${Date.now()}`,
        request_id: targetRequest.id,
        approver_id: "usr-" + currentRole.toLowerCase(),
        approver_role: currentRole,
        stage_name: stageName,
        action: type,
        evaluation_notes: notes || (type === "APPROVE" ? "Disetujui" : "Diajukan"),
        sequence_order: (targetRequest.histories?.length || 0) + 1,
        action_timestamp: new Date().toISOString(),
      };

      const updatedRequest: ProcurementRequest = {
        ...targetRequest,
        current_status: newStatus,
        current_step: newStep,
        histories: [...(targetRequest.histories || []), newHistory],
      };

      const updatedList = requests.map((r) =>
        r.id === targetRequest.id ? updatedRequest : r
      );
      setRequests(updatedList);

      if (selectedRequest && selectedRequest.id === targetRequest.id) {
        setSelectedRequest(updatedRequest);
      }

      if (type === "SUBMIT") {
        toast.success(`Usulan ${targetRequest.request_number} berhasil dikirim untuk Persetujuan!`);
      } else if (type === "APPROVE") {
        toast.success(`Usulan ${targetRequest.request_number} telah disetujui (APPROVED)!`);
      } else if (type === "REVISE") {
        toast("Usulan dikembalikan ke pembuat untuk perbaikan (REVISED)", {
          icon: "⚠️",
          style: { border: "1px solid #f59e0b", color: "#b45309" },
        });
      } else if (type === "REJECT") {
        toast.error(`Usulan ${targetRequest.request_number} telah ditolak (REJECTED)`);
      }

      return true;
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses aksi persetujuan");
      return false;
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Standalone dialog executor
  const handleExecuteAction = async () => {
    const { type, targetRequest } = actionDialog;
    if (!targetRequest) return;
    const ok = await handleExecuteActionLogic(type, targetRequest, actionNotes);
    if (ok) {
      setActionDialog({ open: false, type: "APPROVE", targetRequest: null });
      setActionNotes("");
    }
  };

  // Inline decision executor inside detail modal (avoids double modal)
  const handleExecuteInlineAction = async () => {
    if (!selectedRequest || !inlineAction) return;
    const ok = await handleExecuteActionLogic(inlineAction, selectedRequest, inlineNotes);
    if (ok) {
      setInlineAction(null);
      setInlineNotes("");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.request_number.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.wo_number && r.wo_number.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    return r.current_status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Usulan Permintaan Pengadaan (UPM)
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Alur siklus dokumen UPM I & II, pengesahan berjenjang (SPV, Manager, GM), revisi, serta penolakan berkas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-2.5 bg-muted/60 font-mono">
            Role Aktif: <strong className="ml-1 text-primary">{currentRole}</strong>
          </Badge>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm font-semibold">
                <Plus className="w-4 h-4" />
                Buat Usulan Baru
              </Button>
            </DialogTrigger>
            <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 border-b border-border/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shadow-xs">
                        <FilePlus className="h-5 w-5" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                          Formulir Usulan Permintaan Material / Jasa (UPM I)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          PT PLN Nusantara Power UP Sembalang &bull; Sesuai Pedoman Tata Kelola Pengadaan
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                  <Badge color="secondary" className="px-3 py-1 text-xs font-semibold">
                    Draft Usulan Baru
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
                {/* SECTION 1: IDENTITAS DOKUMEN & PENGADAAN */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-primary" />
                    1. Identitas Dokumen & Klasifikasi Pengadaan
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        Nomor Usulan / Nota Dinas
                      </Label>
                      <Input
                        placeholder="Otomatis jika dikosongkan..."
                        value={formData.request_number}
                        onChange={(e) => setFormData({ ...formData, request_number: e.target.value })}
                        className="text-xs font-mono h-9 bg-background/80"
                      />
                      <p className="text-[10px] text-muted-foreground">Format: 00X/UPM/600/UPMT/2026</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        No. Work Order (WO Ellipse)
                      </Label>
                      <Input
                        placeholder="Contoh: WO-2026-0812"
                        value={formData.wo_number}
                        onChange={(e) => setFormData({ ...formData, wo_number: e.target.value })}
                        className="text-xs font-mono h-9 bg-background/80"
                      />
                      <p className="text-[10px] text-muted-foreground">Nomor WO pemeliharaan di sistem ERP Ellipse</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                        No. PRK Anggaran
                      </Label>
                      <Input
                        placeholder="Contoh: PRK-2026-004"
                        value={formData.prk_number}
                        onChange={(e) => setFormData({ ...formData, prk_number: e.target.value })}
                        className="text-xs font-mono h-9 bg-background/80"
                      />
                      <p className="text-[10px] text-muted-foreground">Pos alokasi anggaran investasi/operasi</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      Judul / Perihal Pengadaan <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="Contoh: Pengadaan Spare Part Filter Udara Gas Turbine UP Sembalang Blok 1"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-xs font-medium h-9.5 bg-background/80"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Jenis Pengadaan</Label>
                      <select
                        className="w-full h-9.5 rounded-md border border-input bg-background/80 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                        value={formData.contract_type}
                        onChange={(e: any) => setFormData({ ...formData, contract_type: e.target.value })}
                      >
                        <option value="BARANG">Barang (Material & Spare Part Pembangkit)</option>
                        <option value="JASA">Jasa Pemborongan / Jasa Lainnya</option>
                        <option value="KONSULTANSI">Jasa Konsultansi / Enjiniring</option>
                        <option value="SEWA">Sewa Peralatan / Fasilitas</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Tingkat Prioritas</Label>
                      <select
                        className="w-full h-9.5 rounded-md border border-input bg-background/80 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                        value={formData.priority}
                        onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="NORMAL">Normal (Rutin Terjadwal)</option>
                        <option value="URGENT">Urgent (Operasional Mendesak)</option>
                        <option value="EMERGENCY">Emergency (Darurat Pembangkit)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Latar Belakang / Keterangan Kebutuhan Operasional</Label>
                    <Textarea
                      rows={2}
                      placeholder="Jelaskan justifikasi dan urgensi kebutuhan barang/jasa ini untuk unit pembangkit..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="text-xs bg-background/80 resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 2: RINCIAN ITEM BARANG / JASA */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-primary" />
                      2. Rincian Material & Jasa yang Diminta ({formData.items?.length || 0} Baris)
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddItem}
                      className="h-8 text-xs gap-1.5 bg-background hover:bg-primary/5 hover:text-primary border-primary/30"
                    >
                      <Plus className="w-3.5 h-3.5 text-primary" /> Tambah Baris Material
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {formData.items?.map((item, idx) => {
                      const subtotal = (Number(item.quantity) || 0) * (Number(item.estimated_price) || 0);
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-border/70 bg-background/60 hover:border-primary/40 transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px]">
                              Item #{idx + 1}
                            </span>
                            {formData.items!.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveItem(idx)}
                                className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                            <div className="md:col-span-5 space-y-1">
                              <Label className="text-[11px] font-medium text-muted-foreground">Nama Barang / Uraian Jasa *</Label>
                              <Input
                                placeholder="Contoh: Pre-Filter Udara Gas Turbine"
                                required
                                value={item.item_name}
                                onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                                className="text-xs h-8.5 font-medium"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-[11px] font-medium text-muted-foreground">Volume / Qty *</Label>
                              <Input
                                type="number"
                                placeholder="Qty"
                                required
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(idx, "quantity", parseFloat(e.target.value) || 0)
                                }
                                className="text-xs h-8.5 font-mono text-center"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <Label className="text-[11px] font-medium text-muted-foreground">Satuan *</Label>
                              <Input
                                placeholder="PCS / SET / EA"
                                required
                                value={item.unit}
                                onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                                className="text-xs h-8.5 uppercase text-center font-mono"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-1">
                              <Label className="text-[11px] font-medium text-muted-foreground">Est. Harga Satuan (Rp)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.estimated_price}
                                onChange={(e) =>
                                  handleItemChange(idx, "estimated_price", parseFloat(e.target.value) || 0)
                                }
                                className="text-xs h-8.5 font-mono text-right"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-1">
                            <div className="md:col-span-8">
                              <Input
                                placeholder="Spesifikasi teknis, part number, atau referensi katalog pabrikan..."
                                value={item.specification}
                                onChange={(e) => handleItemChange(idx, "specification", e.target.value)}
                                className="text-xs h-8 text-muted-foreground bg-muted/20"
                              />
                            </div>
                            <div className="md:col-span-4 flex items-center justify-end gap-2 text-xs">
                              <span className="text-muted-foreground text-[11px]">Subtotal:</span>
                              <span className="font-bold text-foreground font-mono text-xs">
                                {formatCurrency(subtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: RINGKASAN RAB */}
                <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                      <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                        Total Rencana Anggaran Biaya (RAB)
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Akumulasi total estimasi biaya dari seluruh baris kebutuhan yang diajukan
                      </div>
                    </div>
                  </div>
                  <div className="text-xl md:text-2xl font-black text-primary font-mono tracking-tight">
                    {formatCurrency(formData.rab_amount)}
                  </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="flex items-center justify-between pt-3 border-t border-border/70">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="gap-2 text-xs font-semibold shadow-md">
                    <Send className="w-4 h-4" /> Simpan Draft Usulan Pengadaan
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Requests Filter & Data Table */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari no. usulan, WO, judul..."
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
                <option value="ALL">Semua Status Berkas</option>
                <option value="IN_APPROVAL">Menunggu Persetujuan (In Approval)</option>
                <option value="APPROVED">Disetujui (Approved)</option>
                <option value="REVISED">Perlu Revisi (Revised)</option>
                <option value="REJECTED">Ditolak (Rejected)</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <div className="text-xs text-muted-foreground self-center">
              Menampilkan <strong className="text-foreground">{filteredRequests.length}</strong> dari{" "}
              {requests.length} usulan
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Nomor Usulan / WO</th>
                  <th className="py-3 px-4">Judul & Spesifikasi</th>
                  <th className="py-3 px-4">Tipe & Prioritas</th>
                  <th className="py-3 px-4">Nilai RAB</th>
                  <th className="py-3 px-4 text-center">Status Siklus</th>
                  <th className="py-3 px-4 text-center w-36">Aksi Alur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Tidak ada data usulan pengadaan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => {
                    const statusStr = String(r.current_status || "DRAFT");
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
                          <div className="text-[10px] text-muted-foreground line-clamp-1">
                            {r.description || (r.items ? `${r.items.length} rincian item barang/jasa` : "-")}
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
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {formatCurrency(r.rab_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {statusStr === "APPROVED" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              APPROVED
                            </Badge>
                          )}
                          {statusStr === "IN_APPROVAL" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] animate-pulse">
                              IN APPROVAL
                            </Badge>
                          )}
                          {statusStr === "REVISED" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                              REVISED
                            </Badge>
                          )}
                          {statusStr === "REJECTED" && (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]">
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
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Detail & Tracker */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedRequest(r)}
                              className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </Button>

                            {/* Tombol Kirim Approval jika Draft/Revised */}
                            {(statusStr === "DRAFT" || statusStr === "REVISED") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAction("SUBMIT", r)}
                                className="h-7 px-2 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
                              >
                                <Send className="w-3 h-3" /> Ajukan
                              </Button>
                            )}

                            {/* Tombol Cepat Approval untuk Pejabat Berwenang */}
                            {statusStr === "IN_APPROVAL" && canApprove && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedRequest(r)}
                                className="h-7 px-2 text-[10px] bg-primary hover:bg-primary/90 gap-1 font-semibold"
                              >
                                <UserCheck className="w-3 h-3" /> Proses
                              </Button>
                            )}
                          </div>
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

      {/* DETAILS & AUDIT TRACKER DIALOG (EXPANDED XL WITH INLINE ACTION DECISION) */}
      {selectedRequest && (
        <Dialog
          open={!!selectedRequest}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRequest(null);
              setInlineAction(null);
              setInlineNotes("");
            }
          }}
        >
          <DialogContent size="5xl" className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 border-b border-border/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold shadow-xs">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        Berkas Usulan: {selectedRequest.request_number}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        WO: {selectedRequest.wo_number || "-"} &bull; PRK: {selectedRequest.prk_number || "-"} &bull; Tipe: {selectedRequest.contract_type}
                      </DialogDescription>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {String(selectedRequest.current_status) === "APPROVED" && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> APPROVED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "IN_APPROVAL" && (
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs px-3 py-1 font-bold animate-pulse">
                      <Clock className="w-3.5 h-3.5 mr-1" /> IN APPROVAL
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "REVISED" && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs px-3 py-1 font-bold">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> REVISED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "REJECTED" && (
                    <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs px-3 py-1 font-bold">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> REJECTED
                    </Badge>
                  )}
                  {String(selectedRequest.current_status) === "DRAFT" && (
                    <Badge variant="outline" className="text-xs px-3 py-1 font-semibold">
                      DRAFT
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Ringkasan Parameter Berkas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                    Total Nilai RAB
                  </span>
                  <span className="text-base font-extrabold text-primary font-mono block">
                    {formatCurrency(selectedRequest.rab_amount)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                    Klasifikasi Kontrak
                  </span>
                  <span className="text-xs font-semibold text-foreground block">
                    {selectedRequest.contract_type}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                    Tingkat Prioritas
                  </span>
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedRequest.priority === "EMERGENCY"
                        ? "bg-rose-500"
                        : selectedRequest.priority === "URGENT"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`} />
                    {selectedRequest.priority}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                    Tahapan Alur Saat Ini
                  </span>
                  <span className="text-xs font-semibold text-foreground font-mono block">
                    {selectedRequest.current_step || "USULAN_PERMINTAAN_I"}
                  </span>
                </div>
              </div>

              {/* Judul & Deskripsi Kebutuhan */}
              <div className="p-4 rounded-xl border border-border/70 bg-card/60 space-y-2 shadow-2xs">
                <div className="font-bold text-foreground text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {selectedRequest.title}
                </div>
                {selectedRequest.description && (
                  <p className="text-muted-foreground leading-relaxed pl-6">
                    {selectedRequest.description}
                  </p>
                )}
              </div>

              {/* Items List Table */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div className="space-y-3">
                  <div className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Daftar Kebutuhan Material & Jasa ({selectedRequest.items.length} Item)
                  </div>
                  <div className="border border-border/70 rounded-xl overflow-hidden shadow-2xs bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/70 text-muted-foreground text-[10px] uppercase font-bold border-b border-border/60">
                        <tr>
                          <th className="p-3 w-10 text-center">No</th>
                          <th className="p-3">Nama Barang / Jasa</th>
                          <th className="p-3">Spesifikasi Teknik & Part No.</th>
                          <th className="p-3 text-center">Volume</th>
                          <th className="p-3 text-right">Est. Harga Satuan</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {selectedRequest.items.map((it, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3 text-center font-mono text-muted-foreground">{i + 1}</td>
                            <td className="p-3 font-semibold text-foreground">{it.item_name}</td>
                            <td className="p-3 text-muted-foreground">{it.specification || "-"}</td>
                            <td className="p-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded bg-muted font-bold">
                                {it.quantity} {it.unit}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-muted-foreground">
                              {formatCurrency(it.estimated_price)}
                            </td>
                            <td className="p-3 text-right font-bold text-foreground font-mono">
                              {formatCurrency(it.quantity * it.estimated_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/40 font-bold border-t border-border/70">
                        <tr>
                          <td colSpan={5} className="p-3 text-right text-muted-foreground">
                            Total Estimasi Anggaran (RAB):
                          </td>
                          <td className="p-3 text-right font-mono text-primary text-sm">
                            {formatCurrency(selectedRequest.rab_amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: WORKFLOW AUDIT TRACKER (Sesuai MD Bab 6) */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-foreground flex items-center gap-2 uppercase tracking-wider">
                    <History className="h-4 w-4 text-primary" />
                    Jejak Audit & Riwayat Persetujuan (*Approval Workflow*)
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Tahap: <strong>{selectedRequest.current_step || "USULAN_PERMINTAAN_I"}</strong>
                  </span>
                </div>

                {(!selectedRequest.histories || selectedRequest.histories.length === 0) ? (
                  <div className="p-5 rounded-xl bg-muted/20 text-center text-muted-foreground border border-dashed border-border/70">
                    Berkas ini masih berstatus Draft dan belum pernah diajukan ke meja persetujuan.
                  </div>
                ) : (
                  <div className="flow-root pl-2">
                    <ul className="-mb-6">
                      {selectedRequest.histories.map((item, idx) => {
                        const isLast = idx === selectedRequest.histories!.length - 1;
                        let badgeBg = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
                        if (item.action === "APPROVE") {
                          badgeBg = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
                        } else if (item.action === "REVISE") {
                          badgeBg = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
                        } else if (item.action === "REJECT") {
                          badgeBg = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
                        }

                        return (
                          <li key={item.id || idx}>
                            <div className="relative pb-6">
                              {!isLast && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border/80"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3 items-start">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center ring-4 ring-background text-xs font-bold text-muted-foreground shadow-xs">
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
                                      <span className="text-[10px] text-muted-foreground/80 font-mono">
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

              {/* INLINE ACTION DECISION CARD (ELIMINATES DOUBLE MODAL!) */}
              {inlineAction && (
                <div
                  className={`p-5 rounded-xl border transition-all animate-in fade-in zoom-in-95 duration-200 shadow-sm ${
                    inlineAction === "APPROVE"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                      : inlineAction === "REVISE"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                      : inlineAction === "REJECT"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                      : "bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {inlineAction === "APPROVE" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      {inlineAction === "REVISE" && <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                      {inlineAction === "REJECT" && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                      {inlineAction === "SUBMIT" && <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      <span>
                        {inlineAction === "APPROVE" && "Form Persetujuan Usulan (Approval Decision)"}
                        {inlineAction === "REVISE" && "Form Pengembalian untuk Revisi (Revision Request)"}
                        {inlineAction === "REJECT" && "Form Penolakan Berkas Usulan (Rejection Decision)"}
                        {inlineAction === "SUBMIT" && "Konfirmasi Pengajuan Berkas Usulan (Submit)"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-background/60 font-semibold border border-current/20">
                      Pejabat: {currentRole}
                    </span>
                  </div>

                  <p className="text-xs mb-3 text-muted-foreground leading-relaxed">
                    {inlineAction === "APPROVE" && (
                      <>Sebagai <strong>{currentRole}</strong>, Anda akan menyatakan berkas ini valid dan disetujui. Berkas akan dialirkan ke tahapan selanjutnya (Inventori / Penyusunan HPE).</>
                    )}
                    {inlineAction === "REVISE" && (
                      <>Berkas akan dikembalikan ke status <strong>REVISED</strong>. Inisiator usulan akan menerima catatan revisi untuk segera diperbaiki dan diajukan ulang.</>
                    )}
                    {inlineAction === "REJECT" && (
                      <>Tindakan penolakan bersifat <strong>FINAL</strong>. Berkas akan diarsipkan dengan status <strong>REJECTED</strong> dan tidak dapat diproses lebih lanjut.</>
                    )}
                    {inlineAction === "SUBMIT" && (
                      <>Berkas akan diajukan ke meja Supervisor / Penanggung Jawab untuk diverifikasi dalam alur persetujuan berjenjang.</>
                    )}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>
                        {inlineAction === "APPROVE" || inlineAction === "SUBMIT"
                          ? "Catatan / Instruksi Tambahan (Opsional):"
                          : inlineAction === "REVISE"
                          ? "Catatan Perbaikan / Arahan Revisi *"
                          : "Alasan Penolakan Berkas *"}
                      </span>
                      {(inlineAction === "REVISE" || inlineAction === "REJECT") && (
                        <span className="text-[10px] text-destructive font-bold uppercase tracking-wider">Wajib Diisi</span>
                      )}
                    </Label>
                    <Textarea
                      rows={3}
                      value={inlineNotes}
                      onChange={(e) => setInlineNotes(e.target.value)}
                      placeholder={
                        inlineAction === "APPROVE"
                          ? "Contoh: Disetujui sesuai spesifikasi dan anggaran PRK 2026."
                          : inlineAction === "REVISE"
                          ? "Contoh: Mohon lengkapi perbandingan harga dan lampirkan manual part turbin..."
                          : inlineAction === "REJECT"
                          ? "Contoh: Anggaran belum tersedia atau spesifikasi tidak memenuhi standar keandalan."
                          : "Tambahkan catatan penyerahan berkas..."
                      }
                      className="text-xs bg-background/90 text-foreground"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-current/15">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setInlineAction(null); setInlineNotes(""); }}
                      className="text-xs"
                    >
                      Batalkan
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isSubmittingAction}
                      onClick={handleExecuteInlineAction}
                      className={`text-xs gap-1.5 font-semibold text-white shadow-md ${
                        inlineAction === "APPROVE"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : inlineAction === "REVISE"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : inlineAction === "REJECT"
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {isSubmittingAction ? (
                        "Memproses..."
                      ) : inlineAction === "APPROVE" ? (
                        <>
                          <Check className="w-4 h-4" /> Ya, Setujui Berkas Sekarang
                        </>
                      ) : inlineAction === "REVISE" ? (
                        <>
                          <RotateCcw className="w-4 h-4" /> Kirimkan Permintaan Revisi
                        </>
                      ) : inlineAction === "REJECT" ? (
                        <>
                          <XCircle className="w-4 h-4" /> Konfirmasi Tolak Berkas
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Kirim untuk Persetujuan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION PANEL FOOTER */}
            <div className="bg-muted/30 p-4 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRequest(null);
                  setInlineAction(null);
                  setInlineNotes("");
                }}
                className="text-xs font-semibold"
              >
                Tutup
              </Button>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* 1. Jika DRAFT / REVISED: Tombol Send For Approval */}
                {(String(selectedRequest.current_status) === "DRAFT" ||
                  String(selectedRequest.current_status) === "REVISED") && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setInlineAction("SUBMIT");
                      setInlineNotes("");
                    }}
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Kirim untuk Persetujuan
                  </Button>
                )}

                {/* 2. Jika IN_APPROVAL dan user berwenang (SPV, MGR, GM, ADMIN) */}
                {String(selectedRequest.current_status) === "IN_APPROVAL" && canApprove && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInlineAction("REVISE");
                        setInlineNotes("");
                      }}
                      className="gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-700 font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Minta Revisi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInlineAction("REJECT");
                        setInlineNotes("");
                      }}
                      className="gap-1.5 text-xs text-rose-700 border-rose-300 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-700 font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak Usulan
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setInlineAction("APPROVE");
                        setInlineNotes("");
                      }}
                      className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui (Approve)
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* STANDALONE ACTION MODAL (FOR DIRECT ACTIONS FROM TABLE LIST) */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open: false })}
      >
        <DialogContent size="xl" className="max-w-xl p-0 border border-border/80 shadow-2xl rounded-2xl overflow-hidden">
          <div className={`p-5 border-b border-border/60 ${
            actionDialog.type === "APPROVE"
              ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
              : actionDialog.type === "REVISE"
              ? "bg-amber-500/10 text-amber-950 dark:text-amber-200"
              : actionDialog.type === "REJECT"
              ? "bg-rose-500/10 text-rose-950 dark:text-rose-200"
              : "bg-blue-500/10 text-blue-950 dark:text-blue-200"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-background/80 flex items-center justify-center font-bold shadow-xs">
                {actionDialog.type === "APPROVE" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                {actionDialog.type === "REVISE" && <RotateCcw className="h-5 w-5 text-amber-600" />}
                {actionDialog.type === "REJECT" && <XCircle className="h-5 w-5 text-rose-600" />}
                {actionDialog.type === "SUBMIT" && <Send className="h-5 w-5 text-blue-600" />}
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {actionDialog.type === "APPROVE" && "Konfirmasi Persetujuan Usulan"}
                  {actionDialog.type === "REVISE" && "Kembalikan Berkas untuk Revisi"}
                  {actionDialog.type === "REJECT" && "Penolakan Berkas Usulan"}
                  {actionDialog.type === "SUBMIT" && "Kirim Usulan untuk Persetujuan"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Nomor Berkas: <strong>{actionDialog.targetRequest?.request_number}</strong>
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 text-xs">
            {/* Quick Summary Pill */}
            <div className="p-3 rounded-xl border border-border/70 bg-card/60 space-y-1">
              <div className="font-semibold text-foreground text-xs">{actionDialog.targetRequest?.title}</div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                <span>Rencana Anggaran (RAB):</span>
                <span className="font-bold text-primary font-mono">{formatCurrency(actionDialog.targetRequest?.rab_amount || 0)}</span>
              </div>
            </div>

            {actionDialog.type === "APPROVE" && (
              <p className="text-muted-foreground leading-relaxed">
                Apakah Anda yakin menyetujui usulan ini sebagai <strong>{currentRole}</strong>?
                Setelah disetujui, berkas akan diteruskan ke tahapan selanjutnya (Inventori / HPE).
              </p>
            )}

            {actionDialog.type === "REVISE" && (
              <p className="text-muted-foreground leading-relaxed">
                Masukkan catatan perbaikan atau klarifikasi yang perlu diperbaiki oleh inisiator:
              </p>
            )}

            {actionDialog.type === "REJECT" && (
              <p className="text-muted-foreground leading-relaxed">
                Berikan penjelasan atau dasar penolakan usulan ini. Berkas yang ditolak tidak dapat diproses lebih lanjut:
              </p>
            )}

            {actionDialog.type === "SUBMIT" && (
              <p className="text-muted-foreground leading-relaxed">
                Berkas akan dikirimkan ke meja Supervisor untuk diverifikasi dan disetujui.
              </p>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>
                  {actionDialog.type === "APPROVE" || actionDialog.type === "SUBMIT"
                    ? "Catatan Tambahan (Opsional)"
                    : actionDialog.type === "REVISE"
                    ? "Catatan Perbaikan / Saran Revisi *"
                    : "Alasan Penolakan Berkas *"}
                </span>
                {(actionDialog.type === "REVISE" || actionDialog.type === "REJECT") && (
                  <span className="text-[10px] text-destructive font-bold uppercase">Wajib Diisi</span>
                )}
              </Label>
              <Textarea
                rows={3}
                required={actionDialog.type === "REVISE" || actionDialog.type === "REJECT"}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionDialog.type === "REVISE"
                    ? "Tuliskan rincian perbaikan spesifikasi / harga yang perlu disesuaikan..."
                    : actionDialog.type === "REJECT"
                    ? "Tuliskan alasan penolakan berkas..."
                    : "Catatan peninjauan..."
                }
                className="text-xs"
              />
            </div>
          </div>

          <div className="bg-muted/30 p-4 border-t border-border/70 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActionDialog({ ...actionDialog, open: false })}
              className="text-xs font-semibold"
            >
              Batalkan
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmittingAction}
              onClick={handleExecuteAction}
              className={`text-xs gap-1.5 font-semibold text-white shadow-md ${
                actionDialog.type === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : actionDialog.type === "REVISE"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : actionDialog.type === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmittingAction
                ? "Memproses..."
                : actionDialog.type === "APPROVE"
                ? "Ya, Setujui Berkas"
                : actionDialog.type === "REVISE"
                ? "Kirim Permintaan Revisi"
                : actionDialog.type === "REJECT"
                ? "Tolak Berkas Ini"
                : "Kirim Sekarang"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

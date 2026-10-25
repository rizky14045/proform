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

  // Open Approval Action Dialog
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

  // Execute Approval Action (Submit, Approve, Revise, Reject)
  const handleExecuteAction = async () => {
    const { type, targetRequest } = actionDialog;
    if (!targetRequest) return;

    if ((type === "REVISE" || type === "REJECT") && !actionNotes.trim()) {
      toast.error(
        type === "REVISE"
          ? "Catatan perbaikan / revisi wajib diisi"
          : "Alasan penolakan berkas wajib diisi"
      );
      return;
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
          await procurementService.submitForApproval(targetRequest.id, actionNotes);
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
          await procurementService.approve(targetRequest.id, actionNotes);
        } catch (e) {}
      } else if (type === "REVISE") {
        newStatus = "REVISED";
        stageName = currentRole.includes("MGR") ? "REVISI_MANAGER" : "REVISI_SPV";
        try {
          await procurementService.revise(targetRequest.id, actionNotes);
        } catch (e) {}
      } else if (type === "REJECT") {
        newStatus = "REJECTED";
        stageName = currentRole.includes("MGR") ? "PENOLAKAN_MANAGER" : "PENOLAKAN_SPV";
        try {
          await procurementService.reject(targetRequest.id, actionNotes);
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
        evaluation_notes: actionNotes || (type === "APPROVE" ? "Disetujui" : "Diajukan"),
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

      setActionDialog({ open: false, type: "APPROVE", targetRequest: null });
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses aksi persetujuan");
    } finally {
      setIsSubmittingAction(false);
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Formulir Usulan Permintaan Material / Jasa (UPM I)
                </DialogTitle>
                <DialogDescription>
                  Pengisian berkas usulan kebutuhan operasional pembangkit sesuai User Manual Bab 4.6
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nomor Usulan / Nota Dinas</Label>
                    <Input
                      placeholder="Otomatis jika dikosongkan..."
                      value={formData.request_number}
                      onChange={(e) => setFormData({ ...formData, request_number: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">No. Work Order (WO Ellipse)</Label>
                    <Input
                      placeholder="Contoh: WO-2026-0812"
                      value={formData.wo_number}
                      onChange={(e) => setFormData({ ...formData, wo_number: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">No. PRK Anggaran</Label>
                    <Input
                      placeholder="Contoh: PRK-2026-004"
                      value={formData.prk_number}
                      onChange={(e) => setFormData({ ...formData, prk_number: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Judul / Perihal Pengadaan *</Label>
                  <Input
                    required
                    placeholder="Contoh: Pengadaan Spare Part Filter Udara Gas Turbine Sembalang"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Jenis Pengadaan</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                      value={formData.contract_type}
                      onChange={(e: any) => setFormData({ ...formData, contract_type: e.target.value })}
                    >
                      <option value="BARANG">Barang (Material & Spare Part)</option>
                      <option value="JASA">Jasa Pemborongan / Jasa Lainnya</option>
                      <option value="KONSULTANSI">Jasa Konsultansi</option>
                      <option value="SEWA">Sewa Peralatan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tingkat Prioritas</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                      value={formData.priority}
                      onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent (Operasional Mendesak)</option>
                      <option value="EMERGENCY">Emergency (Darurat Pembangkit)</option>
                    </select>
                  </div>
                </div>

                {/* Items Line Table */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold">Rincian Barang / Jasa Yang Diminta</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddItem}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Baris
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formData.items?.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <div className="md:col-span-5">
                            <Input
                              placeholder="Nama Item / Jasa *"
                              required
                              value={item.item_name}
                              onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                              className="text-xs h-8"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="number"
                              placeholder="Qty"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(idx, "quantity", parseFloat(e.target.value) || 0)
                              }
                              className="text-xs h-8"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              placeholder="Satuan (PCS/EA)"
                              required
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="text-xs h-8"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              type="number"
                              placeholder="Est. Harga"
                              value={item.estimated_price}
                              onChange={(e) =>
                                handleItemChange(idx, "estimated_price", parseFloat(e.target.value) || 0)
                              }
                              className="text-xs h-8"
                            />
                          </div>
                          <div className="md:col-span-1 flex items-center justify-end">
                            {formData.items!.length > 1 && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemoveItem(idx)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Input
                          placeholder="Spesifikasi teknis / referensi katalog..."
                          value={item.specification}
                          onChange={(e) => handleItemChange(idx, "specification", e.target.value)}
                          className="text-xs h-7 text-muted-foreground"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2">
                    <span className="text-xs font-semibold">Total Nilai Rencana Anggaran Biaya (RAB):</span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(formData.rab_amount)}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="gap-2">
                    <Send className="w-4 h-4" /> Simpan Draft Usulan
                  </Button>
                </DialogFooter>
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

      {/* DETAILS & AUDIT TRACKER DIALOG */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between gap-2 pr-6">
                <div>
                  <DialogTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Berkas Usulan: {selectedRequest.request_number}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    WO: {selectedRequest.wo_number || "-"} | PRK: {selectedRequest.prk_number || "-"} | Tipe:{" "}
                    {selectedRequest.contract_type}
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
              {/* Header Box */}
              <div className="p-3 rounded-lg bg-muted/40 border space-y-2">
                <div className="font-bold text-foreground text-sm">{selectedRequest.title}</div>
                <div className="text-muted-foreground leading-relaxed">{selectedRequest.description}</div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground font-medium">Nilai Rencana Anggaran (RAB):</span>
                  <span className="text-primary font-bold text-sm">
                    {formatCurrency(selectedRequest.rab_amount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-xs text-foreground">Rincian Item Kebutuhan:</div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="p-2">Nama Barang / Jasa</th>
                          <th className="p-2">Spesifikasi Teknik</th>
                          <th className="p-2 text-center">Volume</th>
                          <th className="p-2 text-right">Est. Harga</th>
                          <th className="p-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedRequest.items.map((it, i) => (
                          <tr key={i}>
                            <td className="p-2 font-medium text-foreground">{it.item_name}</td>
                            <td className="p-2 text-muted-foreground">{it.specification || "-"}</td>
                            <td className="p-2 text-center font-mono">
                              {it.quantity} {it.unit}
                            </td>
                            <td className="p-2 text-right font-mono">{formatCurrency(it.estimated_price)}</td>
                            <td className="p-2 text-right font-bold text-foreground font-mono">
                              {formatCurrency(it.quantity * it.estimated_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: WORKFLOW AUDIT TRACKER (Sesuai MD Bab 6) */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" />
                    Jejak Audit & Riwayat Persetujuan (*Approval Workflow*)
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Tahap: <strong>{selectedRequest.current_step || "USULAN_PERMINTAAN_I"}</strong>
                  </span>
                </div>

                {(!selectedRequest.histories || selectedRequest.histories.length === 0) ? (
                  <div className="p-4 rounded-lg bg-muted/20 text-center text-muted-foreground border border-dashed">
                    Berkas ini masih berstatus Draft dan belum pernah diajukan ke meja persetujuan.
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
            </div>

            {/* ACTION PANEL FOOTER */}
            <DialogFooter className="border-t pt-3 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Tutup
              </Button>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 1. Jika DRAFT / REVISED: Tombol Send For Approval */}
                {(String(selectedRequest.current_status) === "DRAFT" ||
                  String(selectedRequest.current_status) === "REVISED") && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenAction("SUBMIT", selectedRequest)}
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
                      onClick={() => handleOpenAction("REVISE", selectedRequest)}
                      className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Minta Revisi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenAction("REJECT", selectedRequest)}
                      className="gap-1 text-rose-600 border-rose-300 hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak Usulan
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAction("APPROVE", selectedRequest)}
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui (Approve)
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CONFIRMATION / ACTION MODAL (APPROVE, REVISE, REJECT, SUBMIT) */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !open && setActionDialog({ ...actionDialog, open: false })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {actionDialog.type === "APPROVE" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Konfirmasi Persetujuan Usulan
                </>
              )}
              {actionDialog.type === "REVISE" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Kembalikan Berkas untuk Revisi
                </>
              )}
              {actionDialog.type === "REJECT" && (
                <>
                  <XCircle className="h-5 w-5 text-rose-600" />
                  Penolakan Berkas Usulan
                </>
              )}
              {actionDialog.type === "SUBMIT" && (
                <>
                  <Send className="h-5 w-5 text-blue-600" />
                  Kirim Usulan untuk Persetujuan
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Nomor Berkas: <strong>{actionDialog.targetRequest?.request_number}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {actionDialog.type === "APPROVE" && (
              <p className="text-muted-foreground">
                Apakah Anda yakin menyetujui usulan ini sebagai <strong>{currentRole}</strong>?
                Setelah disetujui, berkas akan diteruskan ke tahapan selanjutnya (Inventori / HPE).
              </p>
            )}

            {actionDialog.type === "REVISE" && (
              <p className="text-muted-foreground">
                Masukkan catatan perbaikan atau klarifikasi yang perlu diperbaiki oleh inisiator:
              </p>
            )}

            {actionDialog.type === "REJECT" && (
              <p className="text-muted-foreground">
                Berikan penjelasan atau dasar penolakan usulan ini. Berkas yang ditolak tidak dapat diproses lebih lanjut:
              </p>
            )}

            {actionDialog.type === "SUBMIT" && (
              <p className="text-muted-foreground">
                Berkas akan dikirimkan ke meja Supervisor untuk diverifikasi dan disetujui.
              </p>
            )}

            <div>
              <Label className="text-xs font-semibold">
                {actionDialog.type === "APPROVE" || actionDialog.type === "SUBMIT"
                  ? "Catatan Tambahan (Opsional)"
                  : actionDialog.type === "REVISE"
                  ? "Catatan Perbaikan / Saran Revisi *"
                  : "Alasan Penolakan Berkas *"}
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
                className="text-xs mt-1"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActionDialog({ ...actionDialog, open: false })}
            >
              Batalkan
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmittingAction}
              onClick={handleExecuteAction}
              className={
                actionDialog.type === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : actionDialog.type === "REVISE"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : actionDialog.type === "REJECT"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

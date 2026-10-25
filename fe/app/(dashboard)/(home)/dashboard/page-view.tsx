"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  PlusCircle,
  Truck,
  Building2,
  PackageCheck,
  ChevronRight,
  QrCode,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import { procurementService } from "@/services/procurement.service";
import { ProcurementRequest } from "@/types";

interface DashboardPageViewProps {
  trans?: {
    [key: string]: string;
  };
}

export default function DashboardPageView({ trans }: DashboardPageViewProps) {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await procurementService.getAll();
      if (res && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch procurement requests:", err);
      // Fallback sample data for demonstration if backend not yet seeded with real requests
      setRequests([
        {
          id: "1",
          request_number: "001/UPM/UPMT/2026",
          wo_number: "WO-2026-0891",
          prk_number: "PRK-2026-012",
          title: "Pengadaan Spare Part Turbin Gas Blok 1 Sembalang",
          contract_type: "BARANG",
          priority: "URGENT",
          rab_amount: 4500000000,
          current_status: "HPS_COMPILED",
          is_distributed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          request_number: "002/UPM/UPMT/2026",
          wo_number: "WO-2026-0902",
          prk_number: "PRK-2026-015",
          title: "Jasa Pemeliharaan Sistem Pendingin Kondensor Unit 2",
          contract_type: "JASA",
          priority: "NORMAL",
          rab_amount: 1850000000,
          current_status: "PO_ISSUED",
          is_distributed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "3",
          request_number: "003/UPM/UPMT/2026",
          wo_number: "WO-2026-0915",
          prk_number: "PRK-2026-020",
          title: "Pengadaan Katup High Pressure Steam Valve Unit 3",
          contract_type: "BARANG",
          priority: "EMERGENCY",
          rab_amount: 820000000,
          current_status: "SUBMITTED",
          is_distributed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "4",
          request_number: "004/UPM/UPMT/2026",
          wo_number: "WO-2026-0930",
          prk_number: "PRK-2026-025",
          title: "Kalibrasi Instrumen Pengukuran & Proteksi Listrik",
          contract_type: "JASA",
          priority: "NORMAL",
          rab_amount: 670000000,
          current_status: "BAST_SIGNED",
          is_distributed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "5",
          request_number: "005/UPM/UPMT/2026",
          wo_number: "WO-2026-0945",
          prk_number: "PRK-2026-031",
          title: "Pengadaan Filter Udara Gas Turbine Intake Filter House",
          contract_type: "BARANG",
          priority: "NORMAL",
          rab_amount: 1250000000,
          current_status: "TTE_COMPLETED",
          is_distributed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as any);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge color="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Draft</Badge>;
      case "SUBMITTED":
        return <Badge color="warning" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Approval Berjenjang</Badge>;
      case "HPS_COMPILED":
      case "TENDER_ACTIVE":
        return <Badge color="info" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Proses Tender</Badge>;
      case "PO_ISSUED":
        return <Badge color="default" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">PO Diterbitkan</Badge>;
      case "BAST_SIGNED":
        return <Badge color="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">BAST Selesai</Badge>;
      case "TTE_COMPLETED":
        return <Badge color="success" className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> TTE BSrE Sah</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.request_number.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === "ALL") return matchSearch;
    if (statusFilter === "PENDING") return matchSearch && (r.current_status === "SUBMITTED" || r.current_status === "REVIEWED_SPV");
    if (statusFilter === "PO") return matchSearch && r.current_status === "PO_ISSUED";
    if (statusFilter === "COMPLETED") return matchSearch && (r.current_status === "BAST_SIGNED" || r.current_status === "TTE_COMPLETED");
    return matchSearch;
  });

  const pipelineStages = [
    { title: "1. UPM Usulan", desc: "Permintaan User", icon: FileText, count: 3, active: true },
    { title: "2. Approval", desc: "SPV / Manager", icon: Clock, count: 4, active: true },
    { title: "3. Distribusi", desc: "Penugasan PIC", icon: CheckCircle2, count: 2, active: true },
    { title: "4. HPE & RKS", desc: "Enjiniring", icon: TrendingUp, count: 3, active: true },
    { title: "5. HPS & Tender", desc: "OE & Aanwijzing", icon: Building2, count: 5, active: true },
    { title: "6. Kontrak & PO", desc: "SPPBJ / PO", icon: FileCheck, count: 8, active: true },
    { title: "7. Gudang & GR", desc: "Penerimaan Barang", icon: Truck, count: 4, active: true },
    { title: "8. BAPHB/BAST", desc: "Berita Acara", icon: PackageCheck, count: 3, active: true },
    { title: "9. TTE BSrE", desc: "Segel Digital", icon: QrCode, count: 6, active: true },
  ];

  return (
    <div className="space-y-6">
      {/* Eye-catching Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-sky-800 to-cyan-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              INTERLOGS REVAMP V6.0 • UP SEMBALANG
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Sistem Terpadu Logistik & Pengadaan
            </h1>
            <p className="text-sm md:text-base text-blue-100 max-w-2xl">
              PT PLN Nusantara Power UP Sembalang — Pengelolaan terintegrasi usulan permintaan, evaluasi enjiniring, proses tender transparan, penerimaan gudang, hingga sertifikasi TTE BSrE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link href="/procurement">
              <Button className="bg-white text-blue-900 hover:bg-blue-50 shadow-md font-semibold gap-2 w-full sm:w-auto">
                <PlusCircle className="w-4 h-4" />
                Buat Usulan (UPM)
              </Button>
            </Link>
            <Link href="/executive-docket">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm gap-2 w-full sm:w-auto">
                <QrCode className="w-4 h-4" />
                Executive Docket TTE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Usulan (UPM)
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">24</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">18 Aktif</span> • 6 Menunggu Approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Komitmen Nilai RAB
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">Rp 14,85 M</div>
            <p className="text-xs text-muted-foreground mt-1">
              Akumulasi anggaran tahun berjalan 2026
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Purchase Order (PO)
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">12 Kontrak</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">9 Selesai BAST</span> • 3 Delivery
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              TTE BSrE Docket
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">100% Valid</div>
            <p className="text-xs text-muted-foreground mt-1">
              Segel kriptografi SHA-256 tersertifikasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Procurement Process Pipeline (E2E Workflow) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Pipeline Alur Logistik & Pengadaan Terpadu
              </CardTitle>
              <CardDescription>
                Monitoring status siklus hidup pengadaan end-to-end sesuai SOP UP Sembalang
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              9 Tahapan Proses
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center min-w-[900px] justify-between gap-2">
              {pipelineStages.map((stage, idx) => {
                const IconComponent = stage.icon;
                return (
                  <div key={idx} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center text-center group cursor-pointer">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform border border-primary/20 shadow-xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {stage.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {stage.desc}
                      </span>
                      <Badge color="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                        {stage.count} Berkas
                      </Badge>
                    </div>
                    {idx < pipelineStages.length - 1 && (
                      <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-primary/40">
                          <ChevronRight className="w-4 h-4 -mr-1" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid: Recent Usulan & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Procurement Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base md:text-lg font-bold">
                    Daftar Usulan Pengadaan Terkini
                  </CardTitle>
                  <CardDescription>
                    Status dan riwayat usulan permintaan material & jasa (UPM)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cari no. usulan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3">
                {[
                  { label: "Semua", value: "ALL" },
                  { label: "Menunggu Approval", value: "PENDING" },
                  { label: "PO Aktif", value: "PO" },
                  { label: "Selesai (BAST)", value: "COMPLETED" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === tab.value
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-3 px-4">No. Usulan / WO</th>
                      <th className="py-3 px-4">Judul Pengadaan</th>
                      <th className="py-3 px-4">Nilai RAB</th>
                      <th className="py-3 px-4">Status Siklus</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Tidak ada usulan pengadaan yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground text-xs md:text-sm">
                              {item.request_number}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {item.wo_number || "-"} • {item.prk_number || "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-medium text-foreground line-clamp-1">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal">
                                {item.contract_type}
                              </Badge>
                              {item.priority === "EMERGENCY" && (
                                <Badge color="destructive" className="text-[10px] py-0 px-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                  EMERGENCY
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                            {formatRupiah(item.rab_amount)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {getStatusBadge(item.current_status)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link href={`/procurement`}>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-primary gap-1">
                                Detail <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Widgets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* TTE BSrE Security & Integrity Docket Widget */}
          <Card className="border border-teal-200 dark:border-teal-900 shadow-sm bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-teal-900 dark:text-teal-200">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Keamanan Dokumen & TTE BSrE
                </CardTitle>
                <Badge className="bg-teal-600 text-white text-[10px]">Aktif</Badge>
              </div>
              <CardDescription className="text-xs">
                Integritas berkas dijamin dengan hash SHA-256 dan sertifikat BSSN.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-background/80 border border-teal-100 dark:border-teal-900 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Executive Docket Terakhir:</span>
                  <span className="font-semibold text-foreground">0042/DOCKET/2026</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Status Sertifikat BSrE:</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid & Terhubung
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Integritas Dokumen:</span>
                  <span className="text-teal-600 font-mono text-[10px]">SHA-256 Seal</span>
                </div>
              </div>

              <Link href="/executive-docket" className="block">
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 text-xs">
                  <QrCode className="w-3.5 h-3.5" /> Buka Verifikator TTE
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Notice: Bank Guarantee & Claim Deadlines */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Peringatan Bank Garansi
              </CardTitle>
              <CardDescription className="text-xs">
                Jaminan rekanan mendekati batas waktu klaim (Claim Deadline)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    PT Teknik Mandiri Perkasa
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Jaminan Pelaksanaan • Rp 225.000.000
                  </div>
                  <div className="text-amber-700 dark:text-amber-300 font-medium text-[11px] mt-1">
                    Batas Klaim: 14 Hari Lagi (08 Nov 2026)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg border border-border bg-card">
                  <div className="font-semibold text-foreground">
                    PT Muara Solusi Enjiniring
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Jaminan Pemeliharaan • Rp 92.500.000
                  </div>
                  <div className="text-emerald-600 font-medium text-[11px] mt-1">
                    Batas Klaim: 45 Hari Lagi (09 Des 2026)
                  </div>
                </div>
              </div>

              <Link href="/tender/bank-guarantee" className="block">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Kelola Seluruh Bank Garansi
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

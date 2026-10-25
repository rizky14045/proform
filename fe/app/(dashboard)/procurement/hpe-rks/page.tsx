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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  TrendingUp,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { hpeService } from "@/services/modules.service";
import { EngineeringEstimate } from "@/types";
import toast from "react-hot-toast";

export default function HpeRksPage() {
  const [estimates, setEstimates] = useState<EngineeringEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await hpeService.getAllHPE(search);
      if (res?.data) {
        setEstimates(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Harga Perkiraan Enjiniring (HPE) & Dokumen RKS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penyusunan estimasi biaya teknis dan dokumen Rencana Kerja & Syarat-syarat (RKS) UP Muara Tawar
          </p>
        </div>
        <Button
          onClick={() =>
            toast("Perhatian: Dokumen HPE & RKS hanya dapat disusun dari Usulan Pengadaan (UPM) yang telah disetujui (Approved). Belum ada usulan yang siap diproses.", {
              icon: "⚠️",
              style: {
                border: "1px solid #f59e0b",
                padding: "12px 16px",
                color: "#b45309",
                background: "#fffbeb",
                fontSize: "13px",
              },
              duration: 4500,
            })
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Buat Draft HPE Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Dokumen HPE</p>
            <h3 className="text-2xl font-bold mt-1">{estimates.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Draft / Review</p>
            <h3 className="text-2xl font-bold mt-1">
              {estimates.filter((e) => e.status === "DRAFT").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">HPE Disetujui</p>
            <h3 className="text-2xl font-bold mt-1">
              {estimates.filter((e) => e.status === "APPROVED").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Nilai HPE</p>
            <h3 className="text-base font-bold mt-1">
              {formatRupiah(estimates.reduce((acc, curr) => acc + (curr.total_hpe || 0), 0))}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">Daftar HPE & RKS Terdaftar</CardTitle>
              <CardDescription>
                Daftar analisis harga perkiraan enjiniring dan kelengkapan dokumen RKS
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor / judul..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">No. HPE</th>
                  <th className="py-3 px-4">Referensi Usulan</th>
                  <th className="py-3 px-4">Total Nilai HPE</th>
                  <th className="py-3 px-4">Status Dokumen</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Memuat data HPE & RKS...
                    </td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl max-w-md mx-auto">
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                        <p className="font-bold text-sm text-foreground">Data HPE & RKS Masih Kosong</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
                          Penyusunan Harga Perkiraan Enjiniring (HPE) dan RKS memerlukan Usulan Pengadaan (UPM) yang telah berstatus disetujui (Approved).
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-4 gap-2 text-xs border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/50">
                          <Link href="/procurement">
                            Lihat Daftar Usulan Pengadaan (UPM)
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  estimates.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-xs">
                        {item.hpe_number || "DRAFT-HPE"}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item.procurement_request?.request_number || item.request_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary">
                        {formatRupiah(item.total_hpe || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge color={item.status === "APPROVED" ? "success" : "secondary"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                          <Eye className="h-3.5 w-3.5" /> Detail
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
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Gavel,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import { oeService } from "@/services/modules.service";
import { OwnerEstimate } from "@/types";
import toast from "react-hot-toast";

export default function TenderSourcingPage() {
  const [oeList, setOeList] = useState<OwnerEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await oeService.getAllOE(search);
      if (res?.data) {
        setOeList(res.data);
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
            Proses Tender & Sourcing (HPS & BAPP)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan Harga Perkiraan Sendiri (HPS / Owner Estimate), Berita Acara Tender, dan Jaminan Bank Garansi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              toast("Perhatian: Belum ada paket RKS yang siap ditenderkan. Proses Tender hanya dapat dibuka dari dokumen RKS & HPE yang telah disahkan.", {
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
            <Gavel className="h-4 w-4" /> Buka Tender Baru
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Paket Tender</p>
            <h3 className="text-2xl font-bold mt-1">{oeList.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Proses Evaluasi Penawaran</p>
            <h3 className="text-2xl font-bold mt-1">
              {oeList.filter((e) => e.status === "DRAFT").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Tender Selesai (BAEP)</p>
            <h3 className="text-2xl font-bold mt-1">
              {oeList.filter((e) => e.status === "APPROVED").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-sky-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Bank Garansi Terverifikasi</p>
            <h3 className="text-2xl font-bold mt-1">100%</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">Daftar Paket Tender & Owner Estimate (HPS)</CardTitle>
              <CardDescription>
                Daftar paket pengadaan dalam tahapan tender, evaluasi harga penawaran rekanan, dan penetapan pemenang
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tender / no. OE..."
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
                  <th className="py-3 px-4">No. OE / HPS</th>
                  <th className="py-3 px-4">Referensi Usulan</th>
                  <th className="py-3 px-4">Nilai HPS (Owner Estimate)</th>
                  <th className="py-3 px-4">Status Tender</th>
                  <th className="py-3 px-4">Tanggal Pengesahan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Memuat data tender...
                    </td>
                  </tr>
                ) : oeList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl max-w-md mx-auto">
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                        <p className="font-bold text-sm text-foreground">Paket Tender Masih Kosong</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
                          Proses tender pengadaan baru dapat dimulai setelah dokumen RKS dan Estimasi Biaya (HPE) disahkan oleh Tim Perencanaan Enjiniring.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-4 gap-2 text-xs border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/50">
                          <Link href="/procurement/hpe-rks">
                            Periksa Dokumen HPE & RKS
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  oeList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-xs">
                        {item.oe_number || "DRAFT-OE"}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item.procurement_request?.request_number || item.request_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary">
                        {formatRupiah(item.total_oe || 0)}
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
                          <Eye className="h-3.5 w-3.5" /> Detail Berita Acara
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


"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { poService } from "@/services/modules.service";
import { PurchaseOrder } from "@/types";
import toast from "react-hot-toast";

export default function SupplierEvaluationPage() {
  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await poService.getAllPO(search);
      if (res?.data) {
        setPoList(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Evaluasi Kinerja Rekanan (Vendor Rating)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penilaian performa mitra kerja berdasarkan 4 pilar: Kualitas Barang/Jasa, Ketepatan Waktu, K3L, dan Pelayanan
          </p>
        </div>
        <Button
          onClick={() =>
            toast("Perhatian: Belum ada kontrak PO yang berstatus selesai serah terima (BAST). Evaluasi rekanan baru dapat dilakukan setelah pekerjaan/barang diterima 100% oleh gudang.", {
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
          <Award className="h-4 w-4" /> Input Nilai Rekanan
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Kategori Sangat Baik (A)</p>
            <h3 className="text-2xl font-bold mt-1">94%</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Kategori Baik (B)</p>
            <h3 className="text-2xl font-bold mt-1">6%</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Cukup / Perlu Perhatian (C)</p>
            <h3 className="text-2xl font-bold mt-1">0%</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Rekanan Aktif Dinilai</p>
            <h3 className="text-2xl font-bold mt-1">{poList.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">Daftar Kontrak Siap Evaluasi Rekanan</CardTitle>
              <CardDescription>
                Pekerjaan yang telah terbit Berita Acara Serah Terima (BAST) untuk disahkan nilainya oleh Pengguna & Pengadaan
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari rekanan / no. PO..."
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
                  <th className="py-3 px-4">Nama Rekanan / Penyedia</th>
                  <th className="py-3 px-4">No. Kontrak / PO</th>
                  <th className="py-3 px-4">Pekerjaan</th>
                  <th className="py-3 px-4">Skor Mutu</th>
                  <th className="py-3 px-4">Status Evaluasi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Memuat daftar evaluasi rekanan...
                    </td>
                  </tr>
                ) : poList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl max-w-md mx-auto">
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                        <p className="font-bold text-sm text-foreground">Data Evaluasi Rekanan Masih Kosong</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
                          Penilaian performa mitra kerja baru dapat diisi untuk kontrak PO yang telah menyelesaikan tahapan Berita Acara Serah Terima (BAST).
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-4 gap-2 text-xs border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/50">
                          <Link href="/warehouse?tab=acts">
                            Periksa Berita Acara Gudang (BAST)
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  poList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-xs text-foreground">
                        {item.supplier?.name || "PT Mitra PLN Nusantara Power"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {item.po_number || "PO-REF"}
                      </td>
                      <td className="py-3.5 px-4 font-medium max-w-[200px] truncate text-xs">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-500 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> 95.0 / 100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                          Selesai Dievaluasi
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                          Form Penilaian
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


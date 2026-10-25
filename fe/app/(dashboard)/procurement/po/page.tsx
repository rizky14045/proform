"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  Download,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { poService } from "@/services/modules.service";
import { PurchaseOrder } from "@/types";
import toast from "react-hot-toast";

export default function PurchaseOrderPage() {
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
            Purchase Order (PO) & Surat Perjanjian Kontrak
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penerbitan Surat Pesanan Pengadaan, verifikasi kontrak rekanan, dan integrasi pengiriman barang/jasa
          </p>
        </div>
        <Button
          onClick={() =>
            toast("Perhatian: Belum ada paket tender yang siap diterbitkan PO. Penerbitan Purchase Order (PO) memerlukan proses tender yang selesai dan Berita Acara Penetapan Pemenang (BAEP) yang telah disetujui.", {
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
          <Plus className="h-4 w-4" /> Terbitkan PO Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Kontrak / PO</p>
            <h3 className="text-2xl font-bold mt-1">{poList.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Menunggu Penandatanganan</p>
            <h3 className="text-2xl font-bold mt-1">
              {poList.filter((p) => p.status === "DRAFT").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">PO Aktif / Terbit</p>
            <h3 className="text-2xl font-bold mt-1">
              {poList.filter((p) => p.status === "ISSUED" || p.status === "APPROVED").length}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-purple-600">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Nilai Kontrak PO</p>
            <h3 className="text-base font-bold mt-1">
              {formatRupiah(poList.reduce((acc, curr) => acc + (curr.total_amount || 0), 0))}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">Daftar Purchase Order (PO)</CardTitle>
              <CardDescription>
                Daftar pesanan pembelian resmi kepada rekanan pelaksana pekerjaan / pengadaan barang
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari no. PO / rekanan..."
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
                  <th className="py-3 px-4">No. PO</th>
                  <th className="py-3 px-4">Judul Pekerjaan</th>
                  <th className="py-3 px-4">Rekanan Pelaksana</th>
                  <th className="py-3 px-4">Nilai Kontrak</th>
                  <th className="py-3 px-4">Status PO</th>
                  <th className="py-3 px-4">Batas Akhir Kontrak</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Memuat data PO...
                    </td>
                  </tr>
                ) : poList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center p-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl max-w-md mx-auto">
                        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                        <p className="font-bold text-sm text-foreground">Purchase Order (PO) Masih Kosong</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center leading-relaxed">
                          Penerbitan Purchase Order (PO) dan kontrak rekanan baru dapat dilakukan setelah proses tender selesai serta berita acara evaluasi penawaran disahkan.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-4 gap-2 text-xs border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100/50">
                          <Link href="/procurement/tender">
                            Periksa Tahapan Tender
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  poList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-xs">
                        {item.po_number || "DRAFT-PO"}
                      </td>
                      <td className="py-3.5 px-4 font-medium max-w-[220px] truncate">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold">
                        {item.supplier?.name || "PT Rekanan Muara Tawar"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-primary">
                        {formatRupiah(item.total_amount || 0)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge color={item.status === "ISSUED" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {item.delivery_deadline ? new Date(item.delivery_deadline).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                          <Eye className="h-3.5 w-3.5" /> Detail Kontrak
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


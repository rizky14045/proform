"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, Download, Filter, FileSpreadsheet } from "lucide-react";
import { procurementService } from "@/services/procurement.service";
import { ProcurementRequest } from "@/types";
import toast from "react-hot-toast";

export default function ReportMonitoringPage() {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getAll({ search, limit: 100 });
      if (res?.success) {
        setRequests(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat data monitoring pengadaan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
    return true;
  });

  const exportToCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const headers = "Nomor PPA,Judul Pengadaan,Kategori,Pagu Anggaran,Status,Tanggal Pengajuan\n";
    const rows = filteredRequests
      .map(
        (r) =>
          `"${r.request_number}","${r.title.replace(/"/g, '""')}","${r.category}",${r.estimated_budget},"${r.status}","${r.created_at?.split("T")[0]}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Monitoring_Pengadaan_UP_Sembalang_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-primary" />
            Laporan & Monitoring Status Pengadaan (Bab 5.1)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dashboard terintegrasi rekapitulasi siklus pengadaan barang & jasa mulai dari PPA, HPE, Tender, PO, hingga BAST di UP Sembalang
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" /> Ekspor Rekap (.CSV)
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="BARANG">Kategori Barang (Material)</option>
                <option value="JASA">Kategori Jasa (Services)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor atau judul..."
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
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Pagu Anggaran</th>
                  <th className="py-3 px-4">Tgl Usulan</th>
                  <th className="py-3 px-4 text-center">Status Tahapan Siklus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat laporan monitoring...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada data monitoring ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{r.request_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{r.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{r.category}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        Rp {Number(r.estimated_budget).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{r.created_at?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge color={r.status === "APPROVED" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {r.status}
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
    </div>
  );
}

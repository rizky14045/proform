"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, History } from "lucide-react";
import { reportService } from "@/services/modules.service";
import { RevisionLog } from "@/types";
import toast from "react-hot-toast";

export default function LaporanRevisiPage() {
  const [logs, setLogs] = useState<RevisionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getRevisionLogs(search);
      if (res?.success) {
        setLogs(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat laporan revisi dokumen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <History className="w-7 h-7 text-primary" />
            Laporan Revisi Dokumen (Bab 5.2)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jejak rekam perubahan, amandemen, dan catatan pengembalian berkas pengadaan oleh pejabat approval UP Sembalang
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Riwayat Revisi Dokumen Pengadaan</CardTitle>
              <CardDescription className="text-xs">
                Audit trail setiap iterasi perbaikan dokumen PPA, HPE, RKS, HPS, dan Kontrak PO
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari modul atau alasan..."
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
                  <th className="py-3 px-4">Nama Modul</th>
                  <th className="py-3 px-4 text-center">Revisi Ke-</th>
                  <th className="py-3 px-4">Alasan Revisi / Catatan Koreksi</th>
                  <th className="py-3 px-4">Elemen yang Dirubah</th>
                  <th className="py-3 px-4">Pejabat Pengoreksi</th>
                  <th className="py-3 px-4 text-center">Waktu Revisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      Memuat laporan revisi...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Belum ada catatan revisi dokumen yang terekam.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">
                        <Badge variant="outline">{log.module_name}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-destructive">
                        Rev #{log.revision_number}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{log.reason}</td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{log.changed_fields || "-"}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{log.revised_by?.name || "Pejabat Approval"}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {log.created_at?.split("T")[0]}
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

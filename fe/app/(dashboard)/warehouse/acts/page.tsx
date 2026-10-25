"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PackageCheck, Search } from "lucide-react";
import { warehouseService } from "@/services/modules.service";
import { InspectionAcceptanceAct, PaginationMeta } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import { DataTablePagination } from "@/components/data-table-pagination";
import toast from "react-hot-toast";

export default function WarehouseActsPage() {
  const [acts, setActs] = useState<InspectionAcceptanceAct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>();

  useEffect(() => {
    loadData();
  }, [search, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getAllActs({ search, page, limit }).catch(() => null);
      if (res?.data) {
        setActs(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat berkas berita acara");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard
      allowedRoles={[
        "ADMIN",
        "SUPERADMIN",
        "SPV_GUDANG",
        "STAFF_GUDANG",
        "MGR_USER",
        "SPV_USER",
        "STAFF_USER",
        "MGR_LOGISTIK",
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <PackageCheck className="h-6 w-6 text-primary" />
              Berita Acara (BAPHB / BAST)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Pemeriksaan bersama tim inspeksi untuk Berita Acara Penerimaan Hasil Barang (BAPHB) dan Serah Terima Pekerjaan (BAST)
            </p>
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor berita acara..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="text-xs text-muted-foreground self-center">
                Total: <strong className="text-foreground">{acts.length}</strong> Berkas
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                  <tr>
                    <th className="py-3 px-4">No. Berita Acara</th>
                    <th className="py-3 px-4">Jenis Akta</th>
                    <th className="py-3 px-4">Ketua Tim Pemeriksa</th>
                    <th className="py-3 px-4 text-center">Progres</th>
                    <th className="py-3 px-4">Kesimpulan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        Memuat berkas berita acara...
                      </td>
                    </tr>
                  ) : acts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-muted-foreground">
                        Belum ada berkas BAPHB / BAST.
                      </td>
                    </tr>
                  ) : (
                    acts.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{a.act_number}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px]">
                            {a.act_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{a.lead_inspector?.name || "Tim Pemeriksa"}</td>
                        <td className="py-3 px-4 text-center font-semibold">{a.completion_percentage}%</td>
                        <td className="py-3 px-4 font-medium text-emerald-600">{a.conclusion}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge color="secondary" className="text-[10px]">
                            {a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4">
              <DataTablePagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                isLoading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

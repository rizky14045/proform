"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Plus, Clock, CheckCircle2 } from "lucide-react";
import { warehouseService } from "@/services/modules.service";
import { GoodsReceipt } from "@/types";
import { RoleGuard } from "@/components/auth/role-guard";
import toast from "react-hot-toast";

export default function WarehouseReceiptsPage() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getAllReceipts(search).catch(() => ({ data: [] }));
      if (res?.data) setReceipts(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal memuat data penerimaan barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN", "SPV_GUDANG", "STAFF_GUDANG", "MGR_LOGISTIK"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Penerimaan Barang Gudang (Goods Receipt)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Pencatatan material dan peralatan yang masuk dari supplier di Gudang UP Muara Tawar
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor penerimaan / PO..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="text-xs text-muted-foreground self-center">
                Total: <strong className="text-foreground">{receipts.length}</strong> Penerimaan
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                  <tr>
                    <th className="py-3 px-4">No. Penerimaan</th>
                    <th className="py-3 px-4">No. Purchase Order</th>
                    <th className="py-3 px-4">No. Surat Jalan</th>
                    <th className="py-3 px-4">Pemeriksa Gudang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        Memuat data penerimaan barang...
                      </td>
                    </tr>
                  ) : receipts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-muted-foreground">
                        Belum ada data penerimaan barang di gudang.
                      </td>
                    </tr>
                  ) : (
                    receipts.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{r.receipt_number}</td>
                        <td className="py-3 px-4">{r.po?.po_number || "-"}</td>
                        <td className="py-3 px-4">{r.delivery_note_number || "-"}</td>
                        <td className="py-3 px-4">{r.inspector_name || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge color="secondary" className="text-[10px]">
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
    </RoleGuard>
  );
}

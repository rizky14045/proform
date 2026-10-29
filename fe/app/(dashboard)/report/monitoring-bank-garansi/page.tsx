"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clipboard, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { poService } from "@/services/modules.service";
import { BankGuarantee } from "@/types";
import toast from "react-hot-toast";

export default function MonitoringMasaBerlakuBGPage() {
  const [guarantees, setGuarantees] = useState<BankGuarantee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await poService.getAllBankGuarantees(search);
      if (res?.success) {
        setGuarantees(res.data || []);
      }
    } catch {
      toast.error("Gagal memuat monitoring masa berlaku");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung sisa hari sebelum jatuh tempo
  const getDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 0;
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Clipboard className="w-7 h-7 text-primary" />
            Monitoring Masa Berlaku Bank Garansi (Bab 5.4)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Peringatan dini (early warning) jatuh tempo warkat jaminan untuk klaim pencairan atau perpanjangan rekanan UP Sembalang
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Tabel Jatuh Tempo Jaminan</CardTitle>
              <CardDescription className="text-xs">
                Perhatikan notifikasi warna merah untuk jaminan yang akan habis kurang dari 30 hari
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor BG atau bank..."
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
                  <th className="py-3 px-4">No. Warkat</th>
                  <th className="py-3 px-4">Bank Penerbit</th>
                  <th className="py-3 px-4">Jenis Jaminan</th>
                  <th className="py-3 px-4">Nilai Jaminan</th>
                  <th className="py-3 px-4">Jatuh Tempo (Expiry)</th>
                  <th className="py-3 px-4 text-center">Sisa Waktu</th>
                  <th className="py-3 px-4 text-right">Tindakan Mitigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Memuat data jatuh tempo...
                    </td>
                  </tr>
                ) : guarantees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Clipboard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada jaminan bank aktif.
                    </td>
                  </tr>
                ) : (
                  guarantees.map((bg) => {
                    const days = getDaysRemaining(bg.expiry_date);
                    return (
                      <tr key={bg.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{bg.bg_number}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{bg.issuing_bank}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{bg.bg_type}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          Rp {Number(bg.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{bg.expiry_date?.split("T")[0]}</td>
                        <td className="py-3 px-4 text-center">
                          {days <= 30 ? (
                            <Badge color="destructive" className="text-[10px]">
                              {days > 0 ? `${days} Hari Lagi` : "KADALUWARSA"}
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                              {days} Hari Aman
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {days <= 30 ? (
                            <span className="text-xs text-destructive font-bold inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Kirim Surat Peringatan
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Masa Berlaku Aktif
                            </span>
                          )}
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
    </div>
  );
}

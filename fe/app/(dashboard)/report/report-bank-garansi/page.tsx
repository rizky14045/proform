"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Download } from "lucide-react";
import { poService } from "@/services/modules.service";
import { BankGuarantee } from "@/types";
import toast from "react-hot-toast";

export default function ReportBankGaransiPage() {
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
      toast.error("Gagal memuat laporan bank garansi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = () => {
    if (guarantees.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    const headers = "Nomor BG,Bank Penerbit,Jenis Jaminan,Nominal,Tanggal Berlaku,Jatuh Tempo,Status\n";
    const rows = guarantees
      .map(
        (g) =>
          `"${g.bg_number}","${g.issuing_bank}","${g.bg_type}",${g.amount},"${g.effective_date?.split("T")[0]}","${g.expiry_date?.split("T")[0]}","${g.confirmation_status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Bank_Garansi_UP_Sembalang_${new Date().toISOString().split("T")[0]}.csv`);
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
            <Building2 className="w-7 h-7 text-primary" />
            Laporan Rekapitulasi Bank Garansi (Bab 5.3)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap portofolio jaminan penawaran, pelaksanaan, uang muka, dan pemeliharaan rekanan UP Sembalang
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 shadow-sm">
          <Download className="w-4 h-4" /> Ekspor Rekap (.CSV)
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Portofolio Bank Garansi</CardTitle>
              <CardDescription className="text-xs">
                Status jaminan rekanan per bank penerbit dan nomor warkat
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nomor BG..."
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
                  <th className="py-3 px-4">No. Warkat BG</th>
                  <th className="py-3 px-4">Bank Penerbit</th>
                  <th className="py-3 px-4">Jenis Jaminan</th>
                  <th className="py-3 px-4">Nilai Penjaminan</th>
                  <th className="py-3 px-4">Tanggal Berlaku</th>
                  <th className="py-3 px-4">Jatuh Tempo</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Memuat laporan bank garansi...
                    </td>
                  </tr>
                ) : guarantees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      Tidak ada warkat jaminan ditemukan.
                    </td>
                  </tr>
                ) : (
                  guarantees.map((bg) => (
                    <tr key={bg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{bg.bg_number}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{bg.issuing_bank}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{bg.bg_type}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        Rp {Number(bg.amount).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{bg.effective_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-muted-foreground font-semibold">{bg.expiry_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge color={bg.confirmation_status === "VERIFIED_GENUINE" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {bg.confirmation_status}
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

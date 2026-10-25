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
  ShieldCheck,
  QrCode,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Download,
  ExternalLink,
  Plus,
} from "lucide-react";
import { docketService } from "@/services/modules.service";
import { procurementService } from "@/services/procurement.service";
import { ExecutiveDocket, ProcurementRequest } from "@/types";

export default function ExecutiveDocketPage() {
  const [dockets, setDockets] = useState<ExecutiveDocket[]>([]);
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocket, setSelectedDocket] = useState<ExecutiveDocket | null>(null);

  // Sign Modal
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [signingDocket, setSigningDocket] = useState<ExecutiveDocket | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [signing, setSigning] = useState(false);

  // Compile Modal
  const [compileModalOpen, setCompileModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docketsRes, reqsRes] = await Promise.all([
        docketService.getAll().catch(() => ({ data: [] })),
        procurementService.getAll().catch(() => ({ data: [] })),
      ]);
      if (docketsRes?.data) setDockets(docketsRes.data);
      if (reqsRes?.data) setRequests(reqsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCompile = async () => {
    if (!selectedRequestId) return;
    try {
      const res = await docketService.compile(selectedRequestId);
      if (res.success) {
        setCompileModalOpen(false);
        loadData();
      }
    } catch (err: any) {
      alert("Gagal mengompilasi docket: " + err.message);
    }
  };

  const handleSign = async () => {
    if (!signingDocket || !passphrase) return;
    try {
      setSigning(true);
      const res = await docketService.signBSRE(signingDocket.id, passphrase);
      if (res.success) {
        setSignModalOpen(false);
        setPassphrase("");
        loadData();
      }
    } catch (err: any) {
      alert("Gagal melakukan TTE BSrE: " + err.message);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-cyan-900 p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              INTEGRITAS HUKUM & TTE BSRE (BSSN)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Executive Docket & Tanda Tangan Elektronik
            </h1>
            <p className="text-xs md:text-sm text-teal-100 max-w-2xl">
              Kompilasi dokumen pengadaan legal tersertifikasi digital dengan hash SHA-256 dan verifikasi sertifikat BSrE sesuai regulasi PLN Nusantara Power.
            </p>
          </div>

          <Button
            onClick={() => setCompileModalOpen(true)}
            className="bg-white text-teal-900 hover:bg-teal-50 font-semibold gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Kompilasi Docket Baru
          </Button>
        </div>
      </div>

      {/* Dockets Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold">Daftar Berkas Executive Docket</CardTitle>
          <CardDescription>
            Dokumen snapshot pengadaan yang telah disegel dan siap ditandatangani oleh pejabat berwenang
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                <tr>
                  <th className="py-3 px-4">No. Docket</th>
                  <th className="py-3 px-4">Usulan Pengadaan / WO</th>
                  <th className="py-3 px-4">Segel Kriptografi SHA-256</th>
                  <th className="py-3 px-4">Status TTE BSrE</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {dockets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada Executive Docket yang dikompilasi.
                    </td>
                  </tr>
                ) : (
                  dockets.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">
                        {d.docket_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">
                          {d.request?.request_number || "USULAN"}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {d.request?.title || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[10px] text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 p-1 rounded-sm max-w-xs truncate border border-teal-200 dark:border-teal-900">
                          {d.document_hash}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {d.is_signed ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Ditandatangani BSrE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 text-[11px]">
                            Belum Ditandatangani
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDocket(d)}
                            className="h-8 text-xs text-primary gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Lihat Snapshot
                          </Button>
                          {!d.is_signed && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSigningDocket(d);
                                setSignModalOpen(true);
                              }}
                              className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1"
                            >
                              <Fingerprint className="w-3.5 h-3.5" /> Sign BSrE
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sign BSrE Modal */}
      {signModalOpen && (
        <Dialog open={signModalOpen} onOpenChange={setSignModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Pengesahan Tanda Tangan Elektronik (BSrE)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-3 text-xs">
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-1">
                <div className="font-semibold text-foreground">
                  Nomor Docket: {signingDocket?.docket_number}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono truncate">
                  Hash: {signingDocket?.document_hash}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Passphrase Sertifikat BSrE</Label>
                <Input
                  type="password"
                  placeholder="Masukkan passphrase sertifikat digital Anda..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Passphrase digunakan untuk membuka sertifikat digital BSSN yang terdaftar atas NIK Anda.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSignModalOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleSign}
                disabled={signing || !passphrase}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
              >
                {signing ? "Menghubungkan BSrE..." : "Bubuhkan TTE Sah"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Compile Docket Modal */}
      {compileModalOpen && (
        <Dialog open={compileModalOpen} onOpenChange={setCompileModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                Kompilasi Executive Docket Baru
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <Label className="text-xs">Pilih Usulan Pengadaan (UPM)</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
              >
                <option value="">-- Pilih Usulan Pengadaan --</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.request_number} - {r.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Sistem akan membuat berkas rangkuman terenkripsi (JSON snapshot) dan menghasilkan hash SHA-256 yang disegel secara permanen.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompileModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCompile} disabled={!selectedRequestId}>
                Kompilasi & Segel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


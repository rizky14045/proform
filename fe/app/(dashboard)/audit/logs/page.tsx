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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  Search,
  Database,
  ArrowRight,
  User,
  Clock,
  Eye,
  Activity,
  Layers,
  Filter,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { AuditLog } from "@/types";
import toast from "react-hot-toast";

const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-001",
    table_name: "procurement_requests",
    record_id: "req-001",
    action: "UPDATE",
    changed_by: "Budi Santoso (General Manager)",
    ip_address: "10.14.22.105",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    created_at: "2026-10-25T14:35:12Z",
    pre_state: {
      request_number: "0019/UPM/600/UPMT/2026",
      current_step: "USULAN_PERMINTAAN_I",
      current_status: "IN_APPROVAL",
      rab_amount: 145000000,
    },
    post_state: {
      request_number: "0019/UPM/600/UPMT/2026",
      current_step: "INVENTORY",
      current_status: "APPROVED",
      rab_amount: 145000000,
      approved_by: "usr-gm",
      approval_notes: "Disetujui untuk diteruskan ke penyusunan HPE",
    },
  },
  {
    id: "log-002",
    table_name: "procurement_requests",
    record_id: "req-003",
    action: "UPDATE",
    changed_by: "Rizky Pratama (Supervisor Rendal Har)",
    ip_address: "10.14.22.42",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    created_at: "2026-10-25T13:40:22Z",
    pre_state: {
      request_number: "0021/UPM/600/UPMT/2026",
      current_status: "IN_APPROVAL",
    },
    post_state: {
      request_number: "0021/UPM/600/UPMT/2026",
      current_status: "REVISED",
      revision_notes: "Mohon lampirkan sertifikat kesesuaian drawing pompa dan periksa harga pasar",
    },
  },
  {
    id: "log-003",
    table_name: "procurement_requests",
    record_id: "req-005",
    action: "INSERT",
    changed_by: "Dimas Anggara (Staff Enjiniring)",
    ip_address: "10.14.22.88",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: "2026-10-25T11:20:05Z",
    pre_state: null as any,
    post_state: {
      request_number: "0023/UPM/600/UPMT/2026",
      title: "Pengadaan Pelumas Sintetik Turbin Gas (Mobil DTE 832)",
      rab_amount: 85000000,
      current_status: "DRAFT",
      priority: "NORMAL",
    },
  },
  {
    id: "log-004",
    table_name: "engineering_estimates",
    record_id: "hpe-8812",
    action: "INSERT",
    changed_by: "Ilham Ramadhan (Staff Kataloger)",
    ip_address: "10.14.22.50",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2026-10-24T16:15:30Z",
    pre_state: null as any,
    post_state: {
      hpe_number: "0131/HPE/600/UPMT/2026",
      request_id: "req-002",
      total_hpe: 318500000,
      procurement_method: "PENGADAAN_LANGSUNG",
      status: "APPROVED",
    },
  },
  {
    id: "log-005",
    table_name: "purchase_orders",
    record_id: "po-1099",
    action: "UPDATE",
    changed_by: "Bambang Haryanto (Supervisor Pengadaan)",
    ip_address: "10.14.22.75",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: "2026-10-24T14:10:00Z",
    pre_state: {
      po_number: "0005/PO/600/UPMT/2026",
      status: "DRAFT",
    },
    post_state: {
      po_number: "0005/PO/600/UPMT/2026",
      status: "ISSUED",
      supplier_name: "PT Jaya Makmur Sentosa",
      total_amount: 318500000,
      delivery_deadline: "2026-11-30",
    },
  },
  {
    id: "log-006",
    table_name: "users",
    record_id: "usr-admin",
    action: "UPDATE",
    changed_by: "Administrator Sistem",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: "2026-10-24T10:05:44Z",
    pre_state: {
      nid: "admin",
      is_active: true,
      last_login: "2026-10-23T08:00:00Z",
    },
    post_state: {
      nid: "admin",
      is_active: true,
      last_login: "2026-10-24T10:05:44Z",
    },
  },
  {
    id: "log-007",
    table_name: "stock_codes",
    record_id: "sc-9023",
    action: "DELETE",
    changed_by: "Administrator Sistem",
    ip_address: "127.0.0.1",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: "2026-10-23T15:20:10Z",
    pre_state: {
      code: "000099023",
      name: "INSULATOR DISK 150 CFM TRION",
      status: "ACTIVE",
    },
    post_state: {
      code: "000099023",
      deleted_at: "2026-10-23T15:20:10Z",
      deleted_by: "usr-admin",
    },
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const s = search.toLowerCase();
    const matchSearch =
      log.table_name.toLowerCase().includes(s) ||
      log.record_id.toLowerCase().includes(s) ||
      (log.changed_by && log.changed_by.toLowerCase().includes(s)) ||
      (log.ip_address && log.ip_address.includes(s));

    if (!matchSearch) return false;
    if (tableFilter !== "ALL" && log.table_name !== tableFilter) return false;
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
    return true;
  });

  return (
    <RoleGuard allowedRoles={["ADMIN", "SUPERADMIN", "GM", "MGR_LOGISTIK", "MGR_KEUANGAN", "MGR_USER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Audit Logs & Jejak Mutasi Data (*Audit Trail*)
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Pencatatan riwayat perubahan data atomik (INSERT, UPDATE, DELETE), snapshot pre-state & post-state JSONB, IP, dan user agent (MD Bab 2.2)
            </p>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="shadow-sm border border-border">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari tabel, record ID, pengguna, IP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <select
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="ALL">Semua Tabel Database</option>
                  <option value="procurement_requests">procurement_requests</option>
                  <option value="engineering_estimates">engineering_estimates</option>
                  <option value="purchase_orders">purchase_orders</option>
                  <option value="users">users</option>
                  <option value="stock_codes">stock_codes</option>
                </select>

                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  <option value="ALL">Semua Aksi DML</option>
                  <option value="INSERT">INSERT (Tambah Data)</option>
                  <option value="UPDATE">UPDATE (Perubahan Data)</option>
                  <option value="DELETE">DELETE (Penghapusan Data)</option>
                </select>
              </div>

              <div className="text-xs text-muted-foreground self-center">
                Total: <strong className="text-foreground">{filteredLogs.length}</strong> Riwayat Mutasi
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Waktu & Timestamp</th>
                    <th className="py-3 px-4">Tabel Database</th>
                    <th className="py-3 px-4">Tipe Aksi</th>
                    <th className="py-3 px-4">Record ID</th>
                    <th className="py-3 px-4">Diubah Oleh</th>
                    <th className="py-3 px-4">Alamat IP</th>
                    <th className="py-3 px-4 text-center w-28">Snapshot Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-muted-foreground">
                        Tidak ada catatan log audit yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "-"}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          <Badge variant="outline" className="font-mono text-[10px] bg-muted/50">
                            {log.table_name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {log.action === "INSERT" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                              INSERT
                            </Badge>
                          )}
                          {log.action === "UPDATE" && (
                            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-bold">
                              UPDATE
                            </Badge>
                          )}
                          {log.action === "DELETE" && (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
                              DELETE
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {log.record_id}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {log.changed_by || "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {log.ip_address || "127.0.0.1"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-[11px] text-primary hover:text-primary gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Diff State
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

        {/* MODAL SNAPSHOT DIFF JSON */}
        {selectedLog && (
          <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="border-b pb-3">
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Detail Snapshot Audit Log: {selectedLog.table_name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Record ID: <strong className="font-mono">{selectedLog.record_id}</strong> &bull; Aksi:{" "}
                  <strong>{selectedLog.action}</strong> &bull; Oleh: {selectedLog.changed_by}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                {/* Meta Header */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-muted/40 rounded-lg border text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Waktu Mutasi:</span>
                    <strong className="text-foreground">
                      {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString("id-ID") : "-"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Alamat IP Pemanggil:</span>
                    <strong className="text-foreground font-mono">{selectedLog.ip_address}</strong>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-muted-foreground block">Client Browser:</span>
                    <span className="text-foreground line-clamp-1 text-[10px]">
                      {selectedLog.user_agent}
                    </span>
                  </div>
                </div>

                {/* Diff Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pre-State (Sebelum) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-xs text-muted-foreground">
                      <span>Kondisi Awal (Pre-State):</span>
                      <span className="text-[10px] text-amber-600 font-mono">SEBELUM MUTASI</span>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-3 text-slate-100 font-mono text-[11px] overflow-x-auto min-h-[140px] max-h-72 border border-slate-800">
                      {selectedLog.pre_state ? (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.pre_state, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">
                          (Tidak ada pre-state — operasi INSERT data baru)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post-State (Sesudah) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-xs text-foreground">
                      <span>Kondisi Akhir (Post-State):</span>
                      <span className="text-[10px] text-emerald-500 font-mono">SESUDAH MUTASI</span>
                    </div>
                    <div className="rounded-lg bg-slate-950 p-3 text-emerald-300 font-mono text-[11px] overflow-x-auto min-h-[140px] max-h-72 border border-slate-800">
                      {selectedLog.post_state ? (
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.post_state, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">
                          (Tidak ada post-state — operasi DELETE)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </RoleGuard>
  );
}


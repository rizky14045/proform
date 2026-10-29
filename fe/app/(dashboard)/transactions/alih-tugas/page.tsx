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
} from "@/components/ui/dialog";
import { ClipboardList, Plus, UserCheck, Search, ArrowRightLeft, Trash2, Calendar, FileText } from "lucide-react";
import { delegationService, masterService } from "@/services/modules.service";
import { TaskDelegation, User } from "@/types";
import toast from "react-hot-toast";

interface TaskItem {
  id: string;
  task_number: string;
  description: string;
}

export default function AlihTugasPage() {
  const [delegations, setDelegations] = useState<TaskDelegation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Alih Tugas according to PDF Manual 4.1.2
  const [form, setForm] = useState({
    form_number: "ALT-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
    form_date: new Date().toISOString().split("T")[0],
    task_type: "Distribusi Pengadaan",
    original_user_id: "",
    replacement_user_id: "",
    notes: "",
  });

  const [newTaskNumber, setNewTaskNumber] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [taskList, setTaskList] = useState<TaskItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([
        delegationService.getAll(search),
        masterService.getUsers({ limit: 100 }),
      ]);
      if (dRes?.success) setDelegations(dRes.data || []);
      if (uRes?.success) setUsers(uRes.data || []);
    } catch {
      toast.error("Gagal memuat data alih tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      form_number: "ALT-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)),
      form_date: new Date().toISOString().split("T")[0],
      task_type: "Distribusi Pengadaan",
      original_user_id: users[0]?.id || "",
      replacement_user_id: users[1]?.id || "",
      notes: "",
    });
    setTaskList([
      { id: "1", task_number: "REQ-2026-0012", description: "Evaluasi Dokumen Penawaran Rekanan Blok 1" },
    ]);
    setIsDialogOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskNumber) {
      toast.error("Isikan nomor transaksi / tugas");
      return;
    }
    setTaskList([
      ...taskList,
      {
        id: String(Date.now()),
        task_number: newTaskNumber,
        description: newTaskDesc || "Pengalihan proses workflow pengadaan",
      },
    ]);
    setNewTaskNumber("");
    setNewTaskDesc("");
  };

  const handleRemoveTask = (id: string) => {
    setTaskList(taskList.filter((t) => t.id !== id));
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDelegation(false);
  };

  const handlePost = async () => {
    await saveDelegation(true);
  };

  const saveDelegation = async (isPosted: boolean) => {
    if (!form.original_user_id || !form.replacement_user_id) {
      toast.error("Pilih user pembuat dan user pengganti");
      return;
    }
    if (form.original_user_id === form.replacement_user_id) {
      toast.error("User pengganti tidak boleh sama dengan user pembuat");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await delegationService.create({
        ...form,
        status: isPosted ? "ACTIVE" : "DRAFT",
      });
      if (res?.success) {
        toast.success(isPosted ? "Data alih tugas berhasil di-POSTING!" : "Data alih tugas berhasil disimpan sebagai draft!");
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(res?.message || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ArrowRightLeft className="w-7 h-7 text-primary" />
            Alih Tugas (Bab 4.1)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengalihan tugas staf satu ke staf lainnya dalam 1 divisi sebelum pekerjaan dikerjakan di PT PLN Nusantara Power UP Sembalang
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Tambah Alih Tugas Baru
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">List Alih Tugas</CardTitle>
              <CardDescription className="text-xs">
                Daftar transaksi pengalihan penugasan staf yang tercatat pada sistem aplikasi
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Cari user / jenis tugas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 h-9 text-xs rounded-md border border-input bg-background"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/40">
                <tr>
                  <th className="py-3 px-4">Jenis Tugas</th>
                  <th className="py-3 px-4">User Pembuat (Awal)</th>
                  <th className="py-3 px-4">User Pengganti</th>
                  <th className="py-3 px-4">Tanggal Pengalihan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Memuat data alih tugas...</td></tr>
                ) : delegations.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada transaksi alih tugas.</td></tr>
                ) : (
                  delegations.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-semibold text-primary">{d.task_type}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{d.original_user?.name || "Staf Asal"}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{d.replacement_user?.name || "Staf Pengganti"}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={d.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border-none" : "bg-amber-100 text-amber-800 border-none"}>
                          {d.status === "ACTIVE" ? "Diposting (Aktif)" : "Draft"}
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

      {/* DIALOG FORM ALIH TUGAS (Bab 4.1.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent size="4xl" className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 border border-border/80 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-background to-primary/5 p-5 border-b border-border/60">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Form Alih Tugas (Bab 4.1.2)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Form ini bisa mengalihkan pekerjaan hanya bila pekerjaan tersebut belum dikerjakan setelah didistribusikan.
            </p>
          </div>

          <form onSubmit={handleSaveDraft} className="p-6 space-y-6">
            {/* SECTION 1: HEADER & USER PEMBUAT / PENGGANTI */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-primary" />
                1. Data Pengalihan & Staf 1 Divisi
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form (Otomatis Sistem)</Label>
                  <Input
                    value={form.form_number}
                    disabled
                    className="text-xs mt-1 font-mono bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nomor form terbentuk otomatis oleh sistem</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    disabled
                    className="text-xs mt-1 bg-muted/50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Sesuai tanggal pembuatan form dan tidak dapat diubah</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Jenis Tugas yang Dialihkan *</Label>
                <select
                  value={form.task_type}
                  onChange={(e) => setForm({ ...form, task_type: e.target.value })}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                  required
                >
                  <option value="Distribusi Permintaan">Distribusi Permintaan (Rendal Har)</option>
                  <option value="Distribusi Perencana">Distribusi Perencana Pengadaan (Inventori)</option>
                  <option value="Distribusi Pengadaan">Distribusi Pengadaan (Pelaksana Pengadaan)</option>
                  <option value="Distribusi Penerimaan">Distribusi Penerimaan Gudang</option>
                  <option value="Evaluasi Teknis">Evaluasi Teknis</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pilih jenis alur penugasan yang akan dialihkan</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">User Pembuat (Staf Awal) *</Label>
                  <select
                    value={form.original_user_id}
                    onChange={(e) => setForm({ ...form, original_user_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="">-- Pilih User Pembuat --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.nid}) - {u.role?.name || "Staff"}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Nama user pembuat sesuai jenis tugas yang dipilih
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">User Pengganti (Staff 1 Divisi) *</Label>
                  <select
                    value={form.replacement_user_id}
                    onChange={(e) => setForm({ ...form, replacement_user_id: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                    required
                  >
                    <option value="">-- Pilih User Pengganti --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.nid}) - {u.role?.name || "Staff"}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Nama user pengganti yang merupakan staf 1 divisi dengan user pembuat
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: DETAIL FORM (TABEL TUGAS) */}
            <div className="rounded-xl border border-border/70 bg-card/60 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-primary" />
                  2. Detail Form Pekerjaan yang Dialihkan
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <Label className="text-xs font-semibold">Nomor Transaksi / Dokumen</Label>
                  <Input
                    value={newTaskNumber}
                    onChange={(e) => setNewTaskNumber(e.target.value)}
                    placeholder="Contoh: 0019/UPM/600/UPMT/2026"
                    className="mt-1 text-xs h-9 font-mono"
                  />
                </div>
                <div className="md:col-span-5">
                  <Label className="text-xs font-semibold">Keterangan / Uraian Tugas</Label>
                  <Input
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Uraian pekerjaan..."
                    className="mt-1 text-xs h-9"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    onClick={handleAddTask}
                    className="w-full h-9 text-xs gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Tambah]
                  </Button>
                </div>
              </div>

              {/* Tabel Detail */}
              <div className="overflow-x-auto border border-border/50 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Nomor Transaksi</th>
                      <th className="py-2.5 px-3">Uraian Tugas Pekerjaan</th>
                      <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {taskList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          Belum ada tugas ditambahkan ke daftar. Gunakan tombol [Tambah].
                        </td>
                      </tr>
                    ) : (
                      taskList.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-muted/20">
                          <td className="py-2 px-3 text-center font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-primary">{t.task_number}</td>
                          <td className="py-2 px-3 text-foreground">{t.description}</td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTask(t.id)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION FOOTER: [Back], [Save], [Post] */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Back (Kembali)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Save (Simpan Draft)
                </Button>
                <Button
                  type="button"
                  onClick={handlePost}
                  disabled={isSubmitting}
                  className="text-xs font-semibold bg-primary text-primary-foreground"
                >
                  {isSubmitting ? "Memproses..." : "Post (Posting Alih Tugas)"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

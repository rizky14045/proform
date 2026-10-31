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
import {
  Clipboard,
  Search,
  Plus,
  Trash2,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { pengadaanSubmoduleService, oeService } from "@/services/modules.service";
import { QuotationRequest, ProcurementTenderEvent } from "@/types";
import { uploadSecureFile } from "@/lib/file-security";
import { validateForm } from "@/lib/form-validator";
import toast from "react-hot-toast";

interface QnAItem {
  id: string;
  vendor_question: string;
  panitia_answer: string;
}

interface RequiredDocItem {
  id: string;
  doc_name: string;
  doc_type: "ADMINISTRASI" | "TEKNIS" | "HARGA";
  mandatory: boolean;
}

export default function AanwijzingPage() {
  const [events, setEvents] = useState<ProcurementTenderEvent[]>([]);
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pop-up Select Modal for PP
  const [showPpSelectModal, setShowPpSelectModal] = useState(false);
  const [ppFilter, setPpFilter] = useState("");

  // Form Fields per Bab 4.8.6.2
  const [form, setForm] = useState({
    form_number: "",
    form_date: new Date().toISOString().split("T")[0],
    request_id: "",
    pp_id: "",
    selected_pp_display: "",
    work_title: "",
    start_time: "09:00",
    end_time: "12:00",
    location: "Ruang Rapat Pengadaan UP Sembalang / Hybrid Video Conference",
    qa_deadline_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    qa_deadline_time: "16:00",
    cc_recipient: "Manager UP Sembalang, Tim Perencana Enjiniring",
    file_name: "",
    file_uploaded: false,
    status: "PROPOSED",
  });

  // Q&A List
  const [qnaList, setQnaList] = useState<QnAItem[]>([]);
  const [qnaInput, setQnaInput] = useState({
    vendor_question: "",
    panitia_answer: "",
  });

  // Document Requirements Checklist
  const [docList, setDocList] = useState<RequiredDocItem[]>([
    { id: "1", doc_name: "Surat Penawaran Harga Bertandatangan & Bermaterai", doc_type: "HARGA", mandatory: true },
    { id: "2", doc_name: "Spesifikasi Teknis & Brosur / Certificate of Origin", doc_type: "TEKNIS", mandatory: true },
    { id: "3", doc_name: "Surat Jaminan Penawaran / Bank Garansi", doc_type: "ADMINISTRASI", mandatory: true },
  ]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"ADMINISTRASI" | "TEKNIS" | "HARGA">("TEKNIS");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes] = await Promise.all([
        pengadaanSubmoduleService.getQuotations(""),
      ]);
      if (qRes?.success) {
        setQuotations(qRes.data || []);
        if (qRes.data?.[0]?.request_id) {
          const eRes = await oeService.getTenderEventsByRequest(qRes.data[0].request_id);
          if (eRes?.success) setEvents(eRes.data || []);
        }
      }
    } catch {
      toast.error("Gagal memuat risalah aanwijzing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    const autoNumber = `BAA/PLN-SBG/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${Math.floor(100 + Math.random() * 900)}`;
    setForm({
      form_number: autoNumber,
      form_date: new Date().toISOString().split("T")[0],
      request_id: "",
      pp_id: "",
      selected_pp_display: "",
      work_title: "",
      start_time: "09:00",
      end_time: "12:00",
      location: "Ruang Rapat Pengadaan UP Sembalang / Hybrid Video Conference",
      qa_deadline_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      qa_deadline_time: "16:00",
      cc_recipient: "Manager UP Sembalang, Tim Perencana Enjiniring",
      file_name: "",
      file_uploaded: false,
      status: "PROPOSED",
    });
    setQnaList([]);
    setQnaInput({ vendor_question: "", panitia_answer: "" });
    setIsDialogOpen(true);
  };

  const handleSelectPP = (q: QuotationRequest) => {
    setForm((prev) => ({
      ...prev,
      pp_id: q.id,
      request_id: q.request_id || q.id,
      selected_pp_display: `${q.rfq_number} - ${q.request?.title || "Paket Pengadaan"}`,
      work_title: q.request?.title || "Pekerjaan Pengadaan",
    }));
    setShowPpSelectModal(false);
    toast.success(`Dokumen PP ${q.rfq_number} terpilih`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadSecureFile(file);
    if (res.success && res.fileName) {
      setForm((prev) => ({ ...prev, file_name: res.fileName, file_uploaded: true }));
    }
  };

  const handleUploadFile = () => {
    if (!form.file_name) {
      toast.error("Pilih file terlebih dahulu");
    } else {
      toast.success("File telah lolos verifikasi keamanan dan tersimpan");
    }
  };

  const handleAddQnA = () => {
    if (!qnaInput.vendor_question || !qnaInput.panitia_answer) {
      toast.error("Lengkapi pertanyaan dan tanggapan panitia");
      return;
    }
    const newItem: QnAItem = {
      id: String(Date.now()),
      vendor_question: qnaInput.vendor_question,
      panitia_answer: qnaInput.panitia_answer,
    };
    setQnaList((prev) => [...prev, newItem]);
    setQnaInput({ vendor_question: "", panitia_answer: "" });
    toast.success("Risalah tanya jawab ditambahkan ke daftar");
  };

  const handleAddDoc = () => {
    if (!newDocName) {
      toast.error("Masukkan nama dokumen persyaratan");
      return;
    }
    const newDoc: RequiredDocItem = {
      id: String(Date.now()),
      doc_name: newDocName,
      doc_type: newDocType,
      mandatory: true,
    };
    setDocList((prev) => [...prev, newDoc]);
    setNewDocName("");
    toast.success("Dokumen persyaratan ditambahkan");
  };

  const handleSubmit = async (actionType: "SAVE" | "POST") => {
    const validation = validateForm([
      { field: "request_id", label: "Pilihan Dokumen Permintaan Penawaran (PP)", value: form.request_id, required: true },
      { field: "work_title", label: "Nama Pekerjaan Pengadaan", value: form.work_title, required: true, minLength: 5 },
      { field: "form_date", label: "Tanggal Form Aanwijzing", value: form.form_date, required: true, type: "date" },
      { field: "location", label: "Tempat / Media Aanwijzing", value: form.location, required: true, minLength: 3 },
    ]);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const summaryNotes = `Rapat Aanwijzing ${form.work_title}. Tanya jawab: ${qnaList.length} poin. Tempat: ${form.location}`;
      const res = await oeService.createTenderEvent({
        request_id: form.request_id,
        event_type: "AANWIJZING",
        event_date: form.form_date,
        location: form.location,
        minutes_of_meeting: summaryNotes,
        status: actionType === "POST" ? "POSTED" : "DRAFT",
      });
      if (res?.success) {
        toast.success(
          actionType === "POST"
            ? "Berita Acara Aanwijzing berhasil di-POST!"
            : "Berita Acara Aanwijzing berhasil disimpan sebagai Draft"
        );
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

  const handleSendForRevision = () => {
    toast("Form Aanwijzing dikembalikan ke panitia untuk revisi");
    setIsDialogOpen(false);
  };

  const filteredQuotations = quotations.filter(
    (q) =>
      q.rfq_number.toLowerCase().includes(ppFilter.toLowerCase()) ||
      (q.request?.title && q.request.title.toLowerCase().includes(ppFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2 py-0.5">
              PT PLN Nusantara Power UP Sembalang
            </Badge>
            <Badge variant="secondary" className="text-xs">Bab 4.8.6</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 mt-1.5">
            <Clipboard className="w-7 h-7 text-primary" />
            Penjelasan Pengadaan (Aanwijzing)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pemberian penjelasan dokumen RKS, tanya jawab teknis rekanan, dan penerbitan Berita Acara Aanwijzing (FMT-06.1.2.1.5)
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Catat BA Aanwijzing
        </Button>
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Berita Acara Aanwijzing (BAA)</CardTitle>
              <CardDescription className="text-xs">
                Dokumentasi tanya jawab, klarifikasi teknis KAK, dan konfirmasi rekanan
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 max-w-sm w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari berita acara aanwijzing..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData()}
                  className="pl-9 text-xs h-9"
                />
              </div>
              <Button size="sm" variant="outline" onClick={fetchData} className="text-xs h-9">
                Cari
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Tipe Kegiatan</th>
                  <th className="py-3 px-4">Tanggal Rapat</th>
                  <th className="py-3 px-4">Lokasi Rapat</th>
                  <th className="py-3 px-4">Risalah Tanya Jawab</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Memuat data aanwijzing...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Belum ada berita acara aanwijzing yang didaftarkan.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-primary font-mono">{ev.event_type}</td>
                      <td className="py-3 px-4 text-muted-foreground">{ev.event_date?.split("T")[0]}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{ev.location}</td>
                      <td className="py-3 px-4 text-muted-foreground max-w-md truncate">
                        {ev.minutes_of_meeting || "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          {ev.status || "POSTED"}
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

      {/* MODAL FORM PENJELASAN PENGADAAN (BAB 4.8.6.2) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <Clipboard className="w-5 h-5 text-primary" />
                  Form Penjelasan Pengadaan (Aanwijzing)
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bab 4.8.6.2 — Berita Acara Pemberian Penjelasan Teknis & Administratif RKS (FMT-06.1.2.1.5)
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                UP Sembalang
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 pt-3">
            {/* SECTION 1: HEADER INFORMASI POKOK */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Identitas Dokumen Aanwijzing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Nomor Form / Berita Acara *</Label>
                  <Input
                    value={form.form_number}
                    readOnly
                    className="mt-1.5 text-xs h-9 bg-muted/60 font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Terbentuk otomatis oleh sistem</span>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tanggal Form *</Label>
                  <Input
                    type="date"
                    value={form.form_date}
                    onChange={(e) => setForm({ ...form, form_date: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: RUJUKAN NOMOR PP & WAKTU RAPAT */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Paket Pengadaan & Jadwal Pelaksanaan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nomor Permintaan Penawaran (PP) Rujukan *</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={form.selected_pp_display || "Klik Cari untuk memilih dokumen PP..."}
                      readOnly
                      placeholder="Pilih Dokumen PP..."
                      className="text-xs h-9 bg-background font-medium cursor-pointer"
                      onClick={() => setShowPpSelectModal(true)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPpSelectModal(true)}
                      className="text-xs h-9 shrink-0 flex items-center gap-1"
                    >
                      <Search className="w-3.5 h-3.5" /> Cari
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Nama Pekerjaan Pengadaan *</Label>
                  <Input
                    value={form.work_title}
                    onChange={(e) => setForm({ ...form, work_title: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Waktu Rapat Aanwijzing (Mulai - Selesai) *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Input
                      type="time"
                      value={form.start_time}
                      onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                      className="text-xs h-9"
                    />
                    <Input
                      type="time"
                      value={form.end_time}
                      onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Lokasi / Media Pertemuan Aanwijzing *</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Batas Akhir Waktu Tanya Jawab (Q&A Window)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <Input
                      type="date"
                      value={form.qa_deadline_date}
                      onChange={(e) => setForm({ ...form, qa_deadline_date: e.target.value })}
                      className="text-xs h-9"
                    />
                    <Input
                      type="time"
                      value={form.qa_deadline_time}
                      onChange={(e) => setForm({ ...form, qa_deadline_time: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tembusan Pejabat Terkait</Label>
                  <Input
                    value={form.cc_recipient}
                    onChange={(e) => setForm({ ...form, cc_recipient: e.target.value })}
                    className="mt-1.5 text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: UPLOAD DOKUMEN BERITA ACARA AANWIJZING (MAX 25MB) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Unggah Berkas Dokumen BA Aanwijzing (Maks. 25MB)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="text-xs h-9 bg-background file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadFile}
                  className="text-xs h-9 shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
              {form.file_name && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">File dipilih:</span>
                  <span className="font-mono font-medium text-foreground">{form.file_name}</span>
                  {form.file_uploaded ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Berhasil Diunggah
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                      Belum Di-upload
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 4: DETAIL RISALAH TANYA JAWAB (BAB 4.8.6.2 LANGKAH 12-16) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Detail Tanya Jawab & Klarifikasi Teknis (Add To List)
              </h4>

              <div className="space-y-3 bg-background p-3 rounded-md border">
                <div>
                  <Label className="text-[11px] font-semibold">Pertanyaan / Klarifikasi Calon Rekanan</Label>
                  <Input
                    placeholder="Contoh: Apakah toleransi dimensi material diperbolehkan +/- 0.5 mm?"
                    value={qnaInput.vendor_question}
                    onChange={(e) => setQnaInput({ ...qnaInput, vendor_question: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Jawaban / Tanggapan Resmi Panitia Pengadaan</Label>
                  <Input
                    placeholder="Contoh: Ya diperbolehkan, sesuai standar toleransi ISO 2768-m"
                    value={qnaInput.panitia_answer}
                    onChange={(e) => setQnaInput({ ...qnaInput, panitia_answer: e.target.value })}
                    className="text-xs h-8 mt-1"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddQnA}
                    className="text-xs h-8 px-4 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> [Add To List]
                  </Button>
                </div>
              </div>

              {/* Table of Q&A */}
              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">No</th>
                      <th className="py-2.5 px-3">Pertanyaan / Klarifikasi Rekanan</th>
                      <th className="py-2.5 px-3">Jawaban / Ketetapan Panitia</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {qnaList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          Belum ada poin tanya jawab yang dicatatkan. Gunakan [Add To List].
                        </td>
                      </tr>
                    ) : (
                      qnaList.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-muted/30">
                          <td className="py-2 px-3 text-center font-bold text-muted-foreground">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-foreground">{q.vendor_question}</td>
                          <td className="py-2 px-3 text-primary font-medium">{q.panitia_answer}</td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setQnaList((prev) => prev.filter((i) => i.id !== q.id))}
                              className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
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

            {/* SECTION 5: KELENGKAPAN DOKUMEN PENAWARAN (BAB 4.8.6.2 LANGKAH 17-24) */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Persyaratan Kelengkapan Dokumen Penawaran
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-3 bg-background p-3 rounded-md border">
                <div className="flex-1 w-full">
                  <Input
                    placeholder="Nama dokumen kelengkapan yang wajib dilampirkan..."
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="ADMINISTRASI">Administrasi</option>
                    <option value="TEKNIS">Teknis</option>
                    <option value="HARGA">Harga</option>
                  </select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddDoc}
                  className="text-xs h-8 px-4 shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> [+] Tambah Dokumen
                </Button>
              </div>

              <div className="border rounded-md overflow-x-auto bg-background">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Nama Dokumen Persyaratan</th>
                      <th className="py-2.5 px-3 text-center">Kategori</th>
                      <th className="py-2.5 px-3 text-center">Wajib</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {docList.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium text-foreground">{doc.doc_name}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {doc.doc_type}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-emerald-600 font-bold">WAJIB</span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDocList((prev) => prev.filter((d) => d.id !== doc.id))}
                            className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS PER BAB 4.8.6.2 */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendForRevision}
                  className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Send For Revision
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleSubmit("SAVE")}
                  disabled={isSubmitting}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit("POST")}
                  disabled={isSubmitting}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL CARI DOKUMEN PP */}
      <Dialog open={showPpSelectModal} onOpenChange={setShowPpSelectModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Pilih Dokumen Permintaan Penawaran (PP) Rujukan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nomor PP atau nama pengadaan..."
                value={ppFilter}
                onChange={(e) => setPpFilter(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="border rounded-md overflow-x-auto max-h-[50vh]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 sticky top-0 border-b">
                  <tr>
                    <th className="py-2.5 px-3">Nomor PP</th>
                    <th className="py-2.5 px-3">Nama Paket Pengadaan</th>
                    <th className="py-2.5 px-3">Tgl Penerbitan</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Tidak ada dokumen PP yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-mono font-bold text-primary">{q.rfq_number}</td>
                        <td className="py-2.5 px-3 font-medium">{q.request?.title || "Paket Pengadaan"}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{q.issue_date?.split("T")[0]}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSelectPP(q)}
                            className="text-xs h-7 px-3 bg-primary hover:bg-primary/90 text-white"
                          >
                            [Select]
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

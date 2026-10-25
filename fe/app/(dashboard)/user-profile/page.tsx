"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  CreditCard,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { masterService } from "@/services/modules.service";
import { User as UserType } from "@/types";
import toast from "react-hot-toast";

export default function UserProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);

  // Form State Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  // Password validation rules
  const hasMinLength = newPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  // Calculate Strength: 0 to 4
  const passedCount = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSymbol].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!newPassword) {
      return { score: 0, label: "-", color: "bg-muted", textColor: "text-muted-foreground", percentage: 0 };
    }
    if (passedCount <= 2) {
      return { score: 1, label: "Rendah (Lemah)", color: "bg-red-500", textColor: "text-red-500", percentage: 25 };
    }
    if (passedCount === 3 || passedCount === 4) {
      return { score: 2, label: "Sedang", color: "bg-amber-500", textColor: "text-amber-500", percentage: 65 };
    }
    return { score: 3, label: "Kuat (Sangat Aman)", color: "bg-emerald-500", textColor: "text-emerald-500", percentage: 100 };
  };

  const strength = getStrengthMeta();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Data user tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      toast.error("Password baru belum memenuhi semua kriteria keamanan.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      setIsSubmitting(true);
      await masterService.updateUser(user.id, {
        password: newPassword,
      });

      toast.success("Password berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Profil Pengguna & Keamanan Akun
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Informasi identitas akun dan pembaruan kata sandi sistem INTERLOGS UP Sembalang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-2.5 font-medium border-primary/30 text-primary bg-primary/5">
            {user?.role?.name || "Administrator"}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-none text-xs py-1 px-2.5 font-semibold">
            ● Akun Aktif
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Data Pengguna */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{user?.name || "Administrator Sistem"}</CardTitle>
                  <CardDescription className="text-xs">
                    NID: {user?.nid || "admin"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs md:text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Alamat Email</p>
                  <p className="font-semibold text-foreground">{user?.email || "admin@interlogs.pln.co.id"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">NIK (Kependudukan)</p>
                  <p className="font-semibold text-foreground">{user?.nik || "3216000000000001"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Unit Kerja / Struktur</p>
                  <p className="font-semibold text-foreground">
                    {user?.structure?.name || "PT PLN Nusantara Power UP Sembalang"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Hak Akses Role</p>
                  <p className="font-semibold text-primary">{user?.role?.name || "Administrator"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">No. Telepon</p>
                  <p className="font-semibold text-foreground">{user?.phone || "08123456789"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Lokasi Kerja</p>
                  <p className="font-semibold text-foreground">{user?.address || "UP Sembalang, Lampung"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Form Ganti Password */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-bold">Ganti Kata Sandi (Password)</CardTitle>
                  <CardDescription className="text-xs">
                    Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data pengadaan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Password Saat Ini */}
                <div>
                  <Label htmlFor="curr-pass" className="text-xs font-semibold">
                    Kata Sandi Saat Ini
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="curr-pass"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini..."
                      className="pr-10 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <Label htmlFor="new-pass" className="text-xs font-semibold">
                    Kata Sandi Baru
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="new-pass"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 12 karakter kombinasi..."
                      className="pr-10 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Parameter Indikator Kekuatan Password */}
                {newPassword && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Kekuatan Sandi:</span>
                      <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Checklist Rules Keamanan */}
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground">Ketentuan Kata Sandi:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      {hasMinLength ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasMinLength ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Minimal 12 Karakter
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasUpperCase ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasUpperCase ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Huruf Besar (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasLowerCase ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasLowerCase ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Huruf Kecil (a-z)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasNumber ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasNumber ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Angka (0-9)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      {hasSymbol ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className={hasSymbol ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Simbol Karakter Khusus (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <Label htmlFor="conf-pass" className="text-xs font-semibold">
                    Konfirmasi Kata Sandi Baru
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="conf-pass"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru..."
                      className="pr-10 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">Konfirmasi sandi tidak sesuai dengan sandi baru.</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || passedCount < 5 || newPassword !== confirmPassword}
                    className="w-full gap-2 font-semibold text-xs"
                  >
                    <Lock className="h-4 w-4" />
                    {isSubmitting ? "Menyimpan Sandi..." : "Simpan Kata Sandi Baru"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

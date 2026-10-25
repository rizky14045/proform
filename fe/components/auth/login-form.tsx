"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { SiteLogo } from "@/components/svg";
import { Icon } from "@iconify/react";
import { Checkbox } from "@/components/ui/checkbox";

import googleIcon from "@/public/images/auth/google.png";
import facebook from "@/public/images/auth/facebook.png";
import twitter from "@/public/images/auth/twitter.png";
import GithubIcon from "@/public/images/auth/github.png";

import { authService } from "@/services/auth.service";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Alamat email wajib diisi" })
    .email({ message: "Format email tidak valid (contoh: user@interlogs.pln.co.id)" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState, useTransition } from "react";

const LogInForm = () => {
  const [isPending, startTransition] = useTransition();
  const [passwordType, setPasswordType] = useState("password");
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");

  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "admin@interlogs.pln.co.id",
      password: "Password123!",
    },
  });
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = (data: { email: string; password: string }) => {
    startTransition(async () => {
      let beToken: string | null = null;
      try {
        const loginRes: any = await authService.login({
          username: data.email,
          password: data.password,
        });
        beToken = loginRes?.data?.token || loginRes?.token;
        if (beToken) {
          localStorage.setItem("access_token", beToken);
          localStorage.setItem("token", beToken);
          document.cookie = `access_token=${encodeURIComponent(beToken)}; path=/; max-age=86400; SameSite=Lax`;
          const userData = loginRes?.data?.user || loginRes?.user;
          if (userData) {
            localStorage.setItem("user_info", JSON.stringify(userData));
          }
        }
      } catch (e) {
        console.warn("Direct BE login note:", e);
      }

      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (response?.ok) {
        toast.success("Berhasil masuk ke INTERLOGS UP Sembalang");
        window.location.assign("/dashboard");
        reset();
      } else {
        toast.error("Email atau password salah. Silakan coba kembali.");
      }
    });
  };
  return (
    <div className="w-full py-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-20 w-20 2xl:h-24 2xl:w-24 shrink-0 rounded-2xl p-2.5 bg-card border border-border shadow-md flex items-center justify-center">
          <img
            src="/ico.ico"
            alt="INTERLOGS Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <div className="text-2xl 2xl:text-3xl font-black text-foreground tracking-tight leading-none">
            INTERLOGS
          </div>
          <div className="text-xs 2xl:text-sm font-bold text-primary tracking-wide uppercase mt-1">
            UP SEMBALANG
          </div>
        </div>
      </div>
      <div className="text-xs 2xl:text-sm text-muted-foreground leading-relaxed mb-6 border-b border-border/40 pb-4">
        PT PLN Nusantara Power • Sistem Terpadu Tata Kelola Pengadaan & Logistik
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7">
        <div>
          <Label htmlFor="email" className="mb-2 font-medium text-default-600">
            Alamat Email
          </Label>
          <Input
            disabled={isPending}
            {...register("email")}
            type="email"
            id="email"
            placeholder="Masukkan email Anda (contoh: admin@interlogs.pln.co.id)"
            className={cn("", {
              "border-destructive": errors.email,
            })}
            size={!isDesktop2xl ? "xl" : "lg"}
          />
        </div>
        {errors.email && (
          <div className=" text-destructive mt-2">{errors.email.message}</div>
        )}

        <div className="mt-3.5">
          <Label
            htmlFor="password"
            className="mb-2 font-medium text-default-600"
          >
            Password{" "}
          </Label>
          <div className="relative">
            <Input
              disabled={isPending}
              {...register("password")}
              type={passwordType}
              id="password"
              className="peer "
              size={!isDesktop2xl ? "xl" : "lg"}
              placeholder=" "
            />

            <div
              className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
              onClick={togglePasswordType}
            >
              {passwordType === "password" ? (
                <Icon
                  icon="heroicons:eye"
                  className="w-5 h-5 text-default-400"
                />
              ) : (
                <Icon
                  icon="heroicons:eye-slash"
                  className="w-5 h-5 text-default-400"
                />
              )}
            </div>
          </div>
        </div>
        {errors.password && (
          <div className=" text-destructive mt-2">
            {errors.password.message}
          </div>
        )}

        <div className="mt-5  mb-8 flex flex-wrap gap-2">
          <div className="flex-1 flex  items-center gap-1.5 ">
            <Checkbox
              size="sm"
              className="border-default-300 mt-[1px]"
              id="isRemebered"
            />
            <Label
              htmlFor="isRemebered"
              className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
            >
              Remember me
            </Label>
          </div>
          <Link href="/auth/forgot" className="flex-none text-sm text-primary">
            Forget Password?
          </Link>
        </div>
        <Button
          className="w-full"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Loading..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default LogInForm;

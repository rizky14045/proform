import "./assets/css/globals.css";
import "simplebar-react/dist/simplebar.min.css";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import "flatpickr/dist/flatpickr.min.css";
import DirectionProvider from "@/provider/direction.provider";
import { getSeoMeta } from "@/lib/get-seo-meta";
import { cn } from "@/lib/utils";
import { Toaster as ReactToaster } from "@/components/ui/toaster";
import { Toaster } from "react-hot-toast";
import { SonnToaster } from "@/components/ui/sonner";
import ThemeProvider from "@/provider/theme.provider";
import MountedProvider from "@/provider/mounted.provider";
import fontInter from "@/config/font";

export const metadata = getSeoMeta({
  title: "INTERLOGS - PT PLN Nusantara Power UP Sembalang",
  description: "Sistem Revamp Logistik & Pengadaan Terpadu PT PLN Nusantara Power UP Sembalang",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("dash-tail-app bg-background text-foreground text-sm", fontInter.className)}>
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          defaultTheme="light"
          disableTransitionOnChange
        >
          <MountedProvider>
            <AuthProvider>
              <TanstackProvider>
                <DirectionProvider lang="id">{children}</DirectionProvider>
              </TanstackProvider>
            </AuthProvider>
          </MountedProvider>
          <ReactToaster />
          <Toaster />
          <SonnToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}


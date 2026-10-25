"use client";
import Image from "next/image";
import { Icon } from "@iconify/react";
import background from "@/public/images/auth/line.png";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LogInForm from "@/components/auth/login-form";

const LoginPage = () => {
  const [openVideo, setOpenVideo] = useState<boolean>(false);
  return (
    <Fragment>
      <div className="min-h-screen bg-background  flex items-center  overflow-hidden w-full">
        <div className="min-h-screen basis-full flex flex-wrap w-full  justify-center overflow-y-auto">
          <div
            className="basis-1/2 bg-primary w-full  relative hidden xl:flex justify-center items-center bg-linear-to-br
          from-primary-600 via-primary-400 to-primary-600
         "
          >
            <Image
              src={background}
              alt="image"
              className="absolute top-0 left-0 w-full h-full "
            />
            <div className="relative z-10 backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 p-10 2xl:p-14 rounded-3xl max-w-[560px] text-white shadow-2xl">
              <div className="space-y-6">
                <div className="h-20 w-48 relative flex items-center bg-white/90 p-3 rounded-2xl shadow-sm">
                  <img
                    src="/logo.png"
                    alt="PLN Nusantara Power"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-3xl 2xl:text-5xl font-extrabold tracking-tight leading-tight">
                    INTERLOGS
                  </div>
                  <div className="text-sm 2xl:text-base font-semibold text-blue-200 uppercase tracking-widest">
                    PT PLN Nusantara Power UP Muara Tawar
                  </div>
                </div>

                <p className="text-sm 2xl:text-base text-blue-50/90 leading-relaxed font-normal">
                  Sistem Tata Kelola Pengadaan Terpadu, Perencanaan Kebutuhan Material, Pelaksanaan Sourcing & Tender, Manajemen Logistik Gudang, serta Pengesahan Tanda Tangan Elektronik (TTE BSrE BSSN).
                </p>
              </div>
            </div>
          </div>

          <div className=" min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center">
            <div className="lg:w-[480px] ">
              <LogInForm />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openVideo}>
        <DialogContent size="lg" className="p-0" hiddenCloseIcon>
          <DialogHeader className="hidden">
            <DialogTitle />
          </DialogHeader>
          <DialogDescription className="hidden" />
          <Button
            size="icon"
            onClick={() => setOpenVideo(false)}
            className="absolute -top-4 -right-4 bg-default-900"
          >
            <X className="w-6 h-6" />
          </Button>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/8D6b3McyhhU?si=zGOlY311c21dR70j"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default LoginPage;

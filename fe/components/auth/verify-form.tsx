"use client"
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button";
import { useState } from "react";

const VerifyForm = () => {
  const [value, setValue] = useState("")

  return (
    <div className="w-full md:w-[480px] py-5">
      <Link href="/dashboard" className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary" />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Two Factor Verification
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Enter the 6 figure confirmation code shown on the email
      </div>
      <form className="mt-8">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => setValue(value)}
        >
          <InputOTPGroup className="gap-5">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="mt-6">
          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={value.length !== 6}
          >
            Verify Now
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VerifyForm;

import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../../components/PreviewEmail";
import VerifyOtp from "./verify-otp";

export const metadata = getSeoMeta({ title: "Verify OTP Email Template" });

const VerifyOtpPage = () => {
  return <PreviewEmail emailComponent={<VerifyOtp />} />;
};

export default VerifyOtpPage;

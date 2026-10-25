import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../../components/PreviewEmail";
import ResetPassword from "./reset-password";

export const metadata = getSeoMeta({ title: "Reset Password Email Template" });

const ResetPasswordPage = () => {
  return <PreviewEmail emailComponent={<ResetPassword />} />;
};

export default ResetPasswordPage;

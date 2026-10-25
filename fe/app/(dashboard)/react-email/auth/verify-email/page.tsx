import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../../components/PreviewEmail";
import VerifyEmail from "./verify-email";

export const metadata = getSeoMeta({ title: "Verify Email Template" });

const VerifyEmailPage = () => {
  return <PreviewEmail emailComponent={<VerifyEmail />} />;
};

export default VerifyEmailPage;

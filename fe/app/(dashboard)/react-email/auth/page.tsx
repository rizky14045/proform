import { getSeoMeta } from "@/lib/get-seo-meta";

import PreviewEmail from "../components/PreviewEmail";
import ResetPassword from "./reset-password";

export const metadata = getSeoMeta({ title: "Reset Password Email Template" });

function ReviewEmailTemplate() {
  return <PreviewEmail emailComponent={<ResetPassword />} />;
}

export default ReviewEmailTemplate;

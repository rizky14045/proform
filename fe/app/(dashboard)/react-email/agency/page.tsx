import { getSeoMeta } from "@/lib/get-seo-meta";

import PreviewEmail from "../components/PreviewEmail";
import Agency from "./agency";

export const metadata = getSeoMeta({ title: "Agency Email Template" });

function AgencyPage() {
  return <PreviewEmail emailComponent={<Agency />} />;
}

export default AgencyPage;

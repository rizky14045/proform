import { getSeoMeta } from "@/lib/get-seo-meta";

import PreviewEmail from "../components/PreviewEmail";
import Corporate from "./corporate";

export const metadata = getSeoMeta({ title: "Corporate Email Template" });

function CorporatePage() {
  return <PreviewEmail emailComponent={<Corporate />} />;
}

export default CorporatePage;

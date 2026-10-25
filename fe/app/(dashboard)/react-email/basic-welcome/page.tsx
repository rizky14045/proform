import { getSeoMeta } from "@/lib/get-seo-meta";

import PreviewEmail from "../components/PreviewEmail";
import Welcome from "./basic-template";

export const metadata = getSeoMeta({ title: "Email Template" });

function BasicWelcome() {
  return <PreviewEmail emailComponent={<Welcome />} />;
}

export default BasicWelcome;

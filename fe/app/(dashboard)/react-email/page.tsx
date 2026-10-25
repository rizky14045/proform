import { getSeoMeta } from "@/lib/get-seo-meta";
import AdvancedTemplate from "./components/AdvancedTemplate";
import PreviewEmail from "./components/PreviewEmail";

export const metadata = getSeoMeta({ title: "Email Template" });

const Advanced = () => {
  return <PreviewEmail emailComponent={<AdvancedTemplate />} />;
};

export default Advanced;

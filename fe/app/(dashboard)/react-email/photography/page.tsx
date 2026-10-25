import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../components/PreviewEmail";
import Blog from "./blog";

export const metadata = getSeoMeta({ title: "Photography Email Template" });

const PhotographyPage = () => {
  return <PreviewEmail emailComponent={<Blog />} />;
};

export default PhotographyPage;

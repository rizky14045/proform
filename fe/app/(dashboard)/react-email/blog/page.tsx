import { getSeoMeta } from "@/lib/get-seo-meta";

import PreviewEmail from "../components/PreviewEmail";
import Blog from "./blog";

export const metadata = getSeoMeta({ title: "Blog Email Template" });

function BlogPage() {
  return <PreviewEmail emailComponent={<Blog />} />;
}

export default BlogPage;
      
import { getDictionary } from "@/app/dictionaries";
import ProjectPageView from "./page-view";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Project",
});

const ProjectPage = async () => {
  const trans = await getDictionary("en");
  return <ProjectPageView trans={trans} />;
};

export default ProjectPage;

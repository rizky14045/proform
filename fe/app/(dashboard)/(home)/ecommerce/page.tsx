import { getDictionary } from "@/app/dictionaries";
import EcommercePageView from "./page-view";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "eCommerce",
  description: "DashTail eCommerce Dashboard",
});
const EcommercePage = async () => {
  const trans = await getDictionary("en");
  return <EcommercePageView trans={trans} />;
};

export default EcommercePage;

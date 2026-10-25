import { getSeoMeta } from "@/lib/get-seo-meta";
import DashboardPageView from "./page-view";
import { getDictionary } from "@/app/dictionaries";

export const metadata = getSeoMeta({
  title: "Dashboard",
  description: "INTERLOGS UP Muara Tawar Dashboard",
});
const Dashboard = async () => {
  const trans = await getDictionary("en");
  return <DashboardPageView trans={trans} />;
};

export default Dashboard;

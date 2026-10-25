import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../../components/PreviewEmail";
import Shoptemplate from "./shop-template";

export const metadata = getSeoMeta({ title: "Ecommerce Shop Email Template" });

const ShopPage = () => {
  return <PreviewEmail emailComponent={<Shoptemplate />} />;
};

export default ShopPage;

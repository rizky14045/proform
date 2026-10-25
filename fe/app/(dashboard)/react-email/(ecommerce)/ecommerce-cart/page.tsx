import { getSeoMeta } from "@/lib/get-seo-meta";
import PreviewEmail from "../../components/PreviewEmail";
import ShoppingCart from "./shopping-cart";

export const metadata = getSeoMeta({ title: "Ecommerce Cart Email Template" });

const ShopTemplate = () => {
  return <PreviewEmail emailComponent={<ShoppingCart />} />;
};

export default ShopTemplate;

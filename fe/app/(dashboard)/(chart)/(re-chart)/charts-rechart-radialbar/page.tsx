import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BasicRadialBar from "./basic-radial-bar";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Rechart Radial Bar Chart",
});

const ChartJsRadialBarPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Radial Bar Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <BasicRadialBar />
      </CardContent>
    </Card>
  );
};

export default ChartJsRadialBarPage;

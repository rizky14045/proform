import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BasicTreeMap from "./basic-tree-map";
import CustomContentTreeMap from "./custom-content-treemap";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Rechart Tree Chart",
});

const ChartjsRechartTreemapPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simple Tree Map</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicTreeMap />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Custom Content Tree Map</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomContentTreeMap />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartjsRechartTreemapPage;

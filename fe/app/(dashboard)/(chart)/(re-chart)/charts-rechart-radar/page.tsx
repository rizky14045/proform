import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReSimpleRadarChart from "./simple-radar-chart";
import ReSpecifiedDomainRadarChart from "./specified-domain-radar";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Rechart Radar Chart",
});

const ChartJsRechartRadar = () => {
  return (
    <div className="grid   grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>SimpleRadarChart</CardTitle>
        </CardHeader>
        <CardContent>
          <ReSimpleRadarChart />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Specified Domain Radar Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ReSpecifiedDomainRadarChart />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartJsRechartRadar;

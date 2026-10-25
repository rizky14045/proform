import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BasicScatterChart from "./basic-scatter";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Unovis Scatter Chart",
});

const ChartsUnovisScatterPage = () => {
  return (
    <div className="grid grid-cols-1 gap-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Basic Scatter Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicScatterChart />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsUnovisScatterPage;

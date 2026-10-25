import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TitleAlignment from "./title-alignment";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Chart-js Title Chart",
});

const ChartsChartJsTitlePage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alignment</CardTitle>
      </CardHeader>
      <CardContent>
        <TitleAlignment />
      </CardContent>
    </Card>
  );
};

export default ChartsChartJsTitlePage;

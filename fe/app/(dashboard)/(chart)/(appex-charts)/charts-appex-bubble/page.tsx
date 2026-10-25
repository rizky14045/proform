import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BasicBubble from "./basic-bubble";
import Bubble3D from "./bubble-3d";
import { getSeoMeta } from "@/lib/get-seo-meta";

export const metadata = getSeoMeta({
  title: "Appex Bubble Chart",
});

const BarChartPage = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Simple Bubble Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <BasicBubble />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>3D Bubble Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bubble3D />
                </CardContent>
            </Card>
        </div>
    );
};

export default BarChartPage;
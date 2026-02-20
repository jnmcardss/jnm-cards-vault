"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const topPlayers = [
  { name: "Lamine Yamal", value: 450 },
  { name: "Kylian Mbappé", value: 150 },
  { name: "Jude Bellingham", value: 120 },
  { name: "Lionel Messi", value: 25 },
  { name: "Erling Haaland", value: 12 },
];

export function Charts() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Top Players by Value</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <BarChart width={520} height={260} data={topPlayers}>
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} />
        </BarChart>
      </CardContent>
    </Card>
  );
}

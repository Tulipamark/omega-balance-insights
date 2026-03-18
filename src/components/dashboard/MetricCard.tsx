import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="rounded-[1.5rem] border-border/70 bg-white/95 shadow-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <p className="text-sm font-medium text-subtle">{label}</p>
          <CardTitle className="mt-3 font-serif text-3xl font-semibold tracking-tight">{value}</CardTitle>
        </div>
        <div className="rounded-2xl bg-accent p-3 text-accent-foreground">{icon}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

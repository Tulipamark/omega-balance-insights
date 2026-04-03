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
    <Card className="rounded-xl border-border/70 bg-white/95 shadow-card sm:rounded-[1.5rem]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-3 sm:p-6 sm:pb-3">
        <div>
          <p className="text-sm font-medium text-subtle">{label}</p>
          <CardTitle className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:mt-3 sm:text-3xl">{value}</CardTitle>
        </div>
        <div className="rounded-xl bg-accent p-2.5 text-accent-foreground sm:rounded-2xl sm:p-3">{icon}</div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
        <p className="text-sm leading-6 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

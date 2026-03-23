import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConfidenceLevel, GrowthCompassRow } from "@/lib/omega-types";

function getStatusLabel(status: GrowthCompassRow["status"]) {
  switch (status) {
    case "inactive":
      return "Stillastående";
    case "active":
      return "Aktiv";
    case "growing":
      return "Bygger";
    case "duplicating":
      return "Duplicerar";
    case "leader-track":
      return "Ledarspår";
  }
}

function getStatusVariant(status: GrowthCompassRow["status"]) {
  switch (status) {
    case "inactive":
      return "outline" as const;
    case "active":
      return "secondary" as const;
    case "growing":
      return "secondary" as const;
    case "duplicating":
      return "default" as const;
    case "leader-track":
      return "default" as const;
  }
}

function getConfidenceLabel(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "Hög datatillit";
    case "medium":
      return "Medel datatillit";
    case "low":
      return "Låg datatillit";
  }
}

function getConfidenceVariant(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return "default" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
  }
}

export function GrowthCompassCard({ row }: { row: GrowthCompassRow }) {
  return (
    <Card className="rounded-[1.5rem] border-border/70 bg-white/95 shadow-card">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-subtle">{row.partnerName}</p>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-tight">{row.score} poäng</CardTitle>
          </div>
          <Badge variant={getStatusVariant(row.status)} className="rounded-full px-3 py-1">
            {getStatusLabel(row.status)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getConfidenceVariant(row.confidence.overall)} className="rounded-full px-3 py-1">
            {getConfidenceLabel(row.confidence.overall)}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{row.explanation}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Signaler just nu</p>
          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Kunder</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{row.inputs.personalCustomers30d}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Rekryter</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{row.inputs.recruitedPartners30d}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">First line</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{row.inputs.activeFirstLinePartners30d}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Partnerleads</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{row.inputs.partnerGeneratedLeads30d}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Partnerkunder</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{row.inputs.partnerGeneratedCustomers30d}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Nästa milstolpe</p>
          <p className="mt-2 text-sm text-foreground">{row.nextMilestone}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Du saknar</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {row.missingToNext.length ? (
              row.missingToNext.map((item) => (
                <Badge key={item} variant="outline" className="rounded-full px-3 py-1">
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-subtle">Du ligger bra till i den här nivån just nu.</span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Nästa bästa steg</p>
          <p className="mt-2 text-sm text-foreground">{row.nextBestAction}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Datatillit</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <p className="text-sm text-muted-foreground">Egna kunder: {getConfidenceLabel(row.confidence.metrics.personalCustomers30d.level)}</p>
            <p className="text-sm text-muted-foreground">Rekryterade partners: {getConfidenceLabel(row.confidence.metrics.recruitedPartners30d.level)}</p>
            <p className="text-sm text-muted-foreground">Aktiv first line: {getConfidenceLabel(row.confidence.metrics.activeFirstLinePartners30d.level)}</p>
            <p className="text-sm text-muted-foreground">Partnerleads: {getConfidenceLabel(row.confidence.metrics.partnerGeneratedLeads30d.level)}</p>
            <p className="text-sm text-muted-foreground md:col-span-2">Partnerkunder: {getConfidenceLabel(row.confidence.metrics.partnerGeneratedCustomers30d.level)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

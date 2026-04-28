const STOCKHOLM_TIME_ZONE = "Europe/Stockholm";

export function formatStockholmDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: STOCKHOLM_TIME_ZONE,
  }).format(new Date(value));
}

export { STOCKHOLM_TIME_ZONE };

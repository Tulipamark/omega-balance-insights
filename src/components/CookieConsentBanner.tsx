import { Button } from "@/components/ui/button";
import { Lang, t } from "@/lib/i18n";

type CookieConsentBannerProps = {
  lang: Lang;
  onAccept: () => void;
  onDecline: () => void;
};

export function CookieConsentBanner({ lang, onAccept, onDecline }: CookieConsentBannerProps) {
  const copy = t(lang).cookie;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 px-4 py-4 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {copy.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground/90">{copy.message}</p>
          <div className="mt-3 grid gap-2 text-xs leading-5 text-subtle md:grid-cols-2">
            <p>{copy.necessary}</p>
            <p>{copy.optional}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="rounded-xl" onClick={onDecline}>
            {copy.decline}
          </Button>
          <Button type="button" className="rounded-xl" onClick={onAccept}>
            {copy.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}

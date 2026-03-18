import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Lang, languages, supportedLangs, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  lang: Lang;
}

function FlagIcon({ lang, className = "h-4 w-6" }: { lang: Lang; className?: string }) {
  const classes = `${className} overflow-hidden rounded-sm border border-slate-200 shadow-sm`;

  switch (lang) {
    case "sv":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="16" fill="#006AA7" />
          <rect x="7" width="3" height="16" fill="#FECC00" />
          <rect y="6.5" width="24" height="3" fill="#FECC00" />
        </svg>
      );
    case "no":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="16" fill="#BA0C2F" />
          <rect x="6" width="4" height="16" fill="#FFFFFF" />
          <rect y="6" width="24" height="4" fill="#FFFFFF" />
          <rect x="7" width="2" height="16" fill="#00205B" />
          <rect y="7" width="24" height="2" fill="#00205B" />
        </svg>
      );
    case "da":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="16" fill="#C60C30" />
          <rect x="7" width="3" height="16" fill="#FFFFFF" />
          <rect y="6.5" width="24" height="3" fill="#FFFFFF" />
        </svg>
      );
    case "fi":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect x="7" width="4" height="16" fill="#003580" />
          <rect y="6" width="24" height="4" fill="#003580" />
        </svg>
      );
    case "en":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="16" fill="#012169" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.5" />
          <rect x="10" width="4" height="16" fill="#FFFFFF" />
          <rect y="6" width="24" height="4" fill="#FFFFFF" />
          <rect x="10.5" width="3" height="16" fill="#C8102E" />
          <rect y="6.5" width="24" height="3" fill="#C8102E" />
        </svg>
      );
    case "de":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="24" height="5.34" y="0" fill="#000000" />
          <rect width="24" height="5.33" y="5.34" fill="#DD0000" />
          <rect width="24" height="5.33" y="10.67" fill="#FFCE00" />
        </svg>
      );
    case "fr":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="8" height="16" x="0" fill="#0055A4" />
          <rect width="8" height="16" x="8" fill="#FFFFFF" />
          <rect width="8" height="16" x="16" fill="#EF4135" />
        </svg>
      );
    case "it":
      return (
        <svg viewBox="0 0 24 16" className={classes} aria-hidden="true">
          <rect width="8" height="16" x="0" fill="#009246" />
          <rect width="8" height="16" x="8" fill="#FFFFFF" />
          <rect width="8" height="16" x="16" fill="#CE2B37" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Header({ lang }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const tr = t(lang);
  const currentLanguage = languages.find((l) => l.code === lang);

  const switchLang = (code: Lang) => {
    const path = window.location.pathname;
    const newPath = supportedLangs.some((supported) => path === `/${supported}` || path.startsWith(`/${supported}/`))
      ? path.replace(/^\/[a-z]{2}(?=\/|$)/, `/${code}`)
      : `/${code}`;
    navigate(newPath);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to={`/${lang}`} className="font-serif text-xl font-bold text-foreground">
          OmegaBalance
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to={`/${lang}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{tr.nav.home}</Link>
          <Link to={`/${lang}#how-it-works`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{tr.nav.howItWorks}</Link>
          <Link to={`/${lang}/partners`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{tr.nav.partners}</Link>
          <Link to={`/${lang}/dashboard`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{tr.nav.dashboard}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <FlagIcon lang={lang} />
                <span className="hidden sm:inline">{currentLanguage?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => switchLang(l.code)} className="gap-2 cursor-pointer">
                  <FlagIcon lang={l.code} />
                  <span>{l.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="hero" size="sm" className="hidden md:inline-flex" asChild>
            <Link to={`/${lang}#lead-form`}>{tr.hero.cta}</Link>
          </Button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to={`/${lang}`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{tr.nav.home}</Link>
            <Link to={`/${lang}#how-it-works`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{tr.nav.howItWorks}</Link>
            <Link to={`/${lang}/partners`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{tr.nav.partners}</Link>
            <Link to={`/${lang}/dashboard`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground">{tr.nav.dashboard}</Link>
            <Button variant="hero" size="sm" asChild>
              <Link to={`/${lang}#lead-form`} onClick={() => setMobileOpen(false)}>{tr.hero.cta}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

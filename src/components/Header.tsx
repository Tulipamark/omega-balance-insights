import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import { Lang, languages, t } from "@/lib/i18n";
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

export default function Header({ lang }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const tr = t(lang);

  const switchLang = (code: Lang) => {
    const path = window.location.pathname;
    const newPath = path.replace(/^\/(sv|no|da|fi|en)/, `/${code}`);
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
                <Globe className="h-4 w-4" />
                <span className="text-sm">{languages.find(l => l.code === lang)?.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => switchLang(l.code)} className="gap-2 cursor-pointer">
                  <span>{l.flag}</span>
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

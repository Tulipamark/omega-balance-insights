import { ArrowRight, ChevronDown, Shield, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import InsideBalanceLogo from "@/components/InsideBalanceLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

type ProductCard = {
  title: string;
  eyebrow?: string;
  body: string;
  fit: string;
  href: string;
};

type HowStep = {
  title: string;
  body: string;
};

type NavigationHeaderProps = {
  currentLang: Lang;
  navHome: string;
  navOmega: string;
  navGut: string;
  navExploreLabel: string;
  platformHomePath: string;
  omegaBalancePath: string;
  gutBalancePath: string;
};

type HeroSectionProps = {
  currentLang: Lang;
  navHeader: NavigationHeaderProps;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  primaryCtaClass: string;
  secondaryCtaClass: string;
  portraitImage: string;
  portraitAlt: string;
};

type TrustSectionProps = {
  title: string;
  body: string;
  points: string[];
  icons: LucideIcon[];
};

type ProductsSectionProps = {
  title: string;
  body: string;
  products: ProductCard[];
  primaryRouteTitle: string;
  primaryRouteBody: string;
  secondaryRouteTitle: string;
  secondaryRouteBody: string;
  productLinkLabel: string;
};

type WhyMeasureSectionProps = {
  eyebrow: string;
  title: string;
  body: string;
  supportingBody: string;
  imageSrc: string;
  imageAlt: string;
};

type ConnectionSectionProps = {
  eyebrow: string;
  title: string;
  body: string;
  items: string[];
  imageSrc: string;
  imageAlt: string;
};

type HowSectionProps = {
  title: string;
  steps: HowStep[];
};

type ClosingSectionProps = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

type FooterProps = {
  footerTitle: string;
  footerTagline: string;
  footerExploreLabel: string;
  footerContactLabel: string;
  footerCompanyLabel: string;
  footerWebsiteLabel: string;
  footerPrivacyLabel: string;
  footerTermsLabel: string;
  footerBackofficeLabel: string;
  footerAdminLabel: string;
  footerCopyright: string;
  independentPartnerLabel: string;
  products: ProductCard[];
  navGut: string;
  gutBalancePath: string;
  contactPath: string;
  privacyPath: string;
  termsPath: string;
};

const SectionEyebrow = ({ children, className }: { children: string; className?: string }) => (
  <span className={cn("block text-sm font-medium uppercase tracking-[0.18em] text-primary", className)}>{children}</span>
);

const ProductTrackCard = ({
  title,
  eyebrow,
  body,
  fit,
  href,
  routeTitle,
  routeBody,
  linkLabel,
  featured,
}: ProductCard & {
  routeTitle: string;
  routeBody: string;
  linkLabel: string;
  featured?: boolean;
}) => (
  <article
    className={cn(
      "group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(31,41,55,0.08)]",
      featured
        ? "border-[rgba(70,99,80,0.18)] bg-[linear-gradient(180deg,rgba(235,244,239,0.96),rgba(255,255,255,0.98))]"
        : "border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,235,0.92))]",
    )}
  >
    <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(70,99,80,0.85),rgba(143,170,151,0.45),rgba(255,255,255,0))]" />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-primary">
        {routeTitle}
      </span>
      {eyebrow ? (
        <span className="inline-flex rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-foreground/56">
          {eyebrow}
        </span>
      ) : null}
    </div>
    <p className="mt-4 max-w-md text-sm leading-6 text-foreground/62">{routeBody}</p>
    <h3 className="mt-5 font-serif text-[2rem] font-semibold tracking-tight">{title}</h3>
    <p className="mt-4 text-[1.02rem] leading-7 text-foreground/72">{body}</p>
    <div className="mt-5 rounded-[1.35rem] border border-black/5 bg-white/75 px-4 py-4 text-sm leading-7 text-foreground/62">{fit}</div>
    <Link
      to={href}
      className="mt-6 inline-flex items-center gap-2 font-medium text-primary transition-all group-hover:gap-3"
    >
      {linkLabel}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </article>
);

const TrustPointCard = ({ point, Icon }: { point: string; Icon: LucideIcon }) => (
  <article className="rounded-[1.9rem] border border-[rgba(70,99,80,0.08)] bg-white/84 p-8 shadow-[0_24px_50px_rgba(31,41,55,0.05)]">
    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(70,99,80,0.10)]">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{point}</h3>
  </article>
);

export const InsideBalanceNavigationHeader = ({
  currentLang,
  navHome,
  navOmega,
  navGut,
  navExploreLabel,
  platformHomePath,
  omegaBalancePath,
  gutBalancePath,
}: NavigationHeaderProps) => (
  <div className="mb-8 flex items-start justify-between gap-3 md:mb-14 md:items-center">
    <Link to={platformHomePath} className="-mt-1 min-w-0 flex-1 transition-opacity hover:opacity-85 md:mt-0" aria-label={navHome}>
      <InsideBalanceLogo alt={navHome} variant="full" className="h-20 max-w-full sm:h-28 md:h-40 lg:h-44" />
    </Link>
    <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-black/5 bg-white/80 px-3 py-2.5 text-sm font-medium text-foreground shadow-[0_12px_30px_rgba(31,41,55,0.05)] transition hover:bg-white sm:px-4"
          >
            <span>{navExploreLabel}</span>
            <ChevronDown className="h-4 w-4 text-foreground/70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[13rem] rounded-2xl border-black/5 bg-white/95 p-2 shadow-[0_18px_40px_rgba(31,41,55,0.10)]">
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
            <Link to={omegaBalancePath} className="flex w-full items-center gap-3">
              <span className="font-medium text-foreground">{navOmega}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
            <Link to={gutBalancePath} className="flex w-full items-center gap-3">
              <span className="font-medium text-foreground">{navGut}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LanguageSwitcher lang={currentLang} />
    </div>
  </div>
);

export const InsideBalanceHeroSection = ({
  currentLang,
  navHeader,
  heroEyebrow,
  heroTitle,
  heroBody,
  heroPrimaryCta,
  heroSecondaryCta,
  primaryCtaClass,
  secondaryCtaClass,
  portraitImage,
  portraitAlt,
}: HeroSectionProps) => (
  <section className="px-4 pb-20 pt-6 md:px-6 md:pt-8 lg:pb-28">
    <div className="container-wide mx-auto">
      <InsideBalanceNavigationHeader currentLang={currentLang} {...navHeader} />

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <SectionEyebrow className="mb-6">{heroEyebrow}</SectionEyebrow>
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-foreground/70">{heroBody}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={navHeader.omegaBalancePath} className={primaryCtaClass}>
              {heroSecondaryCta}
            </Link>
            <a href="#products" className={secondaryCtaClass}>
              {heroPrimaryCta}
            </a>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[34rem] xl:max-w-[30rem]">
          <div className="aspect-[4/4.8] overflow-hidden rounded-[1.75rem] shadow-[0_24px_55px_rgba(31,70,55,0.10)]">
            <img
              src={portraitImage}
              alt={portraitAlt}
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const InsideBalanceTrustSection = ({ title, body, points, icons }: TrustSectionProps) => (
  <section className="bg-[linear-gradient(180deg,rgba(244,248,245,0.98),rgba(235,242,238,0.90))] px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-foreground/68">{body}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {points.map((point, index) => {
          const Icon = icons[index] ?? Shield;

          return <TrustPointCard key={point} point={point} Icon={Icon} />;
        })}
      </div>
    </div>
  </section>
);

export const InsideBalanceProductsSection = ({
  title,
  body,
  products,
  primaryRouteTitle,
  primaryRouteBody,
  secondaryRouteTitle,
  secondaryRouteBody,
  productLinkLabel,
}: ProductsSectionProps) => (
  <section id="products" className="px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{title}</h2>
        <p className="mt-4 text-lg leading-8 text-foreground/68">{body}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
        {products.map((product, index) => (
          <ProductTrackCard
            key={product.title}
            {...product}
            featured={index === 0}
            routeTitle={index === 0 ? primaryRouteTitle : secondaryRouteTitle}
            routeBody={index === 0 ? primaryRouteBody : secondaryRouteBody}
            linkLabel={productLinkLabel}
          />
        ))}
      </div>
    </div>
  </section>
);

export const InsideBalanceWhyMeasureSection = ({
  eyebrow,
  title,
  body,
  supportingBody,
  imageSrc,
  imageAlt,
}: WhyMeasureSectionProps) => (
  <section className="px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[38rem] xl:max-w-[34rem]">
          <div className="aspect-[16/11] overflow-hidden rounded-[1.75rem] shadow-[0_24px_55px_rgba(31,41,55,0.07)]">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full rounded-[1.75rem] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <div>
          <SectionEyebrow className="mb-3">{eyebrow}</SectionEyebrow>
          <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-foreground/68">{body}</p>
          <div className="mt-6 rounded-[1.5rem] border border-[rgba(70,99,80,0.08)] bg-[rgba(240,246,242,0.7)] px-5 py-5">
            <p className="text-sm leading-8 text-foreground/68">{supportingBody}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const InsideBalanceConnectionSection = ({
  eyebrow,
  title,
  body,
  items,
  imageSrc,
  imageAlt,
}: ConnectionSectionProps) => (
  <section className="bg-[linear-gradient(180deg,rgba(247,243,235,0.98),rgba(237,244,240,0.9))] px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="order-2 lg:order-1">
          <SectionEyebrow className="mb-3">{eyebrow}</SectionEyebrow>
          <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{title}</h2>
          <p className="mt-5 text-lg leading-8 text-foreground/68">{body}</p>
          <div className="mt-6 space-y-3 rounded-[1.5rem] border border-black/5 bg-white/70 px-5 py-5">
            {items.map((item) => (
              <div key={item} className="flex items-start gap-3 text-foreground/68">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <p className="leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 mx-auto w-full max-w-[38rem] xl:max-w-[34rem] lg:order-2">
          <div className="aspect-[16/11] overflow-hidden rounded-[1.75rem] shadow-[0_24px_55px_rgba(31,41,55,0.07)]">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full rounded-[1.75rem] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const InsideBalanceHowSection = ({ title, steps }: HowSectionProps) => (
  <section className="bg-[linear-gradient(135deg,rgba(244,234,217,0.86),rgba(247,243,235,0.96))] px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-[2rem] font-semibold tracking-tight md:text-[2.4rem]">{title}</h2>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-[1.75rem] border border-black/5 bg-white/72 px-6 py-8 text-center shadow-[0_18px_40px_rgba(31,41,55,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-[0_16px_30px_rgba(31,70,55,0.18)]">
              {index + 1}
            </div>
            <h3 className="mt-5 font-serif text-[1.5rem] font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-3 leading-7 text-foreground/68">{step.body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const InsideBalanceClosingSection = ({ title, body, ctaLabel, ctaHref }: ClosingSectionProps) => (
  <section className="px-4 py-16 md:px-6 md:py-20">
    <div className="container-wide mx-auto">
      <div className="rounded-[2.25rem] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.82))] px-8 py-12 text-center shadow-[0_28px_65px_hsl(var(--primary)/0.22)] md:px-12 md:py-16">
        <h2 className="font-serif text-[2rem] font-semibold tracking-tight text-white md:text-[2.4rem]">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white">{body}</p>
        <Link
          to={ctaHref}
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-medium text-foreground transition hover:-translate-y-0.5 hover:bg-[#faf7f1]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  </section>
);

export const InsideBalanceFooter = ({
  footerTitle,
  footerTagline,
  footerExploreLabel,
  footerContactLabel,
  footerCompanyLabel,
  footerWebsiteLabel,
  footerPrivacyLabel,
  footerTermsLabel,
  footerBackofficeLabel,
  footerAdminLabel,
  footerCopyright,
  independentPartnerLabel,
  products,
  navGut,
  gutBalancePath,
  contactPath,
  privacyPath,
  termsPath,
}: FooterProps) => (
  <footer className="border-t border-black/5 px-4 py-12 md:px-6 md:py-14">
    <div className="container-wide mx-auto grid gap-6 md:grid-cols-4">
      <div className="max-w-2xl">
        <InsideBalanceLogo
          alt={footerTitle}
          variant="full"
          className="h-32 sm:h-36 md:h-40 lg:h-44"
          imageClassName="-translate-y-6 sm:-translate-y-8"
        />
        <p className="-mt-6 sm:-mt-8 text-sm leading-6 text-foreground/66">{footerTagline}</p>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">{footerExploreLabel}</p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/72">
          {products[0] ? (
            <Link to={products[0].href} className="transition hover:text-foreground">
              {products[0].title}
            </Link>
          ) : null}
          <Link to={gutBalancePath} className="transition hover:text-foreground">
            {navGut}
          </Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">{footerContactLabel}</p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/72">
          <Link to={contactPath} className="transition hover:text-foreground">
            {footerWebsiteLabel}
          </Link>
          <Link to={privacyPath} className="transition hover:text-foreground">
            {footerPrivacyLabel}
          </Link>
          <Link to={termsPath} className="transition hover:text-foreground">
            {footerTermsLabel}
          </Link>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/45">{footerCompanyLabel}</p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/72">
          <Link to="/dashboard/login" className="transition hover:text-foreground">
            {footerBackofficeLabel}
          </Link>
          <Link to="/dashboard/admin-login" className="transition hover:text-foreground">
            {footerAdminLabel}
          </Link>
        </div>
      </div>
    </div>
    <div className="container-wide mx-auto mt-10 border-t border-black/5 pt-6 text-center">
      <p className="text-xs text-foreground/55">
        {footerCopyright} • {independentPartnerLabel}
      </p>
    </div>
  </footer>
);

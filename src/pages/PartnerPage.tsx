import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link2, BarChart3, GraduationCap, CircleDollarSign, TrendingUp, GitBranch, ArrowRightLeft } from "lucide-react";
import { countryCodeFromLang, Lang, t } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface PartnerPageProps {
  lang: Lang;
}

function generateReferralCode(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}${rand}`;
}

export default function PartnerPage({ lang }: PartnerPageProps) {
  const tr = t(lang);
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("partners").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company: form.company || null,
        referral_code: generateReferralCode(form.name),
        country: countryCodeFromLang(lang),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Link2, title: tr.partner.benefit1, desc: tr.partner.benefit1desc },
    { icon: BarChart3, title: tr.partner.benefit2, desc: tr.partner.benefit2desc },
    { icon: GraduationCap, title: tr.partner.benefit3, desc: tr.partner.benefit3desc },
  ];

  const marginPoints = [
    { icon: GitBranch, text: tr.partner.marginPoint1 },
    { icon: CircleDollarSign, text: tr.partner.marginPoint2 },
    { icon: TrendingUp, text: tr.partner.marginPoint3 },
  ];

  const chain = [
    { label: tr.partner.chainFactory, price: 38, tone: "bg-card" },
    { label: tr.partner.chainExport, price: 64, tone: "bg-card" },
    { label: tr.partner.chainImport, price: 107, tone: "bg-card" },
    { label: tr.partner.chainWholesale, price: 179, tone: "bg-card" },
    { label: tr.partner.chainStore, price: 297, tone: "bg-card" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} />
      <main className="flex-1">
        <section className="py-20 md:py-28" style={{ background: "var(--hero-gradient)" }}>
          <div className="container">
            <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
              <motion.h1 variants={fadeUp} custom={0} className="text-4xl font-bold md:text-5xl text-foreground">{tr.partner.headline}</motion.h1>
              <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground">{tr.partner.sub}</motion.p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-8 md:grid-cols-3">
              {benefits.map((b, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-8 shadow-sm md:p-12"
            >
              <motion.div variants={fadeUp} custom={0} className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Margin</p>
                <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{tr.partner.marginTitle}</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{tr.partner.marginText}</p>
              </motion.div>

              <motion.div variants={fadeUp} custom={1} className="mt-10 grid gap-4 md:grid-cols-3">
                {marginPoints.map((point, i) => (
                  <div key={i} className="rounded-xl bg-secondary/50 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <point.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium leading-relaxed text-foreground">{point.text}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="mt-12 rounded-2xl border border-border bg-secondary/30 p-6 md:p-8">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold text-foreground">{tr.partner.marginVisualTitle}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {tr.partner.marginVisualText}
                  </p>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {chain.map((step, i) => (
                      <div key={step.label} className={`rounded-2xl border border-border ${step.tone} p-5 shadow-sm`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {step.label}
                        </p>
                        <p className="mt-4 text-3xl font-bold text-foreground">{step.price}:-</p>
                        {i < chain.length - 1 && (
                          <div className="mt-4 hidden text-primary xl:block">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center lg:justify-start">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <ArrowRightLeft className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    {tr.partner.chainYou}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-foreground md:text-lg">
                    {tr.partner.marginText}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="bg-secondary/30 py-20">
          <div className="container">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-md">
              <motion.h2 variants={fadeUp} custom={0} className="text-center text-2xl font-bold text-foreground">{tr.partner.signupTitle}</motion.h2>
              {submitted ? (
                <motion.div variants={fadeUp} custom={1} className="mt-8 rounded-xl border border-primary/20 bg-accent p-8 text-center">
                  <p className="text-lg font-semibold text-accent-foreground">{tr.partner.success}</p>
                </motion.div>
              ) : (
                <motion.form variants={fadeUp} custom={1} onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <Input placeholder={tr.partner.name} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-12" />
                  <Input type="email" placeholder={tr.partner.email} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-12" />
                  <Input type="tel" placeholder={tr.partner.phone} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-12" />
                  <Input placeholder={tr.partner.company} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="h-12" />
                  <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
                    {loading ? "..." : tr.partner.submit}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </motion.form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

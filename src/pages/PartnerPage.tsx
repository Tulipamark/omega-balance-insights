import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link2, BarChart3, GraduationCap } from "lucide-react";
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

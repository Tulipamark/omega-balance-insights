import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Beaker, ClipboardCheck, LineChart, ShieldCheck, ChevronDown } from "lucide-react";
import { Lang, t } from "@/lib/i18n";
import { usePartnerRef } from "@/hooks/use-partner-ref";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LandingContentProps {
  lang: Lang;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LandingContent({ lang }: LandingContentProps) {
  const tr = t(lang);
  const partnerRef = usePartnerRef();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lead submitted:", { ...formData, partnerRef, lang });
    setSubmitted(true);
  };

  const steps = [
    { icon: ClipboardCheck, title: tr.howItWorks.step1, desc: tr.howItWorks.step1desc },
    { icon: Beaker, title: tr.howItWorks.step2, desc: tr.howItWorks.step2desc },
    { icon: LineChart, title: tr.howItWorks.step3, desc: tr.howItWorks.step3desc },
    { icon: ShieldCheck, title: tr.howItWorks.step4, desc: tr.howItWorks.step4desc },
  ];

  const stats = [
    { value: tr.problem.stat1, label: tr.problem.stat1label },
    { value: tr.problem.stat2, label: tr.problem.stat2label },
    { value: tr.problem.stat3, label: tr.problem.stat3label },
  ];

  const faqs = [
    { q: tr.faq.q1, a: tr.faq.a1 },
    { q: tr.faq.q2, a: tr.faq.a2 },
    { q: tr.faq.q3, a: tr.faq.a3 },
    { q: tr.faq.q4, a: tr.faq.a4 },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32" style={{ background: "var(--hero-gradient)" }}>
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl font-bold leading-tight tracking-tight md:text-6xl text-foreground">
              {tr.hero.headline}
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              {tr.hero.sub}
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button variant="hero" size="lg" asChild>
                <a href="#lead-form">
                  {tr.hero.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="#lead-form">{tr.hero.ctaSecondary}</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Problem / Stats */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold md:text-4xl text-foreground">{tr.problem.title}</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">{tr.problem.text}</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 2} className="rounded-xl border border-border bg-card p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-bold text-primary font-serif">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center text-3xl font-bold md:text-4xl text-foreground">
            {tr.howItWorks.title}
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} custom={i + 1} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold md:text-4xl text-foreground">{tr.results.title}</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground">{tr.results.text}</motion.p>
          </motion.div>
        </div>
      </section>

      {/* Lead Form CTA */}
      <section id="lead-form" className="bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto max-w-xl">
            <motion.h2 variants={fadeUp} custom={0} className="text-center text-3xl font-bold md:text-4xl text-foreground">{tr.cta.title}</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-center text-muted-foreground">{tr.cta.text}</motion.p>

            {submitted ? (
              <motion.div variants={fadeUp} custom={2} className="mt-8 rounded-xl border border-primary/20 bg-accent p-8 text-center">
                <p className="text-lg font-semibold text-accent-foreground">{tr.lead.success}</p>
              </motion.div>
            ) : (
              <motion.form variants={fadeUp} custom={2} onSubmit={handleSubmit} className="mt-8 space-y-4">
                <Input
                  placeholder={tr.lead.name}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12"
                />
                <Input
                  type="email"
                  placeholder={tr.lead.email}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
                <Input
                  type="tel"
                  placeholder={tr.lead.phone}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
                <Button variant="hero" size="lg" type="submit" className="w-full">
                  {tr.cta.button}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center text-3xl font-bold md:text-4xl text-foreground">
            {tr.faq.title}
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="mx-auto mt-12 max-w-2xl">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

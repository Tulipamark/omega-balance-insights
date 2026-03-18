import { ArrowRight, CircleDollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { TranslationKeys } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

type ValueFlowSectionProps = {
  partner: TranslationKeys["partner"];
};

function SneakerIllustration() {
  return (
    <div className="relative mx-auto flex w-full max-w-[14rem] items-center justify-center rounded-[2rem] border border-border bg-white p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-x-6 bottom-4 h-4 rounded-full bg-slate-200/70 blur-xl" />
      <svg viewBox="0 0 240 112" className="relative h-auto w-full text-slate-900" fill="none" aria-hidden="true">
        <path
          d="M28 72c10 0 26-5 44-19l18-14 15 15c7 6 14 10 22 12l27 6c10 2 18 7 24 14H26c-6 0-10-3-10-7s5-7 12-7Z"
          className="fill-current"
          opacity="0.95"
        />
        <path
          d="M90 40 71 57m37-5-22 18m37-11-19 16"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M26 88h169" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ValueFlowSection({ partner }: ValueFlowSectionProps) {
  const chain = [
    { label: partner.chainFactory, price: "179 kr" },
    { label: partner.chainExport, price: "349 kr" },
    { label: partner.chainWholesale, price: "699 kr" },
    { label: partner.chainStore, price: "1299 kr" },
  ];

  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.22)] md:p-8"
        >
          <div className="grid gap-8">
            <div>
              <motion.h2 variants={fadeUp} custom={0} className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {partner.marginTitle}
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {partner.marginText}
              </motion.p>
            </div>

            <motion.div variants={fadeUp} custom={2} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
                {chain.map((step, index) => (
                  <div key={step.label} className={index < chain.length - 1 ? "contents" : ""}>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.2)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {step.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-[1.75rem]">
                        {step.price}
                      </p>
                    </div>
                    {index < chain.length - 1 ? (
                      <div className="hidden items-center justify-center lg:flex">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <motion.div variants={fadeUp} custom={3} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.18)]">
                <SneakerIllustration />
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {partner.valueExampleProduct}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">1299 kr</p>
                </div>
              </motion.div>

              <div className="space-y-4">
                <motion.div variants={fadeUp} custom={4} className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-base font-semibold leading-7 text-slate-900">{partner.marginVisualTitle}</p>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {partner.marginVisualText}
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} custom={5} className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                      <CircleDollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-7 text-slate-900">
                        {partner.valueModelTitle}
                      </p>
                      <p className="mt-2 text-base leading-7 text-slate-700">
                        {partner.valueModelText}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div variants={fadeUp} custom={6} className="rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                {partner.chainYou}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-700">
                {partner.valueHighlight}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

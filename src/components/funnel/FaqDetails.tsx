type FaqItem = {
  question: string;
  answer: string;
};

type FaqDetailsProps = {
  title: string;
  items: FaqItem[];
  className?: string;
};

const FaqDetails = ({ title, items, className = "" }: FaqDetailsProps) => {
  return (
    <section className={`px-4 py-18 md:px-6 md:py-24 ${className}`.trim()}>
      <div className="container-wide mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        </div>
        <div className="mt-10 space-y-4">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-[1.5rem] border border-black/5 bg-white/88 px-6 py-5 shadow-[0_16px_35px_rgba(31,41,55,0.05)]"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-foreground marker:content-none">
                <span>{item.question}</span>
                <span className="text-xl leading-none text-foreground/45 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-none pr-6 text-sm leading-7 text-foreground/72">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqDetails;


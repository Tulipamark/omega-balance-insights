import { motion } from "framer-motion";
import { Lang, t } from "@/lib/i18n";

interface VideoSectionProps {
  lang: Lang;
}

const transcriptByLang: Partial<Record<Lang, string>> = {
  sv: "Många tror att de äter rätt. Men ändå känner de sig trötta eller har låg energi. Problemet är att det inte handlar om vad du äter utan vad kroppen faktiskt tar upp. Ett balance test visar din fettsyraprofil. Du tar några droppar blod hemma och får ett konkret svar. Baserat på resultatet får du personliga rekommendationer. Ta reda på din balans. Det tar bara några minuter att komma igång.",
};

const VideoSection = ({ lang }: VideoSectionProps) => {
  const copy = t(lang).video;
  const transcript = transcriptByLang[lang];

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">{copy.title}</h2>
          <p className="mx-auto max-w-xl text-lg text-subtle">{copy.body}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
        >
          <video
            className="aspect-video w-full bg-black"
            controls
            preload="metadata"
            playsInline
            aria-label={copy.title}
          >
            <source src="/avatar-video.mp4" type="video/mp4" />
            {copy.placeholder}
          </video>

          <div className="border-t border-border/70 bg-[linear-gradient(180deg,_rgba(248,245,239,0.96),_rgba(255,255,255,0.98))] px-6 py-5">
            <p className="inline-flex rounded-full border border-border/70 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {lang === "sv" ? "Video Manus" : "Video Transcript"}
            </p>
            <p className="mt-4 text-base leading-7 text-foreground/80">{transcript || copy.placeholder}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;

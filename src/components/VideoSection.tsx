import { motion } from "framer-motion";
import { Lang, defaultLang, t } from "@/lib/i18n";

interface VideoSectionProps {
  lang: Lang;
  embedded?: boolean;
  showTranscript?: boolean;
  showHeader?: boolean;
}

const transcriptByLang: Partial<Record<Lang, string>> = {
  sv: "Många tror att de äter rätt. Men ändå känner de sig trötta eller har låg energi. Problemet är att det inte handlar om vad du äter utan vad kroppen faktiskt tar upp. Ett balance test visar din fettsyraprofil. Du tar några droppar blod hemma och får ett konkret svar. Baserat på resultatet får du personliga rekommendationer. Ta reda på din balans. Det tar bara några minuter att komma igång.",
};

const transcriptLabelByLang: Record<Lang, string> = {
  sv: "Video Manus",
  no: "Videomanus",
  da: "Videomanus",
  fi: "Videon kasikirjoitus",
  en: "Video Transcript",
  de: "Videotranskript",
  fr: "Transcription video",
  it: "Trascrizione video",
};

function getVideoSources(lang: Lang) {
  return [`/videos/avatar-video-${lang}.mp4`, "/avatar-video.mp4"];
}

const VideoSection = ({ lang, embedded = false, showTranscript = true, showHeader = true }: VideoSectionProps) => {
  const copy = t(lang).video;
  const transcript = transcriptByLang[lang] || transcriptByLang[defaultLang];
  const videoSources = getVideoSources(lang);

  const header = showHeader ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={embedded ? "mb-5 text-left" : "mb-10 text-center"}
    >
      <h2 className={`font-semibold tracking-tight ${embedded ? "text-2xl md:text-3xl" : "mb-4 text-3xl md:text-4xl"}`}>
        {copy.title}
      </h2>
      <p className={embedded ? "max-w-2xl text-base leading-7 text-subtle md:text-lg" : "mx-auto max-w-xl text-lg text-subtle"}>
        {copy.body}
      </p>
    </motion.div>
  ) : null;

  const card = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-elevated"
    >
      <video
        className="aspect-video w-full bg-black"
        controls
        preload="metadata"
        playsInline
        aria-label={copy.title}
      >
        {videoSources.map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
        {copy.placeholder}
      </video>

      {showTranscript ? (
        <div className="border-t border-border/70 bg-[linear-gradient(180deg,_rgba(248,245,239,0.96),_rgba(255,255,255,0.98))] px-6 py-5">
          <p className="inline-flex rounded-full border border-border/70 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {transcriptLabelByLang[lang]}
          </p>
          <p className="mt-4 text-base leading-7 text-foreground/80">{transcript || copy.placeholder}</p>
        </div>
      ) : null}
    </motion.div>
  );

  if (embedded) {
    return (
      <div className="w-full">
        {header}
        {card}
      </div>
    );
  }

  return (
    <section className="section-padding pt-6 md:pt-10">
      <div className="container-narrow">
        {header}
        {card}
      </div>
    </section>
  );
};

export default VideoSection;

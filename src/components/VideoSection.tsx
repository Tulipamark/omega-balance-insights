import * as React from "react";
import { motion } from "framer-motion";
import { Lang, defaultLang, t } from "@/lib/i18n";

interface VideoSectionProps {
  lang: Lang;
  embedded?: boolean;
  showTranscript?: boolean;
  showHeader?: boolean;
}

const transcriptByLang: Partial<Record<Lang, string>> = {
  sv: "M\u00e5nga tror att de \u00e4ter r\u00e4tt. Men \u00e4nd\u00e5 k\u00e4nner de sig tr\u00f6tta eller har l\u00e5g energi. Problemet \u00e4r att det inte handlar om vad du \u00e4ter utan vad kroppen faktiskt tar upp. Ett BalanceTest visar din fettsyraprofil. Du tar n\u00e5gra droppar blod hemma och f\u00e5r ett konkret svar. Baserat p\u00e5 resultatet f\u00e5r du personliga rekommendationer. Ta reda p\u00e5 din balans. Det tar bara n\u00e5gra minuter att komma ig\u00e5ng.",
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
  ar: "نص الفيديو",
};

const DEFAULT_VIDEO_SRC = "/avatar-video.mp4";
const VIDEO_ASSET_VERSION = "20260429";
const localizedVideoLanguages = new Set<Lang>(["da", "de", "en", "fi", "fr", "it", "no"]);
const videoFallbackByLang: Partial<Record<Lang, string>> = {
  ar: `/videos/avatar-video-en.mp4?v=${VIDEO_ASSET_VERSION}`,
  de: `/videos/avatar-video-en.mp4?v=${VIDEO_ASSET_VERSION}`,
  fi: `/videos/avatar-video-en.mp4?v=${VIDEO_ASSET_VERSION}`,
  fr: `/videos/avatar-video-en.mp4?v=${VIDEO_ASSET_VERSION}`,
  it: `/videos/avatar-video-en.mp4?v=${VIDEO_ASSET_VERSION}`,
};

function getLocalizedVideoSrc(lang: Lang) {
  if (lang === "ar") {
    return videoFallbackByLang.ar!;
  }

  if (!localizedVideoLanguages.has(lang)) {
    return DEFAULT_VIDEO_SRC;
  }

  return `/videos/avatar-video-${lang}.mp4?v=${VIDEO_ASSET_VERSION}`;
}

const VideoSection = ({ lang, embedded = false, showTranscript = true, showHeader = true }: VideoSectionProps) => {
  const copy = t(lang).video;
  const transcript = transcriptByLang[lang] || transcriptByLang[defaultLang];
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = React.useState(() => getLocalizedVideoSrc(lang));

  React.useEffect(() => {
    setVideoSrc(getLocalizedVideoSrc(lang));
  }, [lang]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const shouldResume = !video.paused && !video.ended;
    video.pause();
    video.currentTime = 0;
    video.load();

    if (shouldResume) {
      void video.play().catch(() => {
        // Ignore autoplay rejections after source swaps.
      });
    }
  }, [lang, videoSrc]);

  const handleVideoError = React.useCallback(() => {
    const fallbackSrc = videoFallbackByLang[lang] ?? DEFAULT_VIDEO_SRC;
    setVideoSrc((current) => (current === fallbackSrc ? current : fallbackSrc));
  }, [lang]);

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
        ref={videoRef}
        className="aspect-video w-full bg-black"
        controls
        preload="metadata"
        playsInline
        aria-label={copy.title}
        onError={handleVideoError}
        src={videoSrc}
      >
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

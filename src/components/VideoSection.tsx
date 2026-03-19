import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Lang, t } from "@/lib/i18n";

interface VideoSectionProps {
  lang: Lang;
}

const VideoSection = ({ lang }: VideoSectionProps) => {
  const copy = t(lang).video;

  return (
    <section className="section-padding">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{copy.title}</h2>
          <p className="text-subtle text-lg max-w-xl mx-auto">{copy.body}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="bg-foreground/5 rounded-2xl aspect-video flex items-center justify-center cursor-pointer group relative overflow-hidden"
        >
          <div className="badge-accent w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 ml-1" />
          </div>
          <p className="absolute bottom-6 text-sm text-subtle">{copy.placeholder}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;

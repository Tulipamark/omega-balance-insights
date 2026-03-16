import { motion } from "framer-motion";
import heroVisual from "@/assets/hero-visual.jpg";

const HeroSection = () => {
  return (
    <section className="bg-hero section-padding min-h-[90vh] flex items-center">
      <div className="container-wide w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="badge-accent inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 tracking-wide">
              Scientific Fatty Acid Analysis
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight mb-6">
              Do you know your
              <br />
              <span className="text-primary">Omega balance?</span>
            </h1>
            <p className="text-lg md:text-xl text-subtle leading-relaxed max-w-lg mb-10">
              Most people have an imbalance between Omega-6 and Omega-3. A simple home blood test can reveal your exact ratio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#lead-capture" className="btn-primary text-center">
                Test your Omega balance
              </a>
              <a href="#how-it-works" className="btn-secondary text-center">
                How the test works
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-subtle text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Certified lab analysis
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Results in 10–14 days
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <img
              src={heroVisual}
              alt="Omega balance analysis dashboard showing fatty acid ratio data"
              className="rounded-2xl shadow-elevated w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { motion } from "framer-motion";
import { useState } from "react";

const LeadCaptureSection = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent, action: string) => {
    e.preventDefault();
    console.log(`${action}:`, formData);
    setSubmitted(true);
  };

  return (
    <section id="lead-capture" className="section-padding bg-section-alt">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Ready to find out?
            </h2>
            <p className="text-subtle text-lg">
              Enter your details to order the test or book a free 10-minute consultation.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl shadow-elevated p-10 text-center"
            >
              <div className="badge-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-sans text-xl font-semibold mb-2">Thank you!</h3>
              <p className="text-subtle">We'll be in touch shortly with your next steps.</p>
            </motion.div>
          ) : (
            <form className="bg-card rounded-2xl shadow-elevated p-8 md:p-10 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e, "order")}
                  className="btn-primary flex-1 text-center"
                >
                  Order the test
                </button>
                <button
                  type="submit"
                  onClick={(e) => handleSubmit(e, "consultation")}
                  className="btn-secondary flex-1 text-center"
                >
                  Book a consultation
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;

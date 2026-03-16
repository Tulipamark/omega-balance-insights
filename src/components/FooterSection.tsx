const FooterSection = () => {
  return (
    <footer className="px-6 py-12 md:px-12 border-t border-border">
      <div className="container-wide flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-serif text-lg font-semibold tracking-tight">OmegaBalance</p>
        <p className="text-xs text-subtle">
          © {new Date().getFullYear()} OmegaBalance. Scientific fatty acid analysis. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-subtle">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

import { Book } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container">
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Book className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold text-foreground">StoryStar</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground">Privacy</a>
          <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground">Terms</a>
          <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground">Contact</a>
        </div>
        <p className="font-body text-xs text-muted-foreground">© 2026 StoryStar. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

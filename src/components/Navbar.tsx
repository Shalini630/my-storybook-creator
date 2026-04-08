import { useState } from "react";
import { Link } from "react-router-dom";
import { Book, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Book className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-foreground">StoryStar</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link to="/" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Book Gallery
          </Link>
          <Link to="/create" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Create a Book
          </Link>
          <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
            <Link to="/create">Get Started</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" className="font-body text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>How It Works</Link>
            <Link to="/" className="font-body text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Book Gallery</Link>
            <Link to="/create" className="font-body text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Create a Book</Link>
            <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground">
              <Link to="/create" onClick={() => setOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

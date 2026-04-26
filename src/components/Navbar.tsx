import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="KahaaniSeKitab" className="h-9 w-9 rounded-lg" />
          <span className="font-display text-xl font-semibold text-foreground">KahaaniSeKitab</span>
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
          {user ? (
            <>
              <Link to="/my-books" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                My Books
              </Link>
              <Link to="/profile" className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Profile
              </Link>
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <User className="h-4 w-4" />
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5 font-body text-sm">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="font-body text-sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground hover:opacity-90">
                <Link to="/create">Get Started</Link>
              </Button>
            </div>
          )}
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
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { signOut(); setOpen(false); }} className="gap-1.5 font-body">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="font-body justify-start">
                  <Link to="/auth" onClick={() => setOpen(false)}>Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-primary font-body font-semibold text-primary-foreground">
                  <Link to="/create" onClick={() => setOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

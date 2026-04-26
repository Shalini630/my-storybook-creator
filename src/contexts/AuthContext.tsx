import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const forcedSignOutRef = useRef(false);
  const { toast } = useToast();

  // Cleanup realtime subscription
  const cleanupChannel = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  // Force sign out the current device (another device took over)
  const forceSignOut = async (reason: string) => {
    if (forcedSignOutRef.current) return;
    forcedSignOutRef.current = true;
    cleanupChannel();
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: reason,
      variant: "destructive",
    });
    // Reset so future logins work
    setTimeout(() => { forcedSignOutRef.current = false; }, 1000);
  };

  // Claim this session as the active one for the user
  const claimActiveSession = async (currentSession: Session) => {
    const token = currentSession.access_token;
    currentTokenRef.current = token;

    // Upsert into active_sessions — this overwrites any prior device
    const { error } = await supabase
      .from("active_sessions")
      .upsert(
        { user_id: currentSession.user.id, session_token: token, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Failed to claim active session:", error);
      return;
    }

    // Subscribe to changes — if another device claims, sign out here
    cleanupChannel();
    channelRef.current = supabase
      .channel(`active-session-${currentSession.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_sessions",
          filter: `user_id=eq.${currentSession.user.id}`,
        },
        (payload) => {
          const newToken = (payload.new as { session_token?: string })?.session_token;
          if (newToken && newToken !== currentTokenRef.current) {
            forceSignOut("You signed in on another device.");
          }
        }
      )
      .subscribe();
  };

  // Verify this session is still the active one (on load / focus)
  const verifyActiveSession = async (currentSession: Session) => {
    const { data, error } = await supabase
      .from("active_sessions")
      .select("session_token")
      .eq("user_id", currentSession.user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to verify active session:", error);
      return;
    }

    if (data && data.session_token !== currentSession.access_token) {
      await forceSignOut("Your session was ended because you signed in on another device.");
    }
  };

  useEffect(() => {
    // Set up listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);

      if (event === "SIGNED_IN" && newSession) {
        // Defer DB call to avoid deadlock with auth callback
        setTimeout(() => claimActiveSession(newSession), 0);
      } else if (event === "TOKEN_REFRESHED" && newSession) {
        setTimeout(() => claimActiveSession(newSession), 0);
      } else if (event === "SIGNED_OUT") {
        cleanupChannel();
        currentTokenRef.current = null;
      }
    });

    // Get existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setLoading(false);
      if (existingSession) {
        currentTokenRef.current = existingSession.access_token;
        // Verify we're still the active session and re-subscribe
        setTimeout(async () => {
          await verifyActiveSession(existingSession);
          await claimActiveSession(existingSession);
        }, 0);
      }
    });

    // Re-verify when tab regains focus
    const onFocus = () => {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s) verifyActiveSession(s);
      });
    };
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      cleanupChannel();
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    if (session) {
      // Clear the active session record
      await supabase.from("active_sessions").delete().eq("user_id", session.user.id);
    }
    cleanupChannel();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

import { supabase } from "@/utils/supabase";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextType {
  session: any | null;
  user: any | null;
  loading: boolean;
  error: string | null;
  isInitialAuthCheckComplete: boolean;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const timeoutId = setTimeout(() => {
      if (isSubscribed && loading) {
        console.warn("Auth check timeout - resetting loading state");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const loadSession = async () => {
      if (!isSubscribed) return;

      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!isSubscribed) return;

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setError(sessionError.message);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user || null);
        }
      } catch (e: any) {
        if (!isSubscribed) return;
        console.error("Error in loadSession:", e);
        setError(e.message);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setIsInitialAuthCheckComplete(true);
        }
      }
    };

    // Subscribe to auth state changes
    let subscription: any;
    const setupAuthSubscription = async () => {
      if (!isSubscribed) return;

      try {
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!isSubscribed) return;
          setSession(session);
          setUser(session?.user || null);
        });
        subscription = data.subscription;
      } catch (e) {
        if (!isSubscribed) return;
        console.error("Error setting up auth subscription:", e);
      }
    };

    loadSession();
    setupAuthSubscription();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return false;
      } else {
        setUser(data.user); // Update user immediately after signup
        return true;
      }
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return false;
      } else {
        setUser(data.user); // Update user immediately after signin
        return true;
      }
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    error,
    isInitialAuthCheckComplete,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'owner' | 'manager' | null;
  username: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'owner' | 'manager' | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    return data?.role || null;
  };

  const fetchUsername = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    return data?.username || null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchUserRole(session.user.id),
          fetchUsername(session.user.id)
        ]).then(([userRole, userName]) => {
          setRole(userRole);
          setUsername(userName);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          Promise.all([
            fetchUserRole(session.user.id),
            fetchUsername(session.user.id)
          ]).then(([userRole, userName]) => {
            setRole(userRole);
            setUsername(userName);
          });
        } else {
          setRole(null);
          setUsername(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { username, password }
      });

      if (error) {
        return { error: error.message || 'Invalid username or password' };
      }

      if (data.error) {
        return { error: data.error };
      }

      // Set the session from the edge function response
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'An error occurred during sign in' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, role, username, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

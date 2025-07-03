import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryStore } from '@/hooks/useInventoryStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { fetchAllData, setUser: setStoreUser, clearData } = useInventoryStore();

  // Optimized initialization with parallel loading
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Load user profile and data in parallel for maximum speed
          const [profileResult, dataResult] = await Promise.allSettled([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single(),
            fetchAllData(session.user.id)
          ]);

          // Handle profile result
          if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
            setUserProfile(profileResult.value.data);
            // Set user in store with profile data
            setStoreUser({
              id: session.user.id,
              name: profileResult.value.data.name || session.user.email?.split('@')[0] || 'Usuario',
              email: session.user.email || '',
              company: profileResult.value.data.company || 'Sin empresa',
              role: profileResult.value.data.role || 'Usuario',
              avatar: profileResult.value.data.avatar
            });
          } else {
            // Set default user data if profile not found
            setStoreUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
              email: session.user.email || '',
              company: session.user.user_metadata?.company || 'Sin empresa',
              role: 'Usuario',
              avatar: session.user.user_metadata?.avatar
            });
          }

          // Handle data result
          if (dataResult.status === 'rejected') {
            console.error('Error loading data:', dataResult.reason);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
                 if (event === 'SIGNED_IN' && session?.user) {
           setUser(session.user);
           
           // Load data in parallel when user signs in
           const [profileResult, dataResult] = await Promise.allSettled([
             supabase
               .from('profiles')
               .select('*')
               .eq('id', session.user.id)
               .single(),
             fetchAllData(session.user.id)
           ]);

           if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
             setUserProfile(profileResult.value.data);
             setStoreUser({
               id: session.user.id,
               name: profileResult.value.data.name || session.user.email?.split('@')[0] || 'Usuario',
               email: session.user.email || '',
               company: profileResult.value.data.company || 'Sin empresa',
               role: profileResult.value.data.role || 'Usuario',
               avatar: profileResult.value.data.avatar
             });
           } else {
             setStoreUser({
               id: session.user.id,
               name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
               email: session.user.email || '',
               company: session.user.user_metadata?.company || 'Sin empresa',
               role: 'Usuario',
               avatar: session.user.user_metadata?.avatar
             });
           }

           if (dataResult.status === 'rejected') {
             console.error('Error loading data on sign in:', dataResult.reason);
           }
         } else if (event === 'SIGNED_OUT') {
           setUser(null);
           setUserProfile(null);
           setStoreUser(null);
           clearData();
         }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchAllData, setStoreUser, clearData]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Create profile in parallel with auth
        const profilePromise = supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            email: email,
            created_at: new Date().toISOString(),
          });

        // Create initial data structures in parallel
        const [profileResult] = await Promise.allSettled([profilePromise]);

        if (profileResult.status === 'rejected') {
          console.error('Error creating profile:', profileResult.reason);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    userProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

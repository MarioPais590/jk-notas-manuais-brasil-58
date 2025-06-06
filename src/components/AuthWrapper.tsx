
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import AuthModal from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        setShowAuthModal(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        setShowAuthModal(false);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Notas JK",
        });
      } else if (event === 'SIGNED_OUT') {
        setShowAuthModal(true);
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AuthModal 
        isOpen={showAuthModal && !user} 
        onClose={() => {}} // Não permitir fechar sem autenticar
      />
    </>
  );
};

export default AuthWrapper;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoggingIn(true);
    await login(role);
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#09090b]">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-[#18181b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-white/10 transform rotate-3 hover:rotate-0 transition-transform">
            <span className="text-black font-display font-bold text-3xl">Ik</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">InkLink</h1>
          <p className="text-zinc-400">Design. Discover. Get Inked.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin(UserRole.CLIENT)}
            disabled={isLoggingIn}
            className="w-full group relative overflow-hidden bg-white hover:bg-zinc-200 text-black font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            {isLoggingIn && selectedRole === UserRole.CLIENT ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="font-roboto">Sign in with Google</span>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#18181b] px-2 text-zinc-500 font-medium">Artist Access</span>
            </div>
          </div>

          <button
            onClick={() => handleLogin(UserRole.ARTIST)}
            disabled={isLoggingIn}
            className="w-full bg-[#27272a] hover:bg-[#3f3f46] border border-white/10 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
             {isLoggingIn && selectedRole === UserRole.ARTIST ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Palette className="w-5 h-5 text-indigo-400" />
            )}
            <span>Artist Dashboard Login</span>
          </button>
        </div>

        <p className="text-xs text-center text-zinc-600 mt-8 leading-relaxed">
          By continuing, you agree to InkLink's Terms of Service and Privacy Policy.
          <br/>
          <span className="opacity-50">Secured by Google Authentication</span>
        </p>
      </motion.div>
    </div>
  );
};

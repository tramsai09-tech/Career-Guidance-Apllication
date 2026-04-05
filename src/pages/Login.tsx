import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';

export default function Login() {
  const { user, signIn, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <GlassCard className="w-full max-w-md text-center space-y-8 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20"
        >
          <Sparkles size={40} className="text-white" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Career Guide <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
          </h1>
          <p className="text-slate-400">Your intelligent companion for engineering success.</p>
        </div>

        <div className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3 text-left"
            >
              <AlertCircle size={18} className="shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Login Failed</p>
                <p className="text-xs opacity-80">{error}</p>
                <p className="text-[10px] mt-2 opacity-60">
                  Tip: If you're seeing "auth/unauthorized-domain" or popup issues, try opening the app in a new tab.
                </p>
              </div>
              <button onClick={clearError} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <LogIn size={14} className="rotate-45" />
              </button>
            </motion.div>
          )}

          <button
            onClick={signIn}
            disabled={loading}
            className="w-full glass-button flex items-center justify-center gap-3 py-4 text-lg hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
          <p className="text-xs text-slate-500">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

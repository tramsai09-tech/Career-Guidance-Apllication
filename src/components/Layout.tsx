import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { GlassCard } from './GlassCard';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';

export function Layout() {
  const { user, loading, sendVerification, logout } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce email verification
  if (!user.emailVerified) {
    const handleResend = async () => {
      setSending(true);
      await sendVerification();
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    };

    const handleRefresh = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        window.location.reload();
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        <GlassCard className="w-full max-w-md text-center space-y-6 py-12">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl mx-auto flex items-center justify-center text-blue-400">
            <Mail size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Verify your email</h2>
            <p className="text-slate-400">
              We've sent a verification link to <span className="text-blue-400 font-medium">{user.email}</span>. 
              Please check your inbox to continue.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="w-full glass-button flex items-center justify-center gap-2 py-3 text-sm font-bold disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : sent ? (
                "Verification Email Sent!"
              ) : (
                "Resend Verification Email"
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              className="w-full py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              I've verified my email
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-400/70 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="relative z-10">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error}`;
          isFirestoreError = true;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
          </div>

          <GlassCard className="w-full max-w-md text-center space-y-6 py-12 border-red-500/20">
            <div className="w-20 h-20 bg-red-500/20 rounded-3xl mx-auto flex items-center justify-center text-red-400">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {errorMessage}
              </p>
              {isFirestoreError && (
                <p className="text-xs text-slate-500 mt-2 italic">
                  This might be due to missing permissions or a network issue.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full glass-button flex items-center justify-center gap-2 py-3 text-sm font-bold"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                <Home size={18} />
                Back to Home
              </button>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

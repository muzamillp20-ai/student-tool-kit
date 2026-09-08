import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getVerificationCode } from '../context/AuthContext';
import { Mail, Loader2, ArrowRight, AlertCircle, CheckCircle, RefreshCw, Shield } from 'lucide-react';

export default function EmailVerificationPage() {
  const { user, verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.emailVerified) {
      navigate('/', { replace: true });
      return;
    }
    // Show the demo verification code (in production, this would be sent via email)
    setDemoCode(getVerificationCode());
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = verifyEmail(code);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } else {
      setError(result.error || 'Verification failed');
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const newCode = resendVerificationCode();
    setDemoCode(newCode);
    setResendCooldown(60);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f14] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 mb-4">
            {success ? (
              <CheckCircle size={32} className="text-green-400" />
            ) : (
              <Mail size={32} className="text-indigo-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {success ? 'Email Verified!' : 'Verify your email'}
          </h1>
          <p className="text-sm text-gray-400">
            {success
              ? 'Redirecting you to your dashboard...'
              : `We've sent a 6-digit code to ${user?.email || 'your email'}`
            }
          </p>
        </div>

        {!success && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-mono tracking-widest placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={14} className={resendCooldown > 0 ? '' : ''} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification code'}
              </button>

              {/* Demo notice - in production, this would be removed */}
              {demoCode && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-left">
                  <Shield size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-300/80">
                    <p className="font-medium mb-0.5">Demo Mode</p>
                    <p>
                      In production, this code would be sent to your email.
                      For this demo, your code is: <span className="font-mono font-bold text-yellow-300">{demoCode}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-white/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <p className="text-sm text-gray-300">
              Your email has been verified successfully. You can now access all features of AI Utility Hub.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Loader2, ArrowLeft, CheckCircle, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [demoResetCode, setDemoResetCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setSent(true);
      // In a real app, this would be sent via email
      // For demo, generate a code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoResetCode(code);
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f14] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
          <p className="text-sm text-gray-400">
            {sent ? 'Check your email for reset instructions' : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors text-sm"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-300">
                If an account exists for <span className="font-medium text-white">{email}</span>, 
                you will receive a password reset link shortly.
              </p>

              {/* Demo notice */}
              {demoResetCode && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-left">
                  <Shield size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-300/80">
                    <p className="font-medium mb-0.5">Demo Mode</p>
                    <p>
                      In production, a reset link would be emailed to you.
                      For this demo, your reset code is: <span className="font-mono font-bold text-yellow-300">{demoResetCode}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Mail, Lock, Smartphone, Shield } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

type LoginMethod = 'password' | 'otp';

export const Login = ({ onNavigate }: LoginProps) => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onNavigate('home');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setDemoOtp('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setSuccess(`OTP sent to your email and phone number${data.phone ? ` ending in ${data.phone.slice(-4)}` : ''}`);

      if (data.demo_otp) {
        setDemoOtp(data.demo_otp);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setSuccess('OTP verified! Redirecting...');

      // Navigate using the magic link provided
      if (data.access_token) {
        window.location.href = data.access_token;
      } else {
        setTimeout(() => {
          onNavigate('home');
        }, 1000);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccess('');
    setDemoOtp('');
  };

  const switchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    resetForm();
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-black py-8 px-4">
      <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-xl w-full max-w-md border dark:border-slate-700">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-black">Welcome Back</h1>
        <p className="text-center text-slate-600 dark:text-black mb-8">Sign in to continue to your account</p>

        {/* Login Method Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => switchMethod('password')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'password'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-black hover:text-slate-900 dark:hover:text-slate-400'
            }`}
          >
            <Lock className="w-4 h-4" />
            Password
          </button>
          <button
            type="button"
            onClick={() => switchMethod('otp')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
              loginMethod === 'otp'
                ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                : 'text-slate-600 dark:text-black hover:text-slate-900 dark:hover:text-slate-400'
            }`}
          >
            <Shield className="w-4 h-4" />
            OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-black text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-black text-sm">
            {success}
          </div>
        )}

        {demoOtp && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg text-yellow-800 dark:text-black text-sm">
            <strong>Demo Mode:</strong> Your OTP is <strong className="text-lg">{demoOtp}</strong>
          </div>
        )}

        {/* Password Login Form */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {loginMethod === 'otp' && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email-otp" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email-otp"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-black mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-black">
                      We'll send a 6-digit verification code to both your registered email address and phone number.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-5">
                <div>
                  <label htmlFor="otp-input" className="block text-sm font-medium text-slate-700 dark:text-black mb-2">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="otp-input"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      pattern="\d{6}"
                      maxLength={6}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-black dark:text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-semibold"
                      placeholder="000000"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-black mt-2">
                    OTP sent to {email}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-black rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Change Email
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </form>
            )}
          </>
        )}

        <p className="mt-6 text-center text-slate-600 dark:text-black">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

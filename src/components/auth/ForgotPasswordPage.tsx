import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole } from 'lucide-react';
import { authService } from '../../services/authService';
import { isValidPassword, PasswordStrength } from './PasswordStrength';

interface ForgotPasswordPageProps { onBack: () => void; }

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      const result = await authService.requestPasswordReset(email);
      setToken(result.resetToken || '');
      setMessage(result.resetToken ? 'Reset request created. Enter a new password below.' : result.message);
    } catch (err: any) { setError(err.message || 'Could not request a password reset.'); } finally { setLoading(false); }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!isValidPassword(password)) { setError('Password must be at least 10 characters and include an uppercase letter and a special character.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try { await authService.resetPassword(token, password); setMessage('Password updated successfully. You can now sign in.'); setToken(''); setPassword(''); setConfirmPassword(''); } catch (err: any) { setError(err.message || 'Could not reset your password.'); } finally { setLoading(false); }
  };

  return <main className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-10"><div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div className="space-y-2 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"><KeyRound className="h-6 w-6" /></div><h1 className="text-2xl font-black text-slate-900 dark:text-white">Reset your password</h1><p className="text-xs leading-5 text-slate-500">Request a secure reset link, then choose a new password.</p></div>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
    {message && <p className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4 shrink-0" />{message}</p>}
    {!token ? <form onSubmit={requestReset} className="space-y-4"><label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Account email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="name@example.com" /></label><button disabled={loading} className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{loading ? 'Sending...' : 'Request password reset'}</button></form> : <form onSubmit={resetPassword} className="space-y-4"><label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Reset token<input required value={token} onChange={(event) => setToken(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-800" /></label><label className="block text-xs font-bold text-slate-700 dark:text-slate-300">New password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" /></label><PasswordStrength password={password} /><label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Confirm new password<input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" /></label><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"><LockKeyhole className="h-4 w-4" />{loading ? 'Updating...' : 'Update password'}</button></form>}
    <button onClick={onBack} className="mx-auto flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>
  </div></main>;
};
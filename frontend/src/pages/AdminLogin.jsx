import React, { useState } from 'react';
import upfLogo from '../assets/UPFLOGO-removebg-preview.png';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import LanguageDropdown from '../components/LanguageDropdown';

export default function AdminLogin() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, true); // true for isAdminLogin
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Identifiants administrateur incorrects');
    }
  };

  const handleAutofill = () => {
    setEmail('admin@upf.ac.ma');
    setPassword('Password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-800 relative overflow-hidden font-sans">
      {/* Absolute Language Dropdown */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageDropdown />
      </div>

      {/* Dynamic Background Design Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-rose-300/10 via-amber-300/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-rose-300/10 via-purple-300/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-lg p-0 rounded-3xl bg-white border border-slate-200/80 shadow-2xl relative z-10 mx-4 overflow-hidden transition-all duration-300 hover:shadow-rose-500/5">
        {/* Glow Header Band */}
        <div className="h-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />
        
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <img src={upfLogo} alt="UPF Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('login.admin_title')}
            </h2>
            <p className="text-slate-500 text-xs mt-2 font-medium">{t('login.admin_desc')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-600 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('login.admin_email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs transition-all duration-200 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  placeholder="admin@upf.ac.ma"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('login.admin_password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs transition-all duration-200 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-rose-500/10 focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:shadow-rose-500/20"
            >
              {loading ? t('login.admin_loading') : t('login.admin_button')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <span className="block text-center text-slate-400 text-[10px] font-bold mb-4 tracking-widest uppercase">{t('login.admin_autofill_title')}</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-3 px-3 rounded-2xl bg-slate-50/50 border border-slate-200 hover:bg-rose-500/5 hover:border-rose-500/20 text-slate-600 hover:text-rose-600 transition-all text-xs font-bold flex items-center justify-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span>{t('login.admin_autofill')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

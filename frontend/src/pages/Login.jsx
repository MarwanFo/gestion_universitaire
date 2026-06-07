import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserCheck, GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import LanguageDropdown from '../components/LanguageDropdown';

export default function Login() {
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
    const result = await login(email, password, false);
    setLoading(false);
    if (result.success) {
      if (result.user.role === 'professor') {
        navigate('/professor');
      } else {
        navigate('/student');
      }
    } else {
      setError(result.message || 'Identifiants incorrects');
    }
  };

  const handleAutofill = (role) => {
    if (role === 'professor') {
      setEmail('prof.benjelloun@upf.ac.ma');
      setPassword('Password123');
    } else if (role === 'student') {
      setEmail('student.alami@upf.ac.ma');
      setPassword('Password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-800 relative overflow-hidden font-sans">
      {/* Absolute Language Dropdown */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageDropdown />
      </div>

      {/* Dynamic Background Design Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-300/10 via-purple-300/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-violet-300/10 via-pink-300/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-lg p-0 rounded-3xl bg-white border border-slate-200/80 shadow-2xl relative z-10 mx-4 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/5">
        {/* Glow Header Band */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <span className="text-white font-black text-xl tracking-wider">UP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('login.space_title')}
            </h2>
            <p className="text-slate-550 text-xs mt-2 font-medium">{t('login.space_desc')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-600 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('login.email_label')}
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs transition-all duration-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                  placeholder="votre.nom@upf.ac.ma"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {t('login.password_label')}
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
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs transition-all duration-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
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
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-indigo-500/10 focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:shadow-indigo-500/20"
            >
              {loading ? t('login.loading') : t('login.button')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <span className="block text-center text-slate-400 text-[10px] font-bold mb-4 tracking-widest uppercase">{t('login.autofill_title')}</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAutofill('professor')}
                className="py-3 px-3 rounded-2xl bg-slate-50/50 border border-slate-200 hover:bg-purple-500/5 hover:border-purple-500/20 text-slate-600 hover:text-purple-600 transition-all text-xs font-bold flex flex-col items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <span>{t('login.autofill_professor')}</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleAutofill('student')}
                className="py-3 px-3 rounded-2xl bg-slate-50/50 border border-slate-200 hover:bg-pink-500/5 hover:border-pink-500/20 text-slate-600 hover:text-pink-600 transition-all text-xs font-bold flex flex-col items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-600">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <span>{t('login.autofill_student')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

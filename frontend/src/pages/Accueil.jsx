import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import LanguageDropdown from '../components/LanguageDropdown';

export default function Accueil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleCTA = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'professor') navigate('/professor');
      else navigate('/student');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-violet-200/20 to-fuchsia-200/10 blur-[130px] pointer-events-none" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
              UP
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              UPF Portal
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors duration-200">{t('landing.spaces')}</a>
            <a href="#services" className="hover:text-slate-900 transition-colors duration-200">{t('landing.services')}</a>
            <a href="#stats" className="hover:text-slate-900 transition-colors duration-200">{t('landing.stats')}</a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <button
              onClick={handleCTA}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200 flex items-center gap-2 group shadow-sm"
            >
              {user ? t('landing.my_space') : t('landing.login')}
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-100/50 flex flex-col gap-3 animate-fadeIn">
            <a 
              href="#features" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-semibold text-xs transition-all uppercase tracking-wider"
            >
              {t('landing.spaces')}
            </a>
            <a 
              href="#services" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-semibold text-xs transition-all uppercase tracking-wider"
            >
              {t('landing.services')}
            </a>
            <a 
              href="#stats" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 font-semibold text-xs transition-all uppercase tracking-wider"
            >
              {t('landing.stats')}
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            {t('landing.badge')}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            {t('landing.hero_title_1')} <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t('landing.hero_title_2')}
            </span>
          </h1>
          
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-0.5 text-center"
            >
              {t('landing.discover_spaces')}
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-100/60 backdrop-blur-xl">
            <div className="text-center p-4">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">GINFO</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">{t('landing.stats_filiere')}</span>
            </div>
            <div className="text-center p-4 border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">100%</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">{t('landing.stats_digital')}</span>
            </div>
            <div className="text-center p-4 md:border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">0%</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">{t('landing.stats_conflict')}</span>
            </div>
            <div className="text-center p-4 border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">24/7</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">{t('landing.stats_availability')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Espaces / Roles Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.three_spaces_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
              {t('landing.three_spaces_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Espace Etudiant */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-indigo-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('landing.student_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t('landing.student_desc')}
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {t('landing.student_bullet_1')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {t('landing.student_bullet_2')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> {t('landing.student_bullet_3')}</li>
              </ul>
            </div>

            {/* Espace Professeur */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-purple-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('landing.prof_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t('landing.prof_desc')}
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {t('landing.prof_bullet_1')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {t('landing.prof_bullet_2')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {t('landing.prof_bullet_3')}</li>
              </ul>
            </div>

            {/* Espace Admin */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-pink-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('landing.admin_title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t('landing.admin_desc')}
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> {t('landing.admin_bullet_1')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> {t('landing.admin_bullet_2')}</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> {t('landing.admin_bullet_3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Transversaux Section */}
      <section id="services" className="py-20 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.features_title')}</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
              {t('landing.features_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">{t('landing.feature_timetable_title')}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t('landing.feature_timetable_desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">{t('landing.feature_logbook_title')}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t('landing.feature_logbook_desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">{t('landing.feature_docs_title')}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t('landing.feature_docs_desc')}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">{t('landing.feature_classroom_title')}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {t('landing.feature_classroom_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/80 bg-slate-50 text-center text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-slate-500">{t('landing.footer_tw2')}</span>
          <span>{t('landing.footer_copyright')}</span>
        </div>
      </footer>
    </div>
  );
}

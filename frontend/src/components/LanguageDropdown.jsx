import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageDropdown = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 text-xs font-bold text-slate-700 shadow-sm"
      >
        <span className="text-sm leading-none">{currentLanguage.flag}</span>
        <span className="uppercase tracking-wider text-[10px]">{currentLanguage.code}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-100/80 z-50 animate-fadeIn">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left rtl:text-right text-xs font-bold transition-all duration-150 ${
                  i18n.language === lang.code
                    ? 'bg-indigo-50/60 text-indigo-600'
                    : 'text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-sm leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageDropdown;

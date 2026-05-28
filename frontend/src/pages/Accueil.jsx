import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

export default function Accueil() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            <a href="#features" className="hover:text-slate-900 transition-colors duration-200">Espaces</a>
            <a href="#services" className="hover:text-slate-900 transition-colors duration-200">Services</a>
            <a href="#stats" className="hover:text-slate-900 transition-colors duration-200">Chiffres</a>
          </nav>

          <button
            onClick={handleCTA}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200 flex items-center gap-2 group shadow-sm"
          >
            {user ? 'Mon Espace' : 'Connexion'}
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Nouvelle Plateforme Intégrée
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            L'excellence académique <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              connectée en temps réel.
            </span>
          </h1>
          
          <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Accédez à vos cours, consultez vos notes, gérez vos plannings et simplifiez vos démarches administratives sur le portail universitaire nouvelle génération de l'UPF.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-0.5"
            >
              Accéder au Portail Académique
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-base transition-all duration-300 hover:bg-slate-50 text-center shadow-sm"
            >
              Découvrir les Espaces
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
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">Filière d'Excellence</span>
            </div>
            <div className="text-center p-4 border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">100%</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">Suivi Numérique</span>
            </div>
            <div className="text-center p-4 border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">0%</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">Conflit de Réservation</span>
            </div>
            <div className="text-center p-4 border-l border-slate-100">
              <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900">24/7</span>
              <span className="text-xs sm:text-sm text-slate-500 uppercase font-semibold tracking-wider mt-1 block">Disponibilité</span>
            </div>
          </div>
        </div>
      </section>

      {/* Espaces / Roles Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Trois Espaces Dédiés et Sécurisés</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
              Chaque utilisateur dispose d'outils sur mesure adaptés à ses missions au sein de l'établissement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Espace Etudiant */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-indigo-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Espace Étudiant</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Consultez vos relevés de notes en temps réel, suivez vos absences, téléchargez vos cours sur Classroom et soumettez vos demandes de documents en quelques clics.
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Notes CC1, CC2 & Examens</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Justificatifs d'absences en ligne</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Téléchargement d'attestations</li>
              </ul>
            </div>

            {/* Espace Professeur */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-purple-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Espace Enseignant</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Gérez vos cours en toute sérénité : saisie sécurisée des notes, gestion dynamique des absences, mise à jour du cahier de textes et réservation instantanée de salles disponibles.
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Saisie sécurisée des évaluations</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Outil d'anti-conflit de salles</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Cahier de textes interactif</li>
              </ul>
            </div>

            {/* Espace Admin */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-lg shadow-slate-100/50 hover:border-pink-500/20 transition-all duration-300 group hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Administration</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Pilotez l'ensemble de l'établissement : gérez les utilisateurs, attribuez les modules, organisez les emplois du temps globaux et validez les demandes administratives officielles.
              </p>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> CRUD utilisateurs, salles & modules</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Génération automatique de PDFs</li>
                <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Planning global & Emploi du temps</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Transversaux Section */}
      <section id="services" className="py-20 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fonctionnalités Clés</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm sm:text-base">
              Une infrastructure robuste pensée pour répondre à toutes les exigences de gestion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">Emploi du Temps</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Grille interactive affichant le planning hebdomadaire de cours mis à jour instantanément.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">Cahier de Textes</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Suivi des séances dispensées par module, objectifs et devoirs planifiés par l'enseignant.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">Demandes de Documents</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Workflow complet de demande de relevés, attestations ou ordres de mission avec signature.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-2">Classroom Collaboratif</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Espace d'annonces de cours et de discussions instantanées entre étudiants et professeurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/80 bg-slate-50 text-center text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-slate-500">UPF Portal — Projet TW2</span>
          <span>© 2026 Université Privée de Fès. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
}

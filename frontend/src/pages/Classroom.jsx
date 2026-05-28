import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  BookOpen, 
  User, 
  Paperclip,
  Smile,
  Megaphone,
  MessageSquare
} from 'lucide-react';

export default function Classroom() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modules list
  const [modules, setModules] = useState([
    { id: 1, name: 'Technologie Web 2 (React & Laravel)', code: 'GINFO-TW2' },
    { id: 2, name: 'Base de données Avancées (Postgres)', code: 'GINFO-DB' },
    { id: 3, name: 'Management de Projet Agile', code: 'GINFO-AGILE' },
  ]);

  const [activeModuleId, setActiveModuleId] = useState(1);

  // Announcements and Comments
  const [announcements, setAnnouncements] = useState({
    1: [
      {
        id: 101,
        author: 'Prof. Benjelloun',
        role: 'professor',
        title: 'Mise en ligne du TP 2 - Intégration React & Sanctum',
        content: 'Bonjour à tous, les énoncés et fichiers de démarrage pour le TP 2 sont disponibles. Veuillez travailler la partie authentification JWT et rendre vos dépôts Git avant Lundi prochain.',
        date: '2026-05-28 09:30',
        comments: [
          { id: 201, author: 'Marwan Alami', role: 'student', text: 'Merci Monsieur ! Est-ce qu\'on doit utiliser le fallback hors-ligne en cas d\'erreur de CORS ?' },
          { id: 202, author: 'Prof. Benjelloun', role: 'professor', text: 'Oui, vous pouvez implémenter la simulation dans les services d\'API en cas de défaillance.' }
        ]
      },
      {
        id: 102,
        author: 'Prof. Benjelloun',
        role: 'professor',
        title: 'Rappel : Projet de fin de module',
        content: 'N\'oubliez pas de finaliser vos spécifications techniques (Use Case, diagrammes de séquence) d\'ici demain soir. Bon courage !',
        date: '2026-05-25 15:00',
        comments: []
      }
    ],
    2: [
      {
        id: 103,
        author: 'Prof. Tazi',
        role: 'professor',
        title: 'Support de cours - Optimisation des requêtes PostgreSQL',
        content: 'Le diaporama sur la création des index complexes et l\'analyse du plan d\'exécution (EXPLAIN ANALYZE) a été déposé. Bon visionnage.',
        date: '2026-05-26 10:15',
        comments: []
      }
    ],
    3: []
  });

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  // Fetch modules on load
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get('/classroom/modules');
        if (res.data.length > 0) {
          setModules(res.data.map(m => ({
            id: m.id,
            name: m.name,
            code: m.code
          })));
          setActiveModuleId(res.data[0].id);
        }
      } catch (e) {
        console.warn("Could not retrieve modules from API, using mock state.", e);
      }
    };
    fetchModules();
  }, []);

  // Fetch announcements when activeModuleId changes
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get(`/classroom/modules/${activeModuleId}`);
        setAnnouncements(prev => ({
          ...prev,
          [activeModuleId]: res.data.map(ann => ({
            id: ann.id,
            author: ann.professor ? ann.professor.name : 'Enseignant',
            role: 'professor',
            title: ann.title,
            content: ann.content,
            date: ann.created_at ? ann.created_at.substring(0, 16).replace('T', ' ') : '2026-05-28',
            comments: ann.comments ? ann.comments.map(c => ({
              id: c.id,
              author: c.user ? c.user.name : 'Inconnu',
              role: c.user ? c.user.role : 'student',
              text: c.content
            })) : []
          }))
        }));
      } catch (e) {
        console.warn("Could not fetch announcements from API, using mock states.", e);
      }
    };
    fetchAnnouncements();
  }, [activeModuleId]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    try {
      const res = await api.post('/classroom/announcements', {
        module_id: activeModuleId,
        title: newTitle,
        content: newContent
      });

      const ann = res.data.announcement;
      const newPost = {
        id: ann.id,
        author: ann.professor ? ann.professor.name : (user?.name || 'Professeur'),
        role: 'professor',
        title: ann.title,
        content: ann.content,
        date: ann.created_at ? ann.created_at.substring(0, 16).replace('T', ' ') : 'À l\'instant',
        comments: []
      };

      setAnnouncements(prev => ({
        ...prev,
        [activeModuleId]: [newPost, ...(prev[activeModuleId] || [])]
      }));
    } catch (err) {
      const newPost = {
        id: Date.now(),
        author: user?.name || 'Professeur',
        role: user?.role || 'professor',
        title: newTitle,
        content: newContent,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        comments: []
      };
      setAnnouncements(prev => ({
        ...prev,
        [activeModuleId]: [newPost, ...(prev[activeModuleId] || [])]
      }));
    }

    setNewTitle('');
    setNewContent('');
  };

  const handlePostComment = async (announcementId) => {
    const text = commentInputs[announcementId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/classroom/announcements/${announcementId}/comments`, {
        content: text
      });

      const c = res.data.comment;

      const updatedPosts = announcements[activeModuleId].map(post => {
        if (post.id === announcementId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: c.id,
                author: c.user ? c.user.name : (user?.name || 'Anonyme'),
                role: c.user ? c.user.role : (user?.role || 'student'),
                text: c.content
              }
            ]
          };
        }
        return post;
      });

      setAnnouncements(prev => ({
        ...prev,
        [activeModuleId]: updatedPosts
      }));
    } catch (err) {
      const updatedPosts = announcements[activeModuleId].map(post => {
        if (post.id === announcementId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now(),
                author: user?.name || 'Anonyme',
                role: user?.role || 'student',
                text: text
              }
            ]
          };
        }
        return post;
      });

      setAnnouncements(prev => ({
        ...prev,
        [activeModuleId]: updatedPosts
      }));
    }

    setCommentInputs({
      ...commentInputs,
      [announcementId]: ''
    });
  };

  const handleBack = () => {
    if (user?.role === 'admin') navigate('/admin');
    else if (user?.role === 'professor') navigate('/professor');
    else navigate('/student');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-indigo-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Module Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between relative z-10">
        <div>
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 uppercase tracking-wider mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour Espace
          </button>

          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
            Mes Espaces Cours
          </h2>

          <nav className="space-y-2">
            {modules.map(mod => (
              <button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  activeModuleId === mod.id 
                    ? 'bg-indigo-50 border-indigo-150 text-indigo-900 font-bold shadow-sm shadow-indigo-500/5' 
                    : 'bg-slate-50/50 border-transparent hover:border-slate-200 text-slate-550 hover:text-slate-900'
                }`}
              >
                <span className="block text-[8px] font-bold text-slate-450 uppercase tracking-widest mb-1">{mod.code}</span>
                <span className="leading-snug text-xs">{mod.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Feed Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10 max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              {modules.find(m => m.id === activeModuleId)?.code}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {modules.find(m => m.id === activeModuleId)?.name}
            </h1>
          </div>
        </header>

        {/* Professor Compose Area */}
        {user?.role === 'professor' && (
          <form onSubmit={handlePostAnnouncement} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100/50 backdrop-blur-xl mb-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
              <Megaphone className="h-4.5 w-4.5 text-indigo-500" />
              Publier une nouvelle annonce de cours
            </div>
            
            <div>
              <input 
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Titre de l'annonce..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <textarea 
                rows="4"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Rédigez votre annonce ici (devoirs, supports de TP, rappels, etc.)..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button type="button" className="p-2 rounded-lg hover:bg-slate-50 text-slate-450 hover:text-slate-700 transition-colors">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button type="button" className="p-2 rounded-lg hover:bg-slate-50 text-slate-450 hover:text-slate-700 transition-colors">
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              <button type="submit" className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Publier l'annonce
              </button>
            </div>
          </form>
        )}

        {/* Announcements Feed */}
        <div className="space-y-6">
          {announcements[activeModuleId] && announcements[activeModuleId].length > 0 ? (
            announcements[activeModuleId].map(post => (
              <div key={post.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
                {/* Post Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900 text-xs">{post.author}</span>
                      <span className="inline-block px-1.5 py-0.25 rounded bg-purple-50 border border-purple-100 text-purple-600 text-[8px] font-extrabold uppercase tracking-wide mt-0.5">{post.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{post.date}</span>
                </div>

                {/* Post Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{post.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {/* Comments Area */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                    Commentaires ({post.comments.length})
                  </span>
                  
                  {post.comments.length > 0 && (
                    <div className="space-y-3 pl-4 border-l border-slate-200">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="text-xs space-y-1">
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-slate-800">{comment.author}</span>
                            <span className="text-[8px] text-slate-500 uppercase font-semibold">({comment.role})</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment form */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Ajouter un commentaire de cours..."
                      onKeyDown={e => { if (e.key === 'Enter') handlePostComment(post.id); }}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <button 
                      onClick={() => handlePostComment(post.id)}
                      className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-450 hover:text-slate-800 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-450 text-xs italic shadow-sm">
              Aucune annonce publiée pour le moment dans cet espace.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

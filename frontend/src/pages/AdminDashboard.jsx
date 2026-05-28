import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users as UsersIcon, 
  GraduationCap, 
  BookOpen, 
  Calendar as CalendarIcon, 
  FileText, 
  LogOut, 
  Plus, 
  Trash2, 
  Check, 
  X,
  FileCheck,
  Building,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local State synchronized with API
  const [users, setUsers] = useState([
    { id: 1, name: 'Marwan Alami', email: 'student.alami@upf.ac.ma', role: 'student', group: 'GINFO-3A' },
    { id: 2, name: 'Prof. Benjelloun', email: 'prof.benjelloun@upf.ac.ma', role: 'professor', group: 'N/A' },
    { id: 3, name: 'Prof. Tazi', email: 'prof.tazi@upf.ac.ma', role: 'professor', group: 'N/A' },
    { id: 4, name: 'Sara Kamali', email: 'student.kamali@upf.ac.ma', role: 'student', group: 'GINFO-3A' },
    { id: 5, name: 'Youssef Bennani', email: 'student.bennani@upf.ac.ma', role: 'student', group: 'GINFO-3A' },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', group: '' });

  const [fields, setFields] = useState([
    { id: 1, name: 'Génie Informatique', code: 'GINFO', duration: '3 ans' },
    { id: 2, name: 'Génie Civil', code: 'GCIVIL', duration: '3 ans' },
    { id: 3, name: 'Management & Commerce', code: 'MGT', duration: '3 ans' },
  ]);

  const [documentRequests, setDocumentRequests] = useState([
    { id: 1, studentName: 'Marwan Alami', documentType: 'Attestation de scolarité', date: '2026-05-28', status: 'En attente' },
    { id: 2, studentName: 'Sara Kamali', documentType: 'Relevé de notes - GINFO 2', date: '2026-05-27', status: 'Approuvée' },
    { id: 3, studentName: 'Youssef Bennani', documentType: 'Certificat de réussite', date: '2026-05-26', status: 'Rejetée' },
  ]);

  const [stats, setStats] = useState({ total_students: 5, total_professors: 2, pending_requests: 1 });

  // Fetch PostgreSQL records
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          group: u.group ? u.group.name : 'N/A'
        })));

        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);

        const docsRes = await api.get('/documents');
        setDocumentRequests(docsRes.data.map(doc => ({
          id: doc.id,
          studentName: doc.user ? doc.user.name : 'Inconnu',
          documentType: doc.type === 'scolarite' ? 'Attestation de scolarité' :
                       doc.type === 'releve' ? 'Relevé de notes - GINFO 2' : 'Autre Document',
          date: doc.created_at ? doc.created_at.substring(0, 10) : '2026-05-28',
          status: doc.status === 'pending' ? 'En attente' :
                  doc.status === 'approved' ? 'Approuvée' : 'Rejetée'
        })));
      } catch (e) {
        console.warn("Failed to fetch admin data from backend API, using local mock data.", e);
      }
    };
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    try {
      const res = await api.post('/admin/users', {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: 'Password123',
        group_id: newUser.role === 'student' ? 1 : null // Par défaut GINFO-3A
      });
      const u = res.data.user;
      setUsers(prev => [...prev, {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        group: u.group ? u.group.name : 'N/A'
      }]);
      setStats(prev => ({
        ...prev,
        total_students: u.role === 'student' ? prev.total_students + 1 : prev.total_students,
        total_professors: u.role === 'professor' ? prev.total_professors + 1 : prev.total_professors
      }));
    } catch (error) {
      console.error(error);
      setUsers([...users, { ...newUser, id: Date.now(), group: newUser.group || 'N/A' }]);
    }
    setNewUser({ name: '', email: '', role: 'student', group: '' });
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      console.error(error);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleApproveDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/approve`);
      setDocumentRequests(documentRequests.map(doc => 
        doc.id === id ? { ...doc, status: 'Approuvée' } : doc
      ));
      setStats(prev => ({ ...prev, pending_requests: Math.max(0, prev.pending_requests - 1) }));
    } catch (error) {
      console.error(error);
      setDocumentRequests(documentRequests.map(doc => 
        doc.id === id ? { ...doc, status: 'Approuvée' } : doc
      ));
    }
  };

  const handleRejectDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/reject`, { reason: 'Refus administratif' });
      setDocumentRequests(documentRequests.map(doc => 
        doc.id === id ? { ...doc, status: 'Rejetée' } : doc
      ));
      setStats(prev => ({ ...prev, pending_requests: Math.max(0, prev.pending_requests - 1) }));
    } catch (error) {
      console.error(error);
      setDocumentRequests(documentRequests.map(doc => 
        doc.id === id ? { ...doc, status: 'Rejetée' } : doc
      ));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-indigo-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200/80 relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md">
            UP
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            UPF Portal
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between z-30 transition-transform duration-300 md:static md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
                UP
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                UPF Portal
              </span>
            </div>
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'overview' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Building className="h-4 w-4" />
              Vue d'ensemble
            </button>

            <button
              onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <UsersIcon className="h-4 w-4" />
              Utilisateurs
            </button>

            <button
              onClick={() => { setActiveTab('fields'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'fields' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Filières & Groupes
            </button>

            <button
              onClick={() => { setActiveTab('documents'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'documents' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              Documents
            </button>
          </nav>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-auto border border-transparent hover:border-rose-200/50"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Espace Administration</h1>
            <p className="text-slate-500 text-xs mt-1">Gérez le portail UPF et suivez les activités</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
              {user?.role}
            </span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-700 text-xs font-semibold">{user?.name}</span>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Étudiants</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total_students || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Professeurs</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total_professors || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Demandes en attente</span>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.pending_requests || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Salles Disponibles</span>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">4</p>
              </div>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent activities / status */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Demandes administratives en attente</h3>
                <div className="space-y-4">
                  {documentRequests.filter(d => d.status === 'En attente').map(req => (
                    <div key={req.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <span className="block text-slate-800 text-xs font-bold">{req.studentName}</span>
                        <span className="block text-slate-500 text-[10px] mt-0.5">{req.documentType}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveDoc(req.id)}
                          className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleRejectDoc(req.id)}
                          className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Quick config summary */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Actions Administrateur</h3>
                  <p className="text-slate-600 text-xs leading-relaxed mb-6">
                    Gérez directement les autorisations, créez les nouveaux emplois du temps ou approuvez les demandes de pièces officielles générées automatiquement au format PDF.
                  </p>
                </div>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('users')} className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Ajouter Utilisateur
                  </button>
                  <button onClick={() => setActiveTab('documents')} className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm">
                    <FileText className="h-4 w-4" /> Traiter Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users CRUD */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Add User Panel */}
            <form onSubmit={handleAddUser} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nom Complet</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ex: Ahmed Tazi"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adresse Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Ex: a.tazi@upf.ac.ma"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Rôle</label>
                  <select 
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value, group: e.target.value !== 'student' ? 'N/A' : '' })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-600"
                  >
                    <option value="student">Étudiant</option>
                    <option value="professor">Enseignant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Groupe</label>
                  <input 
                    type="text" 
                    value={newUser.group}
                    disabled={newUser.role !== 'student'}
                    onChange={e => setNewUser({ ...newUser, group: e.target.value })}
                    placeholder="Ex: GINFO-3A"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 disabled:opacity-40"
                  />
                </div>
              </div>
              <button type="submit" className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </form>

            {/* Users Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Groupe</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-500">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          u.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          u.role === 'professor' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                          'bg-pink-50 border-pink-100 text-pink-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{u.group || 'N/A'}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-600 flex items-center justify-center ml-auto transition-all shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Fields & Groups */}
        {activeTab === 'fields' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* List */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Filières Enregistrées</h3>
              <div className="space-y-4">
                {fields.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{f.name}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Code: {f.code} | Durée: {f.duration}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200 text-[10px] font-medium shadow-sm">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuration explanation */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Structure de l'UPF</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Chaque filière regroupe des étudiants et comporte des modules académiques répartis par semestre. 
                </p>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium leading-relaxed">
                  La configuration initiale est modifiable via les migrations de la base PostgreSQL.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Documents Requests validation */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Étudiant</th>
                    <th className="p-4">Document demandé</th>
                    <th className="p-4">Date de demande</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Décisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {documentRequests.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{doc.studentName}</td>
                      <td className="p-4 text-slate-500">{doc.documentType}</td>
                      <td className="p-4 text-slate-400">{doc.date}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          doc.status === 'Approuvée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          doc.status === 'Rejetée' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                          'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {doc.status === 'En attente' ? (
                          <>
                            <button 
                              onClick={() => handleApproveDoc(doc.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <Check className="h-3 w-3" /> Approuver
                            </button>
                            <button 
                              onClick={() => handleRejectDoc(doc.id)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm"
                            >
                              <X className="h-3 w-3" /> Rejeter
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold uppercase italic p-1">Traité</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

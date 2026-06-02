import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Send, 
  LogOut, 
  Download, 
  AlertTriangle,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('grades');

  // 1. Grades State
  const [grades, setGrades] = useState([
    { id: 1, module: 'Technologie Web 2 (React & Laravel)', cc1: 15, cc2: 16, exam: 14, average: 14.6, status: 'Validé' },
    { id: 2, module: 'Base de données Avancées (Postgres)', cc1: 13, cc2: 12, exam: 14, average: 13.4, status: 'Validé' },
    { id: 3, module: 'Réseaux & Protocoles', cc1: 11, cc2: 10, exam: 12, average: 11.4, status: 'Validé' },
    { id: 4, module: 'Management de Projet Agile', cc1: 16, cc2: 15, exam: 17, average: 16.4, status: 'Validé avec Ment.' },
  ]);

  const overallAverage = grades.length > 0 ? grades.reduce((acc, curr) => acc + curr.average, 0) / grades.length : 0;

  // 2. Absences State
  const [absences, setAbsences] = useState([
    { id: 1, date: '2026-05-25', module: 'Réseaux & Protocoles', hours: '2h', status: 'Non justifiée' },
    { id: 2, date: '2026-05-18', module: 'Technologie Web 2', hours: '2h', status: 'Justifiée' },
  ]);

  const [justificationForm, setJustificationForm] = useState({ absenceId: '', reason: '' });
  const [justificationFile, setJustificationFile] = useState(null);
  const [absNotification, setAbsNotification] = useState('');

  // 3. Document Requests State
  const [docRequests, setDocRequests] = useState([
    { id: 1, docType: 'Attestation de scolarité', date: '2026-05-28', status: 'En attente' },
    { id: 2, docType: 'Relevé de notes - GINFO 2', date: '2026-05-27', status: 'Approuvée' },
  ]);

  const [selectedDocType, setSelectedDocType] = useState('Attestation de scolarité');
  const [docNotification, setDocNotification] = useState('');

  // 4. Timetable State
  const [timetable, setTimetable] = useState([
    { day: 'Lundi', slots: [] },
    { day: 'Mardi', slots: [] },
    { day: 'Mercredi', slots: [] },
    { day: 'Jeudi', slots: [] },
    { day: 'Vendredi', slots: [] }
  ]);

  // Fetch API data on load
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const gradesRes = await api.get('/grades');
        if (gradesRes.data.length > 0) {
          setGrades(gradesRes.data.map(g => {
            const finalGrade = Number(g.final_grade) || 0;
            return {
              id: g.id,
              module: g.module ? g.module.name : 'Module',
              cc1: Number(g.cc1) || 0,
              cc2: Number(g.cc2) || 0,
              exam: Number(g.exam) || 0,
              average: finalGrade,
              status: finalGrade >= 12 ? 'Validé avec Ment.' : finalGrade >= 10 ? 'Validé' : 'Non Validé'
            };
          }));
        }

        const absencesRes = await api.get('/absences');
        if (absencesRes.data.length > 0) {
          setAbsences(absencesRes.data.map(abs => ({
            id: abs.id,
            date: abs.date,
            module: abs.timetable && abs.timetable.module ? abs.timetable.module.name : 'Cours',
            hours: '2h',
            status: abs.justification_status === 'none' ? 'Non justifiée' :
                    abs.justification_status === 'pending' ? 'En attente' : 'Justifiée'
          })));
        }

        const docsRes = await api.get('/documents');
        if (docsRes.data.length > 0) {
          setDocRequests(docsRes.data.map(doc => ({
            id: doc.id,
            docType: doc.type === 'scolarite' ? 'Attestation de scolarité' :
                     doc.type === 'releve' ? 'Relevé de notes - GINFO 2' : 'Autre Document',
            date: doc.created_at ? doc.created_at.substring(0, 10) : '2026-05-28',
            status: doc.status === 'pending' ? 'En attente' :
                    doc.status === 'approved' ? 'Approuvée' : 'Rejetée'
          })));
        }

        const timetableRes = await api.get('/timetables');
        if (timetableRes.data.length > 0) {
          setTimetable(timetableRes.data);
        }
      } catch (e) {
        console.warn("Could not retrieve student info from database API, using mock state fallback.", e);
      }
    };
    fetchStudentData();
  }, []);

  const handleJustificationSubmit = async (e) => {
    e.preventDefault();
    if (!justificationForm.absenceId || !justificationForm.reason) return;
    const absId = Number(justificationForm.absenceId);
    
    const formData = new FormData();
    formData.append('reason', justificationForm.reason);
    if (justificationFile) {
      formData.append('file', justificationFile);
    }

    try {
      await api.post(`/absences/${absId}/justify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAbsences(absences.map(abs => 
        abs.id === absId ? { ...abs, status: 'En attente' } : abs
      ));
      setAbsNotification('Votre demande de justification a été soumise avec succès.');
    } catch (err) {
      setAbsNotification('Justification enregistrée (simulation).');
      setAbsences(absences.map(abs => 
        abs.id === absId ? { ...abs, status: 'En attente' } : abs
      ));
    }
    setJustificationForm({ absenceId: '', reason: '' });
    setJustificationFile(null);
    setTimeout(() => setAbsNotification(''), 4000);
  };

  const handleRequestDocument = async (e) => {
    e.preventDefault();
    const typeKey = selectedDocType === 'Attestation de scolarité' ? 'scolarite' :
                    selectedDocType === 'Relevé de notes - GINFO 2' ? 'releve' : 'inscription';
    try {
      const res = await api.post('/documents', { type: typeKey });
      const newDoc = res.data.request;
      setDocRequests(prev => [{
        id: newDoc.id,
        docType: selectedDocType,
        date: newDoc.created_at ? newDoc.created_at.substring(0, 10) : new Date().toISOString().split('T')[0],
        status: 'En attente'
      }, ...prev]);
      setDocNotification(`Votre demande de "${selectedDocType}" a été envoyée pour validation.`);
    } catch (err) {
      const newRequest = {
        id: Date.now(),
        docType: selectedDocType,
        date: new Date().toISOString().split('T')[0],
        status: 'En attente'
      };
      setDocRequests([newRequest, ...docRequests]);
      setDocNotification(`Votre demande de "${selectedDocType}" a été envoyée (simulation).`);
    }
    setTimeout(() => setDocNotification(''), 4000);
  };

  const handleDownloadPDF = (docId) => {
    const url = `${api.defaults.baseURL || 'http://127.0.0.1:8000/api'}/admin/documents/${docId}/pdf?token=${localStorage.getItem('token')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-indigo-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
              UP
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              UPF Portal
            </span>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('grades')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'grades' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Award className="h-4 w-4" />
              Mes Notes
            </button>

            <button
              onClick={() => setActiveTab('absences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'absences' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Mes Absences
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'timetable' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Emploi du Temps
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'documents' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <FileText className="h-4 w-4" />
              Mes Documents
            </button>
          </nav>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-550 hover:text-rose-605 text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-auto border border-transparent hover:border-rose-200/50"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Étudiant</h1>
            <p className="text-slate-550 text-xs mt-1">Consultez vos résultats et gérez votre scolarité</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-wider">
              Étudiant
            </span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-555 text-xs font-semibold">{user?.group?.name || user?.group || 'GINFO-3A'}</span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-700 text-xs font-semibold">{user?.name}</span>
          </div>
        </header>

        {/* Tab 1: Grades */}
        {activeTab === 'grades' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Average Header Widget */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-100/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shadow-indigo-500/5">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Moyenne Générale Estimée</span>
                <p className="text-4xl font-extrabold text-slate-900 mt-1">{overallAverage.toFixed(2)} <span className="text-lg font-normal text-slate-400">/ 20</span></p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-550 shadow-sm">
                Filière : <span className="text-slate-800 font-bold">Génie Informatique</span>
              </div>
            </div>

            {/* Grades Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Module</th>
                    <th className="p-4 w-28 text-center">CC1 (20%)</th>
                    <th className="p-4 w-28 text-center">CC2 (20%)</th>
                    <th className="p-4 w-28 text-center">Examen (60%)</th>
                    <th className="p-4 w-36 text-center">Moyenne</th>
                    <th className="p-4 w-32 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {grades.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{g.module}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.cc1 || 0).toFixed(2)}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.cc2 || 0).toFixed(2)}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.exam || 0).toFixed(2)}</td>
                      <td className="p-4 text-center font-bold text-slate-900">{Number(g.average || 0).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-extrabold uppercase ${
                          g.average >= 14 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Absences */}
        {activeTab === 'absences' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* List */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Relevé des Absences</h3>
              <div className="space-y-4">
                {absences.map(abs => (
                  <div key={abs.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{abs.module}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Date: {abs.date} | Durée: {abs.hours}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                      abs.status === 'Justifiée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      abs.status === 'En attente' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {abs.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit justification */}
            <div className="space-y-4">
              {absNotification && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 text-indigo-500" />
                  {absNotification}
                </div>
              )}

              <form onSubmit={handleJustificationSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Justifier une absence</h3>
                
                {(() => {
                  const unjustifiedAbsences = absences.filter(abs => abs.status === 'Non justifiée');
                  return (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date de l'absence</label>
                        {unjustifiedAbsences.length === 0 ? (
                          <select
                            disabled
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-400 outline-none cursor-not-allowed"
                          >
                            <option>Aucune absence à justifier</option>
                          </select>
                        ) : (
                          <select
                            value={justificationForm.absenceId}
                            onChange={e => setJustificationForm({ ...justificationForm, absenceId: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                          >
                            <option value="">-- Sélectionnez une absence --</option>
                            {unjustifiedAbsences.map(abs => (
                              <option key={abs.id} value={abs.id}>
                                {abs.date} - {abs.module}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Raison / Commentaire</label>
                        <textarea 
                          rows="4"
                          value={justificationForm.reason}
                          disabled={unjustifiedAbsences.length === 0}
                          onChange={e => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                          placeholder={unjustifiedAbsences.length === 0 ? "Aucune absence à justifier." : "Indiquez le motif et joignez un justificatif à l'administration par email."}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 resize-none leading-relaxed disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document justificatif (PDF ou Image)</label>
                        <input
                          type="file"
                          accept=".pdf, .jpg, .jpeg, .png"
                          disabled={unjustifiedAbsences.length === 0}
                          onChange={e => setJustificationFile(e.target.files[0] || null)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={unjustifiedAbsences.length === 0 || !justificationForm.absenceId}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Send className="h-3.5 w-3.5" /> Soumettre la pièce
                      </button>
                    </>
                  );
                })()}
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Timetable */}
        {activeTab === 'timetable' && (() => {
          const totalSlotsCount = timetable.reduce((acc, d) => acc + (d.slots?.length || 0), 0);
          return (
            <div className="space-y-6 animate-fadeIn">
              {totalSlotsCount === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-sm text-center max-w-xl mx-auto space-y-3 my-12">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">Emploi du temps non disponible</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Votre emploi du temps n'a pas encore été publié par l'administration ou aucun cours n'est actuellement planifié pour votre classe.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {timetable.map((dayPlan, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                      <span className="block border-b border-slate-200 pb-2 font-bold text-slate-900 text-xs text-center uppercase tracking-wider">{dayPlan.day}</span>
                      <div className="mt-4 space-y-3">
                        {dayPlan.slots.length > 0 ? (
                          dayPlan.slots.map((slot, j) => (
                            <div key={j} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                              <span className="block text-[8px] font-bold text-indigo-600">{slot.time}</span>
                              <span className="block text-[10px] font-bold text-slate-800 leading-snug">{slot.module}</span>
                              <span className="block text-[9px] text-slate-500 font-medium">{slot.room}</span>
                            </div>
                          ))
                        ) : (
                          <span className="block text-center text-slate-400 text-[10px] py-4 italic">Aucun cours</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 4: Administrative Documents Requests */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Status list */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Suivi de mes requêtes</h3>
              <div className="space-y-4">
                {docRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{req.docType}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Demandé le: {req.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                        req.status === 'Approuvée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        req.status === 'Rejetée' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        'bg-amber-50 border-amber-100 text-amber-600'
                      }`}>
                        {req.status}
                      </span>
                      {req.status === 'Approuvée' && (
                        <button 
                          onClick={() => handleDownloadPDF(req.id)}
                          className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Form */}
            <div className="space-y-4">
              {docNotification && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  {docNotification}
                </div>
              )}

              <form onSubmit={handleRequestDocument} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Nouvelle Demande</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de document</label>
                  <select
                    value={selectedDocType}
                    onChange={e => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="Attestation de scolarité">Attestation de scolarité</option>
                    <option value="Relevé de notes - GINFO 2">Relevé de notes - GINFO 2</option>
                    <option value="Certificat d'inscription">Certificat d'inscription</option>
                    <option value="Fiche d'inscription pédagogique">Fiche d'inscription pédagogique</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Transmettre la demande
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

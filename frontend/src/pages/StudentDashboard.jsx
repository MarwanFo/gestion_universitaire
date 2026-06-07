import React, { useState, useEffect } from 'react';
import upfLogo from '../assets/UPFLOGO-removebg-preview.png';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import NotificationDropdown from '../components/NotificationDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Cell, LineChart, Line, Legend } from 'recharts';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Send, 
  LogOut, 
  Download, 
  AlertTriangle,
  Award,
  Paperclip,
  File,
  FileArchive,
  Image,
  User,
  MessageSquare,
  Clock,
  MapPin,
  Plus,
  BarChart3 as BarChartIcon
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('grades');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // 1. Grades State
  const [grades, setGrades] = useState([
    { id: 1, module: 'Technologie Web 2 (React & Laravel)', cc1: 15, cc2: 16, exam: 14, average: 14.6, status: 'Validé' },
    { id: 2, module: 'Base de données Avancées (Postgres)', cc1: 13, cc2: 12, exam: 14, average: 13.4, status: 'Validé' },
    { id: 3, module: 'Réseaux & Protocoles', cc1: 11, cc2: 10, exam: 12, average: 11.4, status: 'Validé' },
    { id: 4, module: 'Management de Projet Agile', cc1: 16, cc2: 15, exam: 17, average: 16.4, status: 'Validé avec Ment.' },
  ]);

  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(true);

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

  // 5. Classroom State
  const [classroomModules, setClassroomModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  // 4. Timetable State
  const [timetable, setTimetable] = useState([
    { day: 'Lundi', slots: [] },
    { day: 'Mardi', slots: [] },
    { day: 'Mercredi', slots: [] },
    { day: 'Jeudi', slots: [] },
    { day: 'Vendredi', slots: [] }
  ]);

  const fetchDetailedStats = async () => {
    setLoadingDetailedStats(true);
    try {
      const res = await api.get('/stats/student');
      setDetailedStats(res.data);
    } catch (e) {
      console.warn("Failed to fetch student detailed stats", e);
    } finally {
      setLoadingDetailedStats(false);
    }
  };

  // Fetch API data on load
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        fetchDetailedStats();
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

  const storageBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '/storage');

  const getFileExtensionInfo = (fileName) => {
    if (!fileName) return { ext: 'FILE', color: 'text-slate-650 border-slate-200 bg-slate-50', iconColor: 'text-slate-500' };
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return { ext: 'PDF', color: 'text-rose-650 border-rose-100 bg-rose-50/50 hover:bg-rose-100/50', iconColor: 'text-rose-500' };
      case 'docx':
      case 'doc':
        return { ext: 'Word', color: 'text-blue-650 border-blue-100 bg-blue-50/50 hover:bg-blue-100/50', iconColor: 'text-blue-500' };
      case 'pptx':
      case 'ppt':
        return { ext: 'PPTX', color: 'text-orange-650 border-orange-100 bg-orange-50/50 hover:bg-orange-100/50', iconColor: 'text-orange-500' };
      case 'zip':
      case 'rar':
        return { ext: 'ZIP', color: 'text-amber-650 border-amber-100 bg-amber-50/50 hover:bg-amber-100/50', iconColor: 'text-amber-500' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { ext: 'Image', color: 'text-emerald-650 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/50', iconColor: 'text-emerald-500' };
      default:
        return { ext: ext.toUpperCase(), color: 'text-indigo-650 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/50', iconColor: 'text-indigo-500' };
    }
  };

  const renderFileAttachment = (filePath) => {
    if (!filePath) return null;
    const fileName = filePath.split('/').pop();
    const info = getFileExtensionInfo(fileName);
    const fileUrl = filePath.startsWith('http') ? filePath : `${storageBaseUrl}/${filePath}`;

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all ${info.color} mt-3 shadow-sm`}
      >
        <Download className={`h-3.5 w-3.5 ${info.iconColor}`} />
        <span className="truncate max-w-[200px]">{fileName}</span>
        <span className="text-[9px] font-extrabold opacity-60 uppercase">
          [{info.ext}]
        </span>
      </a>
    );
  };

  // Fetch classroom modules when the tab becomes active
  useEffect(() => {
    const fetchClassroomModules = async () => {
      if (activeTab !== 'classroom') return;
      try {
        setClassroomLoading(true);
        const res = await api.get('/classroom/modules');
        setClassroomModules(res.data);
        if (res.data.length > 0 && !selectedModule) {
          setSelectedModule(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching classroom modules:", err);
      } finally {
        setClassroomLoading(false);
      }
    };
    fetchClassroomModules();
  }, [activeTab]);

  const fetchAnnouncements = async () => {
    if (!selectedModule) return;
    try {
      setClassroomLoading(true);
      const res = await api.get(`/classroom/modules/${selectedModule.id}`);
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setClassroomLoading(false);
    }
  };

  // Fetch announcements when a module is selected
  useEffect(() => {
    fetchAnnouncements();
  }, [selectedModule]);

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/export/student/${user.id}/transcript`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `releve_notes_${user.last_name || 'etudiant'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur lors de l'exportation du PDF", err);
      alert("Une erreur est survenue lors de la génération du PDF.");
    }
  };

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

  const handleCommentSubmit = async (e, announcementId) => {
    e.preventDefault();
    const commentText = commentInputs[announcementId]?.trim();
    if (!commentText) return;

    // Clear the input field immediately for crisp UX
    setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));

    // Construct the optimistic comment object
    const tempCommentId = Date.now();
    const optimisticComment = {
      id: tempCommentId,
      content: commentText,
      created_at: new Date().toISOString(),
      user: {
        id: user?.id,
        first_name: user?.first_name || 'Moi',
        last_name: user?.last_name || '',
        role: user?.role || 'student'
      }
    };

    // Apply the optimistic update to state
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(ann => {
        if (ann.id === announcementId) {
          return {
            ...ann,
            comments: [...(ann.comments || []), optimisticComment]
          };
        }
        return ann;
      })
    );

    try {
      // Send the real request to the API
      const res = await api.post(`/classroom/announcements/${announcementId}/comments`, {
        content: commentText
      });

      // Update the temporary ID with the real database comment object
      const savedComment = res.data.comment;
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(ann => {
          if (ann.id === announcementId) {
            return {
              ...ann,
              comments: (ann.comments || []).map(c => c.id === tempCommentId ? savedComment : c)
            };
          }
          return ann;
        })
      );
    } catch (err) {
      console.error("Failed to post comment:", err);
      // Rollback if request fails
      setAnnouncements(prevAnnouncements => 
        prevAnnouncements.map(ann => {
          if (ann.id === announcementId) {
            return {
              ...ann,
              comments: (ann.comments || []).filter(c => c.id !== tempCommentId)
            };
          }
          return ann;
        })
      );
      // Re-populate text so they don't lose their message
      setCommentInputs(prev => ({ ...prev, [announcementId]: commentText }));
    }
  };

  const handleUploadStudentAttachment = async (e, announcementId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/classroom/announcements/${announcementId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setDocNotification("Fichier joint/rendu ajouté avec succès !");
      setTimeout(() => setDocNotification(""), 4000);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors du dépôt du fichier.";
      alert(errMsg);
    }
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
          <div className="flex items-center gap-2 mb-8">
            <img src={upfLogo} alt="UPF Logo" className="h-10 w-auto object-contain" />
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
              {t('nav.my_grades')}
            </button>

            <button
              onClick={() => setActiveTab('classroom')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'classroom' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t('nav.classroom')}
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
              {t('nav.my_absences')}
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
              {t('nav.timetable')}
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
              {t('nav.my_documents')}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'stats' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <BarChartIcon className="h-4 w-4" />
              {t('nav.stats')}
            </button>
          </nav>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-550 hover:text-rose-605 text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-auto border border-transparent hover:border-rose-200/50"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.student_title')}</h1>
            <p className="text-slate-555 text-xs mt-1">{t('dashboard.student_subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <NotificationDropdown />
            <span className="px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-wider">
              {t('dashboard.role_student')}
            </span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-555 text-xs font-semibold">{t(user?.group?.name || user?.group || 'GINFO-3A')}</span>
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
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{t('Moyenne Générale Estimée')}</span>
                <p className="text-4xl font-extrabold text-slate-900 mt-1">{overallAverage.toFixed(2)} <span className="text-lg font-normal text-slate-400">/ 20</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-550 shadow-sm">
                  {t('common.filiere')} : <span className="text-slate-800 font-bold">{t('Génie Informatique')}</span>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:scale-102 active:scale-98 transition-all duration-200 text-xs font-bold text-slate-700 shadow-sm"
                >
                  <FileText className="h-4 w-4 text-indigo-500" />
                  {t('common.export_pdf')}
                </button>
              </div>
            </div>

            {/* Grades Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">{t('common.module')}</th>
                    <th className="p-4 w-28 text-center">CC1 (20%)</th>
                    <th className="p-4 w-28 text-center">CC2 (20%)</th>
                    <th className="p-4 w-28 text-center">Examen (60%)</th>
                    <th className="p-4 w-36 text-center">{t('common.average')}</th>
                    <th className="p-4 w-32 text-right">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {grades.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{t(g.module)}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.cc1 || 0).toFixed(2)}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.cc2 || 0).toFixed(2)}</td>
                      <td className="p-4 text-center text-slate-600 font-medium">{Number(g.exam || 0).toFixed(2)}</td>
                      <td className="p-4 text-center font-bold text-slate-900">{Number(g.average || 0).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-extrabold uppercase ${
                          g.average >= 14 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          'bg-indigo-50 border-indigo-100 text-indigo-600'
                        }`}>
                          {t(g.status)}
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
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">{t('Relevé des Absences')}</h3>
              <div className="space-y-4">
                {absences.map(abs => (
                  <div key={abs.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{t(abs.module)}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">Date: {abs.date} | Durée: {t(abs.hours)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                      abs.status === 'Justifiée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      abs.status === 'En attente' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                      'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {t(abs.status)}
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
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('Justifier une absence')}</h3>
                
                {(() => {
                  const unjustifiedAbsences = absences.filter(abs => abs.status === 'Non justifiée');
                  return (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('Date de l\'absence')}</label>
                        {unjustifiedAbsences.length === 0 ? (
                          <select
                            disabled
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-400 outline-none cursor-not-allowed"
                          >
                            <option>{t('Aucune absence à justifier')}</option>
                          </select>
                        ) : (
                          <select
                            value={justificationForm.absenceId}
                            onChange={e => setJustificationForm({ ...justificationForm, absenceId: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                          >
                            <option value="">-- {t('Sélectionnez une absence')} --</option>
                            {unjustifiedAbsences.map(abs => (
                              <option key={abs.id} value={abs.id}>
                                {abs.date} - {t(abs.module)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('Raison / Commentaire')}</label>
                        <textarea 
                           rows="4"
                          value={justificationForm.reason}
                          disabled={unjustifiedAbsences.length === 0}
                          onChange={e => setJustificationForm({ ...justificationForm, reason: e.target.value })}
                          placeholder={unjustifiedAbsences.length === 0 ? t("Aucune absence à justifier.") : t("Indiquez le motif et joignez un justificatif à l'administration par email.")}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 resize-none leading-relaxed disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('Document justificatif (PDF ou Image)')}</label>
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
                        <Send className="h-3.5 w-3.5" /> {t('Soumettre la pièce')}
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
          const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          const timeRanges = ['08:30-10:00', '10:30-12:00', '14:00-15:30', '16:00-17:30'];

          return (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('Mon Emploi du Temps Hebdomadaire')}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t('Retrouvez les séances planifiées pour votre classe')}</p>
                </div>
                <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {t('Semestre Actuel')}
                </span>
              </div>

              {totalSlotsCount === 0 ? (
                <div className="p-8 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-sm text-center max-w-xl mx-auto space-y-3 my-12">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">{t('Emploi du temps non disponible')}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t("Votre emploi du temps n'a pas encore été publié par l'administration ou aucun cours n'est actuellement planifié pour votre classe.")}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200/85 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                          <th className="p-4 w-28 text-left">{t('Jour')}</th>
                          <th className="p-4 border-l border-slate-100">08:30 - 10:00</th>
                          <th className="p-4 border-l border-slate-100">10:30 - 12:00</th>
                          <th className="p-4 border-l border-slate-100">14:00 - 15:30</th>
                          <th className="p-4 border-l border-slate-100">16:00 - 17:30</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {days.map(day => {
                          const dayData = timetable.find(d => d.day === day);
                          return (
                            <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                              <td className="p-4 font-bold text-slate-800 bg-slate-50/30 w-28">{t(day)}</td>
                              {timeRanges.map(timeRange => {
                                const [start, end] = timeRange.split('-');
                                const matchingSlot = dayData?.slots?.find(s => {
                                  const sStart = s.start_time || s.time?.split(' - ')[0];
                                  return sStart?.substring(0, 5) === start;
                                });

                                return (
                                  <td key={timeRange} className="p-3 border-l border-slate-100 w-1/4 h-24 relative">
                                    {matchingSlot ? (
                                      <div className="h-full p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 flex flex-col justify-between transition-all hover:shadow-sm">
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-start">
                                            <span className="px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase bg-indigo-600 text-white">
                                              {matchingSlot.module_code || 'COURS'}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {matchingSlot.time || `${start} - ${end}`}
                                            </span>
                                          </div>
                                          <h4 className="font-bold text-slate-800 text-[11px] truncate mt-1" title={matchingSlot.module}>
                                            {t(matchingSlot.module)}
                                          </h4>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                          <span className="truncate flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                            {matchingSlot.room || 'N/A'}
                                          </span>
                                          {matchingSlot.group && (
                                            <span className="text-slate-400 text-[9px]">
                                              {t(matchingSlot.group)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full h-full rounded-xl border border-dashed border-slate-100 bg-slate-50/10 flex items-center justify-center text-[10px] text-slate-400 italic">
                                        {t('Aucun cours')}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">{t('Suivi de mes requêtes')}</h3>
              <div className="space-y-4">
                {docRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{t(req.docType)}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">{t('Demandé le:')} {req.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                        req.status === 'Approuvée' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                        req.status === 'Rejetée' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        'bg-amber-50 border-amber-100 text-amber-600'
                      }`}>
                        {t(req.status)}
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
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">{t('Nouvelle Demande')}</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('Type de document')}</label>
                  <select
                    value={selectedDocType}
                    onChange={e => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="Attestation de scolarité">{t('Attestation de scolarité')}</option>
                    <option value="Relevé de notes - GINFO 2">{t('Relevé de notes - GINFO 2')}</option>
                    <option value="Certificat d'inscription">{t("Certificat d'inscription")}</option>
                    <option value="Fiche d'inscription pédagogique">{t("Fiche d'inscription pédagogique")}</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                  {t('Transmettre la demande')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Espace Classroom */}
        {activeTab === 'classroom' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn items-start">
            {/* Left Sidebar: Modules list */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm backdrop-blur-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('Mes Matières')}</h3>
                {classroomModules.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    {t('Aucun module disponible.')}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                    {classroomModules.map(mod => {
                      const isSelected = selectedModule?.id === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => setSelectedModule(mod)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-200 shadow-sm shadow-indigo-500/5'
                              : 'bg-white border-slate-200/70 hover:bg-slate-50/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                              isSelected ? 'bg-indigo-150 text-indigo-700' : 'bg-slate-100 text-slate-650'
                            }`}>
                              {mod.code}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{t('Semestre')} {mod.semester}</span>
                          </div>
                          <span className={`text-xs font-bold truncate leading-tight ${
                            isSelected ? 'text-indigo-950' : 'text-slate-800'
                          }`}>
                            {t(mod.name)}
                          </span>
                          <span className="text-[10px] text-slate-455 truncate">
                            Prof. {mod.professor_name || t('Enseignant')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Announcements stream */}
            <div className="lg:col-span-8 space-y-6">
              {selectedModule ? (
                <>
                  {/* Module Header Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-100/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shadow-indigo-500/5">
                    <div>
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">{t("Espace d'échange")}</span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">{t(selectedModule.name)}</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('Enseignant')} : <span className="font-semibold text-slate-700">{selectedModule.professor_name || t('Enseignant')}</span>
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-600 font-bold uppercase tracking-wider shadow-sm">
                      {selectedModule.code}
                    </div>
                  </div>

                  {/* Flux Content */}
                  {classroomLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm animate-pulse space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 rounded w-28" />
                              <div className="h-2.5 bg-slate-200 rounded w-16" />
                            </div>
                          </div>
                          <div className="space-y-1.5 pt-2">
                            <div className="h-3 bg-slate-200 rounded w-full" />
                            <div className="h-3 bg-slate-200 rounded w-5/6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="p-10 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto space-y-3">
                      <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">{t('Aucune publication')}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {t("Votre enseignant n'a publié aucune annonce ou document de cours pour le moment.")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {announcements.map(ann => (
                        <div key={ann.id} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
                          {/* En-tête */}
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                {ann.professor?.first_name ? ann.professor.first_name[0] : <User className="h-4 w-4" />}
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-slate-800">
                                  {ann.professor?.first_name} {ann.professor?.last_name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100/80 text-indigo-600 text-[8px] font-extrabold uppercase">
                                    {t('Enseignant')}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    {new Date(ann.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                  {ann.created_at !== ann.updated_at && (
                                    <span className="text-[9px] text-indigo-550 font-bold bg-indigo-50/30 px-1 py-0.5 rounded">
                                      Modifié
                                    </span>
                                  )}
                                  {ann.allow_student_attachments && (
                                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                                      Rendu demandé
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contenu */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                            <p className="text-xs text-slate-605 leading-relaxed whitespace-pre-line">
                              {ann.content}
                            </p>
                          </div>

                          {/* Pièce jointe */}
                          {ann.file_path && (
                            <div className="pt-2 border-t border-slate-100">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Support joint')}</span>
                              {renderFileAttachment(ann.file_path)}
                            </div>
                          )}

                          {/* Espace Rendu/Fichiers Joints Étudiant */}
                          {ann.allow_student_attachments && (
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                              <span className="block text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest">{t('Mon rendu / Pièce jointe')}</span>
                              {ann.student_attachments && ann.student_attachments.length > 0 ? (
                                <div className="space-y-2">
                                  {ann.student_attachments.map(att => {
                                    const fileInfo = getFileExtensionInfo(att.file_name);
                                    const fileUrl = att.file_path.startsWith('http') ? att.file_path : `${storageBaseUrl}/${att.file_path}`;
                                    return (
                                      <div key={att.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 shadow-sm">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <div className="h-8 w-8 rounded-lg border bg-white flex items-center justify-center flex-shrink-0">
                                            <Paperclip className={`h-4 w-4 ${fileInfo.iconColor}`} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <a 
                                              href={fileUrl} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="text-xs font-bold text-slate-800 hover:text-indigo-650 hover:underline truncate block"
                                              title={att.file_name}
                                            >
                                              {att.file_name}
                                            </a>
                                            <span className="text-[9px] text-slate-400 block mt-0.5">
                                              {t('Ajouté le')} {new Date(att.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                              })}
                                            </span>
                                          </div>
                                        </div>
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${fileInfo.color}`}
                                        >
                                          <Download className={`h-3.5 w-3.5 ${fileInfo.iconColor}`} />
                                        </a>
                                      </div>
                                    );
                                  })}
                                  <div className="pt-1">
                                    <label className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1.5">
                                      <Plus className="h-3.5 w-3.5" />
                                      {t('Remplacer mon fichier rendu')}
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => handleUploadStudentAttachment(e, ann.id)} 
                                      />
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2">
                                  <p className="text-[11px] text-slate-500 font-medium">{t('Aucun fichier rendu pour le moment.')}</p>
                                  <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm shadow-indigo-500/10 transition-colors flex items-center gap-2">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {t('Déposer mon rendu')}
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      onChange={(e) => handleUploadStudentAttachment(e, ann.id)} 
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Section Commentaires */}
                          <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{ann.comments?.length || 0} {t('Commentaire')}{(ann.comments?.length || 0) > 1 ? 's' : ''}</span>
                            </div>

                            {/* Fil des commentaires */}
                            {ann.comments && ann.comments.length > 0 && (
                              <div className="space-y-3.5 pl-3 border-l-2 border-slate-100 ml-2">
                                {ann.comments.map(comment => (
                                  <div key={comment.id} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800">
                                        {comment.user?.first_name} {comment.user?.last_name}
                                      </span>
                                      <span className={`px-1.5 py-0.25 rounded text-[8px] font-extrabold uppercase ${
                                        comment.user?.role === 'professor' 
                                          ? 'bg-indigo-50 border border-indigo-100 text-indigo-600' 
                                          : 'bg-pink-50 border border-pink-100 text-pink-600'
                                      }`}>
                                        {comment.user?.role === 'professor' ? t('Enseignant') : t('Étudiant')}
                                      </span>
                                      <span className="text-[9px] text-slate-400 font-medium">
                                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        }) : t("À l'instant")}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-655 leading-relaxed pl-1">
                                      {comment.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Saisie rapide de commentaire */}
                            <form 
                              onSubmit={(e) => handleCommentSubmit(e, ann.id)}
                              className="flex items-center gap-2 mt-2"
                            >
                              <input
                                type="text"
                                value={commentInputs[ann.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [ann.id]: e.target.value })}
                                placeholder={t("Écrire un commentaire...")}
                                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                              />
                              <button
                                type="submit"
                                className="h-8 w-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-sm shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!commentInputs[ann.id]?.trim()}
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs italic bg-white border border-slate-200/85 rounded-2xl">
                  {t("Sélectionnez un module à gauche pour afficher le flux de cours.")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Statistiques */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('Statistiques Académiques & Progression')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('Indicateurs de réussite personnels et comparatifs')}</p>
              </div>
              <button 
                onClick={fetchDetailedStats}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all text-slate-700 shadow-sm"
              >
                🔄 {t('common.refresh')}
              </button>
            </div>

            {loadingDetailedStats ? (
              <div className="py-20 text-center text-slate-500 text-xs font-semibold animate-pulse">
                {t('Chargement de vos indicateurs...')}
              </div>
            ) : detailedStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Comparatif Moyenne Étudiant vs Classe */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-6">{t('Comparatif de Moyenne')}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: t('Ma Moyenne'), note: detailedStats.moyenne_generale || 0, fill: '#6366f1' },
                        { name: t('Moyenne de la Classe'), note: detailedStats.moyenne_classe || 0, fill: '#94a3b8' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 20]} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                          formatter={(value) => [`${Number(value).toFixed(2)} / 20`, t('common.average')]}
                        />
                        <Bar dataKey="note" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            [
                              { fill: '#6366f1' },
                              { fill: '#94a3b8' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Taux de Présence Global */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">{t("Taux d'Assiduité / Présence")}</h3>
                  <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="relative flex items-center justify-center h-36 w-36 mb-4">
                      {/* SVG circle logic */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                        <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (detailedStats.taux_presence || 100) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-extrabold text-slate-800">{Number(detailedStats.taux_presence || 0).toFixed(1)}%</span>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{t('Présence')}</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-slate-550 max-w-xs leading-relaxed">
                      {t("Votre assiduité est calculée sur la base des appels enregistrés par vos enseignants dans l'ensemble des modules.")}
                    </p>
                  </div>
                </div>

                {/* Chart 3: Évolution des Notes par Module */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl lg:col-span-2">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-6">{t('Évolution de vos Notes par Module')}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={detailedStats.evolution_notes?.map(e => ({ ...e, module: t(e.module) })) || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="module" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 20]} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                          formatter={(value) => [`${Number(value).toFixed(2)} / 20`, t('Note')]}
                        />
                        <Line type="monotone" dataKey="note" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, stroke: '#ec4899', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-white border border-slate-200/85 rounded-2xl">
                {t('Aucune donnée statistique disponible pour le moment.')}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

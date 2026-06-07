import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import NotificationDropdown from '../components/NotificationDropdown';
import LanguageDropdown from '../components/LanguageDropdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, PieChart, Pie } from 'recharts';
import { 
  BookOpen, 
  UserCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Save, 
  Search, 
  LogOut,
  Building,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Download,
  FileText,
  Layers,
  Edit,
  X,
  Trash2,
  MapPin,
  Users,
  BarChart3 as BarChartIcon
} from 'lucide-react';

// Helper to split 3-hour slots into two 1h30 sessions
const getDisplaySlots = (slots) => {
  const list = [];
  slots.forEach(slot => {
    if (!slot.start_time || !slot.end_time) {
      list.push({
        ...slot,
        displayId: `${slot.id}-1`,
        sessionPart: 1,
        computed_start: '08:30',
        computed_end: '10:00',
        displayTime: slot.time || 'Séance'
      });
      return;
    }

    const [sh, sm] = slot.start_time.split(':').map(Number);
    const [eh, em] = slot.end_time.split(':').map(Number);
    
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const durationMin = endMin - startMin;

    if (durationMin === 180) { // exactly 3 hours (180 minutes)
      // First session: start to start + 90 mins (1h30)
      const s1_start = slot.start_time.substring(0, 5);
      const s1_end_h = Math.floor((startMin + 90) / 60);
      const s1_end_m = (startMin + 90) % 60;
      const s1_end = `${s1_end_h.toString().padStart(2, '0')}:${s1_end_m.toString().padStart(2, '0')}`;
      
      // Second session: start + 90 mins to end
      const s2_start = s1_end;
      const s2_end = slot.end_time.substring(0, 5);

      list.push({
        ...slot,
        displayId: `${slot.id}-1`,
        sessionPart: 1,
        computed_start: s1_start,
        computed_end: s1_end,
        displayTime: `${slot.day} (${s1_start} - ${s1_end}) - Séance 1 (1h30)`
      });
      list.push({
        ...slot,
        displayId: `${slot.id}-2`,
        sessionPart: 2,
        computed_start: s2_start,
        computed_end: s2_end,
        displayTime: `${slot.day} (${s2_start} - ${s2_end}) - Séance 2 (1h30)`
      });
    } else {
      // Fallback for non-3h slots
      list.push({
        ...slot,
        displayId: `${slot.id}-1`,
        sessionPart: 1,
        computed_start: slot.start_time.substring(0, 5),
        computed_end: slot.end_time.substring(0, 5),
        displayTime: `${slot.day} (${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)})`
      });
    }
  });
  return list;
};

export default function ProfessorDashboard() {
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

  // Groups and Modules taught by this professor (fetched dynamically)
  const [groups, setGroups] = useState([]);
  const [modules, setModules] = useState([]);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(true);
  
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  // 1. Grade Input State (flat array for selected group/module)
  const [studentsGrades, setStudentsGrades] = useState([]);
  const [notification, setNotification] = useState('');

  // 2. Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().substring(0, 10));
  const [attendanceSheet, setAttendanceSheet] = useState([]);

  // 3. Room Reservation State
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Salle 101', type: 'Cours', capacity: 40, reservedSlots: ['2026-05-28 09:00-11:00'] },
    { id: 2, name: 'Salle 102', type: 'TD', capacity: 30, reservedSlots: [] },
    { id: 3, name: 'Amphi A', type: 'Amphithéâtre', capacity: 150, reservedSlots: ['2026-05-28 14:00-16:00'] },
    { id: 4, name: 'Labo Info 1', type: 'TP', capacity: 25, reservedSlots: [] },
  ]);

  const [reserveForm, setReserveForm] = useState({ date: '2026-05-28', slot: '09:00-11:05', roomId: 1 });
  const [reservationMessage, setReservationMessage] = useState(null);

  // 4. Logbook (Cahier de Textes) State
  const [logbookEntries, setLogbookEntries] = useState([]);
  const [newLogbook, setNewLogbook] = useState({
    date: new Date().toISOString().substring(0, 10),
    start_time: '08:30',
    end_time: '10:00',
    nature: 'Cours',
    timetable_id: '',
    objective: ''
  });
  const [selectedLogbookSlotKey, setSelectedLogbookSlotKey] = useState('');

  // Emplois du temps stockés pour retrouver le timetable_id lié à l'appel
  const [dbTimetables, setDbTimetables] = useState([]);
  const [groupedTimetables, setGroupedTimetables] = useState([]);
  const [selectedTimetableKey, setSelectedTimetableKey] = useState('');

  // 5. Classroom (Espace Cours) State
  const [selectedClassroomFiliereId, setSelectedClassroomFiliereId] = useState('');
  const [filteredClassroomGroups, setFilteredClassroomGroups] = useState([]);
  const [selectedClassroomGroupId, setSelectedClassroomGroupId] = useState('');
  const [filteredClassroomModules, setFilteredClassroomModules] = useState([]);
  const [selectedClassroomModuleId, setSelectedClassroomModuleId] = useState('');
  const [classroomAnnouncements, setClassroomAnnouncements] = useState([]);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', allow_student_attachments: false });
  const [attachedFile, setAttachedFile] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const fileInputRef = useRef(null);

  // 6. Administrative Document Requests State
  const [docRequests, setDocRequests] = useState([]);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [docType, setDocType] = useState('attestation_travail');
  const [missionForm, setMissionForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [docAttachedFile, setDocAttachedFile] = useState(null);
  const docFileInputRef = useRef(null);

  // Nouveaux états de filtrage progressif pour l'Appel (Absences)
  const [filieres, setFilieres] = useState([]);
  const [selectedFiliereId, setSelectedFiliereId] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [filteredAttendanceModules, setFilteredAttendanceModules] = useState([]);
  const [selectedAttendanceModuleId, setSelectedAttendanceModuleId] = useState('');
  const [filteredTimetableSlots, setFilteredTimetableSlots] = useState([]);

  const fetchDetailedStats = async () => {
    setLoadingDetailedStats(true);
    try {
      const res = await api.get('/stats/professor');
      setDetailedStats(res.data);
    } catch (e) {
      console.warn("Failed to fetch professor detailed stats", e);
    } finally {
      setLoadingDetailedStats(false);
    }
  };

  // Fetch groups and modules taught by the professor on mount
  useEffect(() => {
    const initProfessorContext = async () => {
      try {
        fetchDetailedStats();
        const [modulesRes, groupsRes, timetablesRes] = await Promise.all([
          api.get('/classroom/modules'),
          api.get('/professor/groups'),
          api.get('/timetables')
        ]);
        
        setModules(modulesRes.data);
        setGroups(groupsRes.data);

        // Aplatir les séances d'emploi du temps
        const flatSlots = [];
        timetablesRes.data.forEach(d => {
          if (d.slots) {
            d.slots.forEach(slot => {
              flatSlots.push({ ...slot, day: d.day });
            });
          }
        });
        setDbTimetables(flatSlots);
        setGroupedTimetables(timetablesRes.data);
        
        if (modulesRes.data.length > 0) {
          setSelectedModule(modulesRes.data[0].id.toString());
        }
        if (groupsRes.data.length > 0) {
          setSelectedGroup(groupsRes.data[0].id.toString());
        }
      } catch (err) {
        console.warn("Could not load professor contextual groups/modules:", err);
      }
    };
    initProfessorContext();
  }, []);

  // Effet 1 : Extraire les filières uniques enseignées par le professeur
  useEffect(() => {
    if (dbTimetables.length === 0) return;

    const fMap = {};
    dbTimetables.forEach(slot => {
      if (slot.group_details && slot.group_details.field) {
        fMap[slot.group_details.field.id] = slot.group_details.field.name;
      }
    });

    const fList = Object.keys(fMap).map(id => ({
      id: Number(id),
      name: fMap[id]
    }));
    setFilieres(fList);

    if (fList.length > 0) {
      setSelectedFiliereId(fList[0].id.toString());
    }
  }, [dbTimetables]);

  // Effet 2 : Mettre à jour les groupes correspondants à la filière sélectionnée
  useEffect(() => {
    if (!selectedFiliereId) {
      setFilteredGroups([]);
      setSelectedGroupId('');
      return;
    }

    const gMap = {};
    dbTimetables.forEach(slot => {
      if (slot.group_details && slot.group_details.field && slot.group_details.field.id.toString() === selectedFiliereId.toString()) {
        gMap[slot.group_details.id] = slot.group_details.name;
      }
    });

    const gList = Object.keys(gMap).map(id => ({
      id: Number(id),
      name: gMap[id]
    }));
    setFilteredGroups(gList);

    if (gList.length > 0) {
      setSelectedGroupId(gList[0].id.toString());
    } else {
      setSelectedGroupId('');
    }
  }, [selectedFiliereId, dbTimetables]);

  // Effet 2.5 : Mettre à jour les matières (modules) enseignées par le professeur pour le groupe sélectionné
  useEffect(() => {
    if (!selectedGroupId) {
      setFilteredAttendanceModules([]);
      setSelectedAttendanceModuleId('');
      return;
    }

    const mMap = {};
    dbTimetables.forEach(slot => {
      if (slot.group_id && slot.group_id.toString() === selectedGroupId.toString()) {
        mMap[slot.module_id] = slot.module;
      }
    });

    const mList = Object.keys(mMap).map(id => ({
      id: Number(id),
      name: mMap[id]
    }));
    setFilteredAttendanceModules(mList);

    if (mList.length > 0) {
      setSelectedAttendanceModuleId(mList[0].id.toString());
    } else {
      setSelectedAttendanceModuleId('');
    }
  }, [selectedGroupId, dbTimetables]);

  // Effet 3 : Mettre à jour les créneaux horaires correspondants au groupe et à la matière sélectionnés
  useEffect(() => {
    if (!selectedGroupId || !selectedAttendanceModuleId) {
      setFilteredTimetableSlots([]);
      setSelectedTimetableKey('');
      return;
    }

    const slots = dbTimetables.filter(slot =>
      slot.group_id && slot.group_id.toString() === selectedGroupId.toString() &&
      slot.module_id && slot.module_id.toString() === selectedAttendanceModuleId.toString()
    );
    // Split 3-hour slots into two 1h30 sessions
    const displaySlots = getDisplaySlots(slots);
    setFilteredTimetableSlots(displaySlots);

    if (displaySlots.length > 0) {
      setSelectedTimetableKey(displaySlots[0].displayId);
    } else {
      setSelectedTimetableKey('');
    }
  }, [selectedGroupId, selectedAttendanceModuleId, dbTimetables]);

  const fetchRoomsList = async () => {
    try {
      const res = await api.get('/reservations/rooms');
      setRooms(res.data.map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        reservedSlots: room.reservations ? room.reservations.map(resv => `${resv.date} ${resv.start_time.substring(0, 5)}-${resv.end_time.substring(0, 5)}`) : []
      })));
    } catch (e) {
      console.warn("Could not fetch rooms from API", e);
    }
  };

  const fetchLogbooks = async () => {
    try {
      const res = await api.get('/professor/logbooks');
      setLogbookEntries(res.data);
    } catch (err) {
      console.warn("Could not load logbooks:", err);
    }
  };

  // Fetch rooms list when rooms tab is active
  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRoomsList();
    }
  }, [activeTab]);

  // Fetch logbooks list when logbook tab is active
  useEffect(() => {
    if (activeTab === 'logbook') {
      fetchLogbooks();
    }
  }, [activeTab]);

  const storageBaseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace('/api', '/storage');

  const fetchClassroomAnnouncements = async (moduleId) => {
    try {
      setIsAnnouncementsLoading(true);
      const res = await api.get(`/classroom/modules/${moduleId}`, {
        params: { group_id: selectedClassroomGroupId }
      });
      setClassroomAnnouncements(res.data);
    } catch (err) {
      console.warn("Could not load classroom announcements:", err);
    } finally {
      setIsAnnouncementsLoading(false);
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      setNotification("Erreur : Veuillez remplir le titre et le contenu.");
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', announcementForm.title);
      formData.append('content', announcementForm.content);
      formData.append('allow_student_attachments', announcementForm.allow_student_attachments ? '1' : '0');
      if (selectedClassroomGroupId) {
        formData.append('group_id', selectedClassroomGroupId);
      }
      if (attachedFile) {
        formData.append('file', attachedFile);
      }

      if (editingAnnouncement) {
        // Mode modification
        await api.post(`/classroom/announcements/${editingAnnouncement.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setNotification("Annonce modifiée avec succès !");
        setEditingAnnouncement(null);
      } else {
        // Mode création
        formData.append('module_id', selectedClassroomModuleId);
        await api.post('/classroom/announcements', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setNotification("Annonce publiée avec succès !");
      }

      setAnnouncementForm({ title: '', content: '', allow_student_attachments: false });
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchClassroomAnnouncements(selectedClassroomModuleId);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors de l'enregistrement de l'annonce.";
      setNotification("Erreur : " + errMsg);
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const startEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      title: ann.title,
      content: ann.content,
      allow_student_attachments: !!ann.allow_student_attachments
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '', allow_student_attachments: false });
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      await api.delete(`/classroom/announcements/${id}`);
      setNotification("Annonce supprimée avec succès !");
      if (editingAnnouncement && editingAnnouncement.id === id) {
        cancelEditAnnouncement();
      }
      fetchClassroomAnnouncements(selectedClassroomModuleId);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors de la suppression de l'annonce.";
      setNotification("Erreur : " + errMsg);
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const fetchDocRequests = async () => {
    try {
      setIsDocsLoading(true);
      const res = await api.get('/documents');
      setDocRequests(res.data);
    } catch (err) {
      console.warn("Could not load document requests:", err);
    } finally {
      setIsDocsLoading(false);
    }
  };

  const handleRequestDocument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('type', docType);

      if (docType === 'ordre_mission') {
        formData.append('destination', missionForm.destination);
        formData.append('start_date', missionForm.start_date);
        formData.append('end_date', missionForm.end_date);
        formData.append('motif', missionForm.reason);

        formData.append('metadata[destination]', missionForm.destination);
        formData.append('metadata[start_date]', missionForm.start_date);
        formData.append('metadata[end_date]', missionForm.end_date);
        formData.append('metadata[reason]', missionForm.reason);
      }

      if (docAttachedFile) {
        formData.append('file', docAttachedFile);
      }

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setNotification("Demande de document soumise avec succès !");
      setMissionForm({ destination: '', start_date: '', end_date: '', reason: '' });
      setDocAttachedFile(null);
      if (docFileInputRef.current) {
        docFileInputRef.current.value = '';
      }
      fetchDocRequests();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors de la soumission de la demande.";
      setNotification("Erreur : " + errMsg);
    }
    setTimeout(() => setNotification(''), 4000);
  };

  // Fetch document requests when documents tab becomes active
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocRequests();
    }
  }, [activeTab]);

  // Initialize classroom filiere
  useEffect(() => {
    if (filieres.length > 0 && !selectedClassroomFiliereId) {
      setSelectedClassroomFiliereId(filieres[0].id.toString());
    }
  }, [filieres, selectedClassroomFiliereId]);

  // Filter classroom groups when selectedClassroomFiliereId changes
  useEffect(() => {
    if (!selectedClassroomFiliereId) {
      setFilteredClassroomGroups([]);
      setSelectedClassroomGroupId('');
      return;
    }

    const gMap = {};
    dbTimetables.forEach(slot => {
      if (slot.group_details && slot.group_details.field && slot.group_details.field.id.toString() === selectedClassroomFiliereId.toString()) {
        gMap[slot.group_details.id] = slot.group_details.name;
      }
    });

    const gList = Object.keys(gMap).map(id => ({
      id: Number(id),
      name: gMap[id]
    }));
    setFilteredClassroomGroups(gList);

    if (gList.length > 0) {
      setSelectedClassroomGroupId(gList[0].id.toString());
    } else {
      setSelectedClassroomGroupId('');
    }
  }, [selectedClassroomFiliereId, dbTimetables]);

  // Filter classroom modules when selectedClassroomGroupId changes
  useEffect(() => {
    if (!selectedClassroomGroupId) {
      setFilteredClassroomModules([]);
      setSelectedClassroomModuleId('');
      return;
    }

    const mMap = {};
    dbTimetables.forEach(slot => {
      if (slot.group_id && slot.group_id.toString() === selectedClassroomGroupId.toString()) {
        mMap[slot.module_id] = slot.module;
      }
    });

    const mList = Object.keys(mMap).map(id => ({
      id: Number(id),
      name: mMap[id]
    }));
    setFilteredClassroomModules(mList);

    if (mList.length > 0) {
      setSelectedClassroomModuleId(mList[0].id.toString());
    } else {
      setSelectedClassroomModuleId('');
    }
  }, [selectedClassroomGroupId, dbTimetables]);

  // Fetch announcements when activeTab is classroom and module or group changes
  useEffect(() => {
    if (activeTab === 'classroom' && selectedClassroomModuleId) {
      fetchClassroomAnnouncements(selectedClassroomModuleId);
    } else if (activeTab === 'classroom' && !selectedClassroomModuleId) {
      setClassroomAnnouncements([]);
    }
  }, [activeTab, selectedClassroomModuleId, selectedClassroomGroupId]);

  const logbookDisplaySlots = getDisplaySlots(dbTimetables);

  const handleLogbookSlotChange = (key) => {
    setSelectedLogbookSlotKey(key);
    const foundSlot = logbookDisplaySlots.find(slot => slot.displayId === key);
    if (foundSlot) {
      setNewLogbook(prev => ({
        ...prev,
        timetable_id: foundSlot.id.toString(),
        start_time: foundSlot.computed_start,
        end_time: foundSlot.computed_end
      }));
    }
  };

  // Auto-initialize selectedLogbookSlotKey when dbTimetables is populated
  useEffect(() => {
    if (logbookDisplaySlots.length > 0 && !selectedLogbookSlotKey) {
      const firstSlot = logbookDisplaySlots[0];
      setSelectedLogbookSlotKey(firstSlot.displayId);
      setNewLogbook(prev => ({
        ...prev,
        timetable_id: firstSlot.id.toString(),
        start_time: firstSlot.computed_start,
        end_time: firstSlot.computed_end
      }));
    }
  }, [dbTimetables, logbookDisplaySlots]);

  const getFileExtensionInfo = (fileName) => {
    if (!fileName) return { ext: 'FILE', color: 'text-slate-600 border-slate-200 bg-slate-50', iconColor: 'text-slate-500' };
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

  // Fetch student grades for the selected group & module
  useEffect(() => {
    if (!selectedGroup || !selectedModule) return;
    
    const fetchGrades = async () => {
      try {
        const res = await api.post('/grades/group', {
          group_id: Number(selectedGroup),
          module_id: Number(selectedModule)
        });
        
        if (res.data && res.data.length > 0) {
          setStudentsGrades(res.data.map(student => ({
            id: student.student_id,
            name: student.student_name,
            cc1: student.cc1 !== null ? parseFloat(student.cc1) : 12,
            cc2: student.cc2 !== null ? parseFloat(student.cc2) : 12,
            exam: student.exam !== null ? parseFloat(student.exam) : 12,
            average: student.final_grade !== null ? parseFloat(student.final_grade) : 12.0
          })));
        } else {
          // Aucun enregistrement existant, charger les étudiants de ce groupe
          const studentsRes = await api.get(`/professor/groups/${selectedGroup}/students`);
          setStudentsGrades(studentsRes.data.map(student => ({
            id: student.id,
            name: student.name,
            cc1: 12,
            cc2: 12,
            exam: 12,
            average: 12.0
          })));
        }
      } catch (e) {
        console.warn("Could not fetch group grades from API", e);
        // Fallback : charger les étudiants
        try {
          const studentsRes = await api.get(`/professor/groups/${selectedGroup}/students`);
          setStudentsGrades(studentsRes.data.map(student => ({
            id: student.id,
            name: student.name,
            cc1: 12,
            cc2: 12,
            exam: 12,
            average: 12.0
          })));
        } catch (err) {
          console.warn("Could not fetch students as grade fallback", err);
        }
      }
    };
    fetchGrades();
  }, [selectedGroup, selectedModule]);

  // Fetch students & absences for attendance tab based on selectedTimetableKey and attendanceDate
  useEffect(() => {
    const timetableId = selectedTimetableKey.split('-')[0] || '';
    const sessionPart = Number(selectedTimetableKey.split('-')[1]) || 1;

    if (!timetableId || activeTab !== 'attendance') return;

    const activeSlot = dbTimetables.find(t => t.id.toString() === timetableId.toString());
    if (!activeSlot) return;

    const fetchAttendanceSheetData = async () => {
      try {
        // 1. Récupérer les étudiants de la classe liée à ce créneau
        const studentsRes = await api.get(`/professor/groups/${activeSlot.group_id}/students`);
        
        // 2. Récupérer les absences déjà saisies pour ce créneau, cette date et cette session
        const absencesRes = await api.get(`/professor/absences`, {
          params: {
            timetable_id: activeSlot.id,
            date: attendanceDate,
            session_part: sessionPart
          }
        });

        const absentIds = absencesRes.data || [];

        // 3. Initialiser la feuille d'appel avec les absences pré-cochées
        setAttendanceSheet(studentsRes.data.map(student => ({
          id: student.id,
          name: student.name,
          absent: absentIds.includes(student.id)
        })));
      } catch (err) {
        console.warn("Could not load attendance sheet data:", err);
      }
    };

    fetchAttendanceSheetData();
  }, [selectedTimetableKey, attendanceDate, activeTab, dbTimetables]);

  const handleGradeChange = (studentId, field, value) => {
    const numValue = Math.min(20, Math.max(0, parseFloat(value) || 0));
    
    setStudentsGrades(prev => 
      prev.map(student => {
        if (student.id === studentId) {
          const updatedStudent = { ...student, [field]: numValue };
          const avg = (updatedStudent.cc1 * 0.2) + (updatedStudent.cc2 * 0.2) + (updatedStudent.exam * 0.6);
          updatedStudent.average = parseFloat(avg.toFixed(2));
          return updatedStudent;
        }
        return student;
      })
    );
  };

  const handleSaveGrades = async () => {
    try {
      await api.post('/grades', {
        module_id: Number(selectedModule),
        grades: studentsGrades.map(s => ({
          student_id: s.id,
          cc1: s.cc1,
          cc2: s.cc2,
          exam: s.exam
        }))
      });
      setNotification('Notes enregistrées avec succès dans la base PostgreSQL !');
    } catch (err) {
      console.error(err);
      setNotification('Erreur lors de la sauvegarde des notes.');
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const toggleAttendance = (id) => {
    setAttendanceSheet(prev =>
      prev.map(student => 
        student.id === id ? { ...student, absent: !student.absent } : student
      )
    );
  };

  const handleSaveAttendance = async () => {
    const timetableId = selectedTimetableKey.split('-')[0] || '';
    const sessionPart = Number(selectedTimetableKey.split('-')[1]) || 1;

    if (!timetableId) {
      setNotification("Erreur : Veuillez sélectionner un créneau d'emploi du temps.");
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    const sheetObj = {};
    attendanceSheet.forEach(s => {
      sheetObj[s.id] = s.absent;
    });

    try {
      await api.post('/absences', {
        timetable_id: Number(timetableId),
        date: attendanceDate,
        session_part: sessionPart,
        sheet: sheetObj
      });
      setNotification("Feuille d'appel validée et enregistrée en base de données !");
    } catch (err) {
      console.error(err);
      setNotification("Erreur lors de la sauvegarde de la feuille d'appel.");
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const handleExportAttendanceCSV = async () => {
    const timetableId = selectedTimetableKey.split('-')[0] || '';
    const sessionPart = Number(selectedTimetableKey.split('-')[1]) || 1;

    if (!timetableId) {
      setNotification("Erreur : Veuillez sélectionner un créneau d'emploi du temps.");
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    try {
      const response = await api.get(`/export/attendance/${timetableId}/${attendanceDate}/${sessionPart}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `feuille_appel_${attendanceDate}_partie${sessionPart}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erreur lors de l'exportation du CSV", err);
      alert("Une erreur est survenue lors de l'exportation du CSV.");
    }
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    const selectedRoomObj = rooms.find(r => r.id === Number(reserveForm.roomId));
    if (selectedRoomObj) {
      const targetSlotString = `${reserveForm.date} ${reserveForm.slot}`;
      const isReserved = selectedRoomObj.reservedSlots.some(slotStr => slotStr === targetSlotString);
      if (isReserved) {
        setReservationMessage({ type: 'error', text: 'Cette salle est déjà réservée pour ce créneau horaire.' });
        setTimeout(() => setReservationMessage(null), 5000);
        return;
      }
    }

    try {
      await api.post('/reservations', {
        room_id: Number(reserveForm.roomId),
        date: reserveForm.date,
        slot: reserveForm.slot,
        purpose: 'Cours supplémentaire'
      });
      setReservationMessage({ type: 'success', text: "Réservation validée avec succès !" });
      fetchRoomsList();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors de la réservation.";
      setReservationMessage({ type: 'error', text: errMsg });
    }
    setTimeout(() => setReservationMessage(null), 5000);
  };

  const handleAddLogbook = async (e) => {
    e.preventDefault();
    if (!newLogbook.timetable_id) {
      setNotification("Erreur : Veuillez sélectionner un créneau d'emploi du temps.");
      setTimeout(() => setNotification(''), 4000);
      return;
    }
    if (!newLogbook.objective || newLogbook.objective.length < 10) {
      setNotification("Erreur : Le sujet/objectif doit contenir au moins 10 caractères.");
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    try {
      await api.post('/professor/logbooks', {
        timetable_id: Number(newLogbook.timetable_id),
        date: newLogbook.date,
        start_time: newLogbook.start_time,
        end_time: newLogbook.end_time,
        nature: newLogbook.nature,
        objective: newLogbook.objective
      });
      setNotification("Séance ajoutée au cahier de textes avec succès !");
      fetchLogbooks();
      setNewLogbook(prev => ({
        ...prev,
        objective: ''
      }));
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Erreur lors de l'enregistrement de la séance.";
      setNotification("Erreur : " + errMsg);
    }
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex relative overflow-hidden">
      {/* Background glows */}
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
              <BookOpen className="h-4 w-4" />
              {t('nav.grades')}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'attendance' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              {t('nav.attendance')}
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'rooms' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Building className="h-4 w-4" />
              {t('nav.rooms')}
            </button>

            <button
              onClick={() => setActiveTab('logbook')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'logbook' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Clock className="h-4 w-4" />
              {t('nav.logbook')}
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
              onClick={() => setActiveTab('classroom')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'classroom' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-550 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Layers className="h-4 w-4" />
              {t('nav.classroom')}
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
              {t('nav.documents')}
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.prof_title')}</h1>
            <p className="text-slate-555 text-xs mt-1">{t('dashboard.prof_subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <NotificationDropdown />
            <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
              {t('dashboard.role_professor')}
            </span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-750 text-xs font-semibold">{user?.name}</span>
          </div>
        </header>

        {/* Global Notifications */}
        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs flex items-center gap-2 animate-fadeIn font-medium">
            <CheckCircle className="h-4 w-4 text-indigo-500" />
            {notification}
          </div>
        )}

        {/* Filter selectors for context (Module / Group) */}
        {(activeTab === 'grades' || activeTab === 'logbook') && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Groupe :</span>
              <select 
                value={selectedGroup} 
                onChange={e => setSelectedGroup(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Module :</span>
              <select 
                value={selectedModule} 
                onChange={e => setSelectedModule(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
              >
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Tab 1: Grade Entry */}
        {activeTab === 'grades' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Étudiant</th>
                    <th className="p-4 w-28 text-center">CC1 (20%)</th>
                    <th className="p-4 w-28 text-center">CC2 (20%)</th>
                    <th className="p-4 w-28 text-center">Examen (60%)</th>
                    <th className="p-4 w-32 text-center">Moyenne Finale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {studentsGrades.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{student.name}</td>
                      <td className="p-4 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.25"
                          value={student.cc1} 
                          onChange={e => handleGradeChange(student.id, 'cc1', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.25"
                          value={student.cc2} 
                          onChange={e => handleGradeChange(student.id, 'cc2', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.25"
                          value={student.exam} 
                          onChange={e => handleGradeChange(student.id, 'exam', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-center font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xs"
                        />
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span className={`inline-block px-2.5 py-1 rounded border text-xs ${
                          (Number(student.average) || 0) >= 12 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          (Number(student.average) || 0) >= 10 ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          'bg-rose-50 border-rose-105 text-rose-600'
                        }`}>
                          {(Number(student.average) || 0).toFixed(2)} / 20
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleSaveGrades}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-500/10"
              >
                <Save className="h-4 w-4" /> Enregistrer les notes
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance / Absences */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
              {/* 1. Sélectionneur de Filière */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filière :</span>
                <select 
                  value={selectedFiliereId}
                  onChange={e => setSelectedFiliereId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  {filieres.length === 0 ? (
                    <option value="">Aucune filière</option>
                  ) : (
                    filieres.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 2. Sélectionneur de Groupe */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Groupe :</span>
                <select 
                  value={selectedGroupId}
                  onChange={e => setSelectedGroupId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                >
                  {filteredGroups.length === 0 ? (
                    <option value="">Aucun groupe</option>
                  ) : (
                    filteredGroups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 2.5. Sélectionneur de Matière (Module) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Matière :</span>
                <select 
                  value={selectedAttendanceModuleId}
                  onChange={e => setSelectedAttendanceModuleId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none min-w-[150px]"
                >
                  {filteredAttendanceModules.length === 0 ? (
                    <option value="">Aucune matière</option>
                  ) : (
                    filteredAttendanceModules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* 3. Sélectionneur de Date */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date de l'appel :</span>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              {/* 4. Sélectionneur de Séance */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Séance :</span>
                <select 
                  value={selectedTimetableKey}
                  onChange={e => setSelectedTimetableKey(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none min-w-[260px]"
                >
                  {filteredTimetableSlots.length === 0 ? (
                    <option value="">Aucune séance</option>
                  ) : (
                    filteredTimetableSlots.map(slot => (
                      <option key={slot.displayId} value={slot.displayId}>
                        {slot.displayTime}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Étudiant</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Marquer comme Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {attendanceSheet.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{student.name}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                          student.absent ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          {student.absent ? 'Absent' : 'Présent'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <input 
                          type="checkbox" 
                          checked={student.absent}
                          onChange={() => toggleAttendance(student.id)}
                          className="h-4.5 w-4.5 rounded bg-slate-50 border border-slate-200 text-indigo-500 focus:ring-transparent accent-indigo-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={handleExportAttendanceCSV}
                className="py-3 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="h-4 w-4 text-emerald-600" /> Télécharger la feuille d'appel (CSV)
              </button>
              <button 
                onClick={handleSaveAttendance}
                className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-500/10"
              >
                <Save className="h-4 w-4" /> Valider la feuille d'appel
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Room Reservations */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Message alert */}
            {reservationMessage && (
              <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border font-medium ${
                reservationMessage.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                {reservationMessage.type === 'error' ? <AlertCircle className="h-4 w-4 text-rose-500" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
                {reservationMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rooms List */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Disponibilité des Salles</h3>
                <div className="space-y-4">
                  {rooms.map(room => (
                    <div key={room.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <span className="block font-bold text-slate-800 text-xs">{room.name}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Type: {room.type} | Capacité: {room.capacity} places</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">Créneaux réservés :</span>
                        {room.reservedSlots.length > 0 ? (
                          room.reservedSlots.map(s => (
                            <span key={s} className="inline-block px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600 text-[8px] font-bold mr-1">{s}</span>
                          ))
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-bold">Aucune réservation</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reservation Form */}
              <form onSubmit={handleReserve} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Réserver une salle</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input 
                    type="date"
                    value={reserveForm.date}
                    onChange={e => setReserveForm({ ...reserveForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Créneau horaire</label>
                  <select
                    value={reserveForm.slot}
                    onChange={e => setReserveForm({ ...reserveForm, slot: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="09:00-11:00">09:00 - 11:00</option>
                    <option value="11:00-13:00">11:00 - 13:00</option>
                    <option value="14:00-16:00">14:00 - 16:00</option>
                    <option value="16:00-18:00">16:00 - 18:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Salle</label>
                  <select
                    value={reserveForm.roomId}
                    onChange={e => setReserveForm({ ...reserveForm, roomId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Confirmer la réservation
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 4: Logbook (Cahier de Textes) */}
        {activeTab === 'logbook' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* List entries */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Séances Consignées</h3>
              <div className="space-y-4">
                {logbookEntries.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-6">Aucune séance consignée.</p>
                ) : (
                  logbookEntries.map(entry => (
                    <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            {entry.timetable?.module?.name || 'Matière'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{entry.objective}</h4>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-slate-450">{entry.date}</span>
                          <span className="inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[8px] font-bold mt-1 shadow-sm">
                            {entry.start_time ? entry.start_time.substring(0, 5) : ''} - {entry.end_time ? entry.end_time.substring(0, 5) : ''} ({entry.nature})
                          </span>
                        </div>
                      </div>
                      {entry.timetable?.group?.name && (
                        <p className="text-slate-550 text-[10px] font-semibold">Classe : {entry.timetable.group.name}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* New Entry Form */}
            <form onSubmit={handleAddLogbook} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Consigner une Séance</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input 
                    type="date"
                    disabled
                    value={newLogbook.date}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nature de la séance</label>
                  <select
                    value={newLogbook.nature}
                    onChange={e => setNewLogbook({ ...newLogbook, nature: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="Cours">Cours</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heure de début</label>
                  <input 
                    type="time"
                    value={newLogbook.start_time}
                    onChange={e => setNewLogbook({ ...newLogbook, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heure de fin</label>
                  <input 
                    type="time"
                    value={newLogbook.end_time}
                    onChange={e => setNewLogbook({ ...newLogbook, end_time: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Créneau d'emploi du temps</label>
                <select
                  value={selectedLogbookSlotKey}
                  onChange={e => handleLogbookSlotChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-650 outline-none focus:bg-white focus:border-indigo-500"
                >
                  {logbookDisplaySlots.length === 0 ? (
                    <option value="">Aucun créneau disponible</option>
                  ) : (
                    logbookDisplaySlots.map(slot => (
                      <option key={slot.displayId} value={slot.displayId}>
                        {slot.displayTime} | {slot.module} ({slot.group})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sujet / Objectif (min. 10 caractères)</label>
                <textarea 
                  rows="4"
                  value={newLogbook.objective}
                  onChange={e => setNewLogbook({ ...newLogbook, objective: e.target.value })}
                  placeholder="Détails du cours et exercices à préparer pour la séance suivante..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <button type="submit" className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                Ajouter la séance
              </button>
            </form>
          </div>
        )}

        {/* Tab 5: Emploi du Temps */}
        {activeTab === 'timetable' && (() => {
          const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          const timeRanges = ['08:30-10:00', '10:30-12:00', '14:00-15:30', '16:00-17:30'];
          
          return (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mon Emploi du Temps Hebdomadaire</h2>
                  <p className="text-xs text-slate-550 mt-0.5">Retrouvez vos séances et classes planifiées</p>
                </div>
                <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Semestre Actuel
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200/85 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                        <th className="p-4 w-28 text-left">Jour</th>
                        <th className="p-4 border-l border-slate-100">08:30 - 10:00</th>
                        <th className="p-4 border-l border-slate-100">10:30 - 12:00</th>
                        <th className="p-4 border-l border-slate-100">14:00 - 15:30</th>
                        <th className="p-4 border-l border-slate-100">16:00 - 17:30</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {days.map(day => {
                        const dayData = groupedTimetables.find(d => d.day === day);
                        return (
                          <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4 font-bold text-slate-800 bg-slate-50/30 w-28">{day}</td>
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
                                          {matchingSlot.module}
                                        </h4>
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                                        <span className="truncate flex items-center gap-1">
                                          <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                          {matchingSlot.room || 'N/A'}
                                        </span>
                                        <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-slate-650 flex items-center gap-1">
                                          <Users className="h-3 w-3 text-slate-400" />
                                          {matchingSlot.group || 'Classe'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full rounded-xl border border-dashed border-slate-100 bg-slate-50/10 flex items-center justify-center text-[10px] text-slate-400 italic">
                                      Aucun cours
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
            </div>
          );
        })()}
        
        {/* Tab 6: Espace Cours (Classroom) */}
        {activeTab === 'classroom' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fadeIn">
            {/* Left sidebar: Progressive Filtering (Filière -> Groupe -> Matière) */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-500" />
                  Filtrage Espace Cours
                </h3>

                {/* 1. Sélection de la Filière */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Filière</label>
                  <select
                    value={selectedClassroomFiliereId}
                    onChange={e => setSelectedClassroomFiliereId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                  >
                    {filieres.length === 0 ? (
                      <option value="">Aucune filière disponible</option>
                    ) : (
                      <>
                        <option value="">Choisir une filière...</option>
                        {filieres.map(fil => (
                          <option key={fil.id} value={fil.id}>
                            {fil.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* 2. Sélection du Groupe (cascadé) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">2. Groupe / Classe</label>
                  <select
                    value={selectedClassroomGroupId}
                    onChange={e => setSelectedClassroomGroupId(e.target.value)}
                    disabled={!selectedClassroomFiliereId}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-all font-semibold ${
                      !selectedClassroomFiliereId 
                        ? 'bg-slate-100 border-slate-200 text-slate-405 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500'
                    }`}
                  >
                    {!selectedClassroomFiliereId ? (
                      <option value="">Sélectionnez d'abord une filière</option>
                    ) : filteredClassroomGroups.length === 0 ? (
                      <option value="">Aucun groupe trouvé</option>
                    ) : (
                      <>
                        <option value="">Choisir un groupe...</option>
                        {filteredClassroomGroups.map(grp => (
                          <option key={grp.id} value={grp.id}>
                            {grp.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* 3. Sélection de la Matière (cascadée) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">3. Matière / Module</label>
                  <select
                    value={selectedClassroomModuleId}
                    onChange={e => setSelectedClassroomModuleId(e.target.value)}
                    disabled={!selectedClassroomGroupId}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition-all font-semibold ${
                      !selectedClassroomGroupId 
                        ? 'bg-slate-100 border-slate-200 text-slate-405 cursor-not-allowed' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500'
                    }`}
                  >
                    {!selectedClassroomGroupId ? (
                      <option value="">Sélectionnez d'abord un groupe</option>
                    ) : filteredClassroomModules.length === 0 ? (
                      <option value="">Aucune matière trouvée</option>
                    ) : (
                      <>
                        <option value="">Choisir une matière...</option>
                        {filteredClassroomModules.map(mod => (
                          <option key={mod.id} value={mod.id}>
                            {mod.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: announcements, documents feed and announcement form */}
            <div className="lg:col-span-3 space-y-6">
              {!selectedClassroomModuleId ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                  <Layers className="h-12 w-12 text-indigo-500/30 mb-4 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-2">Sélectionnez une Matière</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Veuillez sélectionner successivement une Filière, puis un Groupe et enfin une Matière dans le panneau de gauche pour accéder à l'espace de cours.
                  </p>
                </div>
              ) : (
                <>
                  {/* Form to publish/edit an announcement */}
                  <form onSubmit={handlePublishAnnouncement} className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-sm shadow-slate-100/50 space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      {editingAnnouncement ? (
                        <>
                          <Edit className="h-4 w-4 text-amber-500 animate-pulse" /> Modifier l'annonce / support de cours
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 text-indigo-500" /> Publier un support de cours / annonce
                        </>
                      )}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre de l'annonce</label>
                        <input
                          type="text"
                          placeholder="Ex: Chapitre 3 : Architecture REST & Routage"
                          value={announcementForm.title}
                          onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description / Contenu textuel</label>
                        <textarea
                          rows="3"
                          placeholder="Saisissez les détails de l'annonce ou la description du document..."
                          value={announcementForm.content}
                          onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500 resize-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {editingAnnouncement ? "Remplacer le fichier joint (optionnel)" : "Fichier joint (PDF, PPTX, ZIP, Images - Max 5Mo)"}
                        </label>
                        <div className="relative border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-slate-50 hover:bg-slate-100/50 p-6 transition-colors cursor-pointer flex flex-col items-center justify-center">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={e => setAttachedFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.png,.jpg,.jpeg,.pptx,.ppt,.zip"
                          />
                          <Paperclip className="h-5 w-5 text-slate-400 mb-2" />
                          <span className="text-[10px] font-bold text-slate-500 text-center">
                            {attachedFile ? attachedFile.name : editingAnnouncement && editingAnnouncement.file_name ? `Fichier actuel : ${editingAnnouncement.file_name} (cliquez pour remplacer)` : "Cliquez ou glissez un fichier ici pour le joindre"}
                          </span>
                          {attachedFile && (
                            <span className="text-[9px] font-extrabold text-indigo-600 mt-1.5 uppercase tracking-wider">
                              {(attachedFile.size / 1024 / 1024).toFixed(2)} Mo
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1.5 pb-1">
                        <input
                          type="checkbox"
                          id="allow_student_attachments"
                          checked={announcementForm.allow_student_attachments || false}
                          onChange={e => setAnnouncementForm({ ...announcementForm, allow_student_attachments: e.target.checked })}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="allow_student_attachments" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Autoriser les étudiants à ajouter des pièces jointes (fichiers/rendus)
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {editingAnnouncement && (
                        <button
                          type="button"
                          onClick={cancelEditAnnouncement}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          Annuler
                        </button>
                      )}
                      <button
                        type="submit"
                        className={`px-5 py-2.5 ${editingAnnouncement ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2`}
                      >
                        {editingAnnouncement ? 'Enregistrer les modifications' : "Publier l'Annonce"}
                      </button>
                    </div>
                  </form>

                  {/* Announcements Feed list */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Fil d'actualité & Supports</h3>
                    
                    {isAnnouncementsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(n => (
                          <div key={n} className="animate-pulse bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-3 bg-slate-200 rounded w-full"></div>
                            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : classroomAnnouncements.length === 0 ? (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 text-xs italic shadow-sm shadow-slate-100/50">
                        Aucune annonce ou support de cours publié pour ce module.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {classroomAnnouncements.map(ann => {
                          const isEdited = ann.created_at && ann.updated_at && (new Date(ann.updated_at).getTime() - new Date(ann.created_at).getTime() > 2000);
                          return (
                            <div key={ann.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
                              <div className="flex justify-between items-start gap-4 mb-3">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide leading-snug">{ann.title}</h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-450 font-bold whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded">
                                      {new Date(ann.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isEdited && (
                                      <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                                        Modifié
                                      </span>
                                    )}
                                    {ann.allow_student_attachments ? (
                                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                                        Rendus autorisés
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-250 uppercase tracking-wider">
                                        Rendus désactivés
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEditAnnouncement(ann)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-transparent hover:border-amber-150"
                                    title="Modifier cette annonce"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAnnouncement(ann.id)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-150"
                                    title="Supprimer cette annonce"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-slate-650 text-xs leading-relaxed whitespace-pre-line">{ann.content}</p>
                              {renderFileAttachment(ann.file_path)}

                              {ann.allow_student_attachments && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 uppercase tracking-wider">
                                      Pièces jointes des étudiants ({ann.student_attachments?.length || 0})
                                    </span>
                                  </div>
                                  {ann.student_attachments && ann.student_attachments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {ann.student_attachments.map(att => {
                                        const studentName = att.user ? `${att.user.first_name || ''} ${att.user.last_name || ''}` : 'Étudiant';
                                        const fileInfo = getFileExtensionInfo(att.file_name);
                                        const fileUrl = att.file_path.startsWith('http') ? att.file_path : `${storageBaseUrl}/${att.file_path}`;
                                        const uploadDate = new Date(att.created_at).toLocaleDateString('fr-FR', {
                                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        });
                                        return (
                                          <div key={att.id} className="p-3 rounded-xl border border-slate-205 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors">
                                            <div className="min-w-0 flex-1">
                                              <span className="block text-[10px] font-bold text-slate-800 truncate">{studentName}</span>
                                              <a 
                                                href={fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-850 hover:underline truncate block mt-0.5"
                                                title={att.file_name}
                                              >
                                                {att.file_name}
                                              </a>
                                              <span className="block text-[9px] text-slate-400 mt-0.5">{uploadDate}</span>
                                            </div>
                                            <a
                                              href={fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${fileInfo.color} shadow-sm`}
                                              title="Télécharger"
                                            >
                                              <Download className={`h-3.5 w-3.5 ${fileInfo.iconColor}`} />
                                            </a>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-450 italic">Aucun étudiant n'a encore ajouté de pièce jointe.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Demandes de Documents */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Left side: Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Nouvelle demande
                </h2>
                <p className="text-slate-550 text-xs mb-6">
                  Choisissez le document requis. Les ordres de mission nécessitent des informations supplémentaires.
                </p>

                <form onSubmit={handleRequestDocument} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Type de document
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:border-indigo-500 outline-none"
                    >
                      <option value="attestation_travail">Attestation de Travail</option>
                      <option value="ordre_mission">Ordre de Mission</option>
                    </select>
                  </div>

                  {docType === 'ordre_mission' && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 animate-fadeIn">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Destination
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Rabat, Université Mohammed V"
                          value={missionForm.destination}
                          onChange={(e) => setMissionForm({ ...missionForm, destination: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Date de début
                          </label>
                          <input
                            type="date"
                            required
                            value={missionForm.start_date}
                            onChange={(e) => setMissionForm({ ...missionForm, start_date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Date de fin
                          </label>
                          <input
                            type="date"
                            required
                            value={missionForm.end_date}
                            onChange={(e) => setMissionForm({ ...missionForm, end_date: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Motif de la mission
                        </label>
                        <textarea
                          required
                          rows="3"
                          placeholder="Décrivez brièvement le but de votre mission..."
                          value={missionForm.reason}
                          onChange={(e) => setMissionForm({ ...missionForm, reason: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {/* File Attachment Input */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Pièce jointe (PDF, Image - Optionnel)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 cursor-pointer transition-all duration-200">
                        <Paperclip className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-[11px] text-slate-650 font-medium truncate">
                          {docAttachedFile ? docAttachedFile.name : "Sélectionner un fichier"}
                        </span>
                        <input
                          type="file"
                          ref={docFileInputRef}
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setDocAttachedFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {docAttachedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setDocAttachedFile(null);
                            if (docFileInputRef.current) docFileInputRef.current.value = '';
                          }}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-all"
                          title="Supprimer le fichier"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center gap-2"
                  >
                    Soumettre la demande
                  </button>
                </form>
              </div>
            </div>

            {/* Right side: History List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100/50">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Historique des demandes
                </h2>
                <p className="text-slate-550 text-xs mb-6">
                  Suivez le statut de validation et téléchargez vos attestations approuvées.
                </p>

                {isDocsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="animate-pulse bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                        <div className="h-3.5 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : docRequests.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs italic">
                    Aucune demande de document enregistrée.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {docRequests.map(doc => {
                      const displayTitle = doc.type === 'attestation_travail' ? 'Attestation de Travail' :
                                           doc.type === 'ordre_mission' ? 'Ordre de Mission' : doc.type;
                      const dateStr = doc.created_at ? new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Récemment';

                      return (
                        <div key={doc.id} className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{displayTitle}</h4>
                              <p className="text-[10px] text-slate-450 mt-0.5">Demandé le {dateStr}</p>
                            </div>
                            
                            <div>
                              {doc.status === 'pending' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-100 text-amber-600">
                                  En attente
                                </span>
                              )}
                              {doc.status === 'approved' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600">
                                  Approuvée
                                </span>
                              )}
                              {doc.status === 'rejected' && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600">
                                  Rejetée
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Extra details for Mission order */}
                          {doc.type === 'ordre_mission' && (
                            <div className="mt-3 p-2.5 bg-slate-100/60 rounded-lg text-[11px] text-slate-650 space-y-1 border border-slate-150">
                              <div><span className="font-semibold text-slate-800">Destination :</span> {doc.destination}</div>
                              <div><span className="font-semibold text-slate-800">Période :</span> du {doc.start_date} au {doc.end_date}</div>
                              <div><span className="font-semibold text-slate-800">Motif :</span> {doc.motif}</div>
                            </div>
                          )}

                          {/* User uploaded attachment if present */}
                          {doc.attachment_path && (
                            <div className="mt-3 flex items-center gap-2 text-[11px] text-indigo-650 font-semibold bg-indigo-50/50 border border-indigo-100/50 rounded-lg px-2.5 py-1.5 w-fit">
                              <Paperclip className="h-3 w-3 text-indigo-500" />
                              <a
                                href={doc.attachment_path.startsWith('http') ? doc.attachment_path : `${api.defaults.baseURL?.replace('/api', '')}/storage/${doc.attachment_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate max-w-[200px]"
                                title="Ouvrir la pièce jointe"
                              >
                                {doc.attachment_name || "Pièce jointe"}
                              </a>
                            </div>
                          )}

                          {/* Rejection reason if rejected */}
                          {doc.status === 'rejected' && doc.rejection_reason && (
                            <div className="mt-3 p-2.5 bg-rose-50/50 border border-rose-100 text-[11px] text-rose-600 rounded-lg">
                              <span className="font-bold">Motif de refus :</span> {doc.rejection_reason}
                            </div>
                          )}

                          {/* Download button if approved */}
                          {doc.status === 'approved' && (
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  const url = `${api.defaults.baseURL || 'http://127.0.0.1:8000/api'}/admin/documents/${doc.id}/pdf?token=${localStorage.getItem('token')}`;
                                  window.open(url, '_blank');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center gap-1.5 transition-all"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Télécharger le PDF
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Statistiques */}
        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analyses Pédagogiques & Absences</h2>
                <p className="text-xs text-slate-500 mt-0.5">Indicateurs de réussite de vos classes et participation</p>
              </div>
              <button 
                onClick={fetchDetailedStats}
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all text-slate-700 shadow-sm"
              >
                🔄 Rafraîchir les données
              </button>
            </div>

            {loadingDetailedStats ? (
              <div className="py-20 text-center text-slate-500 text-xs font-semibold animate-pulse">
                Chargement de vos statistiques...
              </div>
            ) : detailedStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Moyenne Générale par Module */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-6">Moyenne des Notes par Module Enseigné</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detailedStats.moyenne_par_module || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="module" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 20]} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                          formatter={(value) => [`${Number(value).toFixed(2)} / 20`, 'Moyenne']}
                        />
                        <Bar dataKey="moyenne" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Distribution des Notes par Palier */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">Répartition des Notes par Palier</h3>
                  <div className="flex-1 h-56 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '[0 - 5]', value: detailedStats.distribution_notes?.['0-5'] || 0, fill: '#ef4444' },
                            { name: '[5 - 10]', value: detailedStats.distribution_notes?.['5-10'] || 0, fill: '#f59e0b' },
                            { name: '[10 - 15]', value: detailedStats.distribution_notes?.['10-15'] || 0, fill: '#3b82f6' },
                            { name: '[15 - 20]', value: detailedStats.distribution_notes?.['15-20'] || 0, fill: '#10b981' }
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {
                            [
                              { fill: '#ef4444' },
                              { fill: '#f59e0b' },
                              { fill: '#3b82f6' },
                              { fill: '#10b981' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Taux de Présence par Classe */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl lg:col-span-2">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-6">Taux de Présence Moyen par Groupe d'Étudiants</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detailedStats.presence_par_classe || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="classe" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                          formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Présence']}
                        />
                        <Bar dataKey="taux_presence" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-white border border-slate-200/85 rounded-2xl">
                Aucune donnée statistique disponible pour le moment.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

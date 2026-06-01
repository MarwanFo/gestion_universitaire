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
  Globe,
  Building,
  UserCheck,
  Edit,
  Upload,
  Lock,
  Phone,
  Search,
  SlidersHorizontal,
  Clock,
  MapPin,
  Bookmark,
  Award,
  Layers,
  GitBranch,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Local State synchronized with API
  const [users, setUsers] = useState([]);
  const [fields, setFields] = useState([]);
  const [modules, setModules] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [timetable, setTimetable] = useState([
    { day: 'Lundi', slots: [] },
    { day: 'Mardi', slots: [] },
    { day: 'Mercredi', slots: [] },
    { day: 'Jeudi', slots: [] },
    { day: 'Vendredi', slots: [] }
  ]);
  const [stats, setStats] = useState({ total_students: 0, total_professors: 0, pending_requests: 0 });

  // Dropdowns lists from DB
  const [dbFields, setDbFields] = useState([]);
  const [dbGroups, setDbGroups] = useState([]);

  // Polymorphic User Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // General user states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cin, setCin] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [isActive, setIsActive] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Student specific states
  const [cne, setCne] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear());
  const [bacType, setBacType] = useState('');
  const [bacGrade, setBacGrade] = useState('');
  const [level, setLevel] = useState(1);
  const [groupId, setGroupId] = useState('');
  const [fieldId, setFieldId] = useState('');

  // Professor specific states
  const [speciality, setSpeciality] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('permanent');
  const [office, setOffice] = useState('');
  const [profFieldIds, setProfFieldIds] = useState([]);
  const [profModuleIds, setProfModuleIds] = useState([]);

  // Fields (Programs) Search & Filters State
  const [fieldSearch, setFieldSearch] = useState('');
  const [fieldCycleFilter, setFieldCycleFilter] = useState('');

  // Fields Modal Form States
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldCode, setFieldCode] = useState('');
  const [fieldCycle, setFieldCycle] = useState('LICENCE');
  const [fieldDuration, setFieldDuration] = useState(3);
  const [fieldError, setFieldError] = useState('');
  const [fieldSaving, setFieldSaving] = useState(false);

  // Modules (Courses) Search & Filters State
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleFieldFilter, setModuleFieldFilter] = useState('');
  const [moduleSemesterFilter, setModuleSemesterFilter] = useState('');
  const [moduleTypeFilter, setModuleTypeFilter] = useState('');

  // Modules Modal Form States
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleCredits, setModuleCredits] = useState(4);
  const [moduleCoefficient, setModuleCoefficient] = useState(2.00);
  const [moduleSemester, setModuleSemester] = useState('S1');
  const [moduleType, setModuleType] = useState('STANDARD');
  const [moduleFieldIds, setModuleFieldIds] = useState([]);
  const [moduleProfessorId, setModuleProfessorId] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [moduleSaving, setModuleSaving] = useState(false);

  // Groups (Classes) Search & Filters State
  const [groupSearch, setGroupSearch] = useState('');
  const [groupLevelFilter, setGroupLevelFilter] = useState('');
  const [groupFieldFilter, setGroupFieldFilter] = useState('');

  // Groups List and Rooms List
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Groups Modal Form States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupLevel, setGroupLevel] = useState(1);
  const [groupAcademicYear, setGroupAcademicYear] = useState('2025-2026');
  const [groupRoomId, setGroupRoomId] = useState('');
  const [groupFieldId, setGroupFieldId] = useState('');
  const [groupError, setGroupError] = useState('');
  const [groupSaving, setGroupSaving] = useState(false);

  // View Group Students States
  const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
  const [selectedGroupForStudents, setSelectedGroupForStudents] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loadingGroupStudents, setLoadingGroupStudents] = useState(false);
  const [studentModalSearch, setStudentModalSearch] = useState('');

  // Split Promotion Modal States
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitFieldId, setSplitFieldId] = useState('');
  const [splitLevel, setSplitLevel] = useState(1);
  const [splitNumGroups, setSplitNumGroups] = useState(2);
  const [splitAcademicYear, setSplitAcademicYear] = useState('2025-2026');
  const [splitPrefix, setSplitPrefix] = useState('');
  const [splitSaving, setSplitSaving] = useState(false);
  const [splitError, setSplitError] = useState('');

  // Timetable Tab Management States
  const [timetableGroupId, setTimetableGroupId] = useState('');
  const [timetableFieldId, setTimetableFieldId] = useState('');
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [allTimetableSlots, setAllTimetableSlots] = useState([]);
  const [mgmtSelectedGroupId, setMgmtSelectedGroupId] = useState('');
  const [mgmtFieldId, setMgmtFieldId] = useState('');
  const [mgmtGroupSearch, setMgmtGroupSearch] = useState('');
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotModuleId, setSlotModuleId] = useState('');
  const [slotRoomId, setSlotRoomId] = useState('');
  const [slotDay, setSlotDay] = useState('Lundi');
  const [slotStartTime, setSlotStartTime] = useState('08:30');
  const [slotEndTime, setSlotEndTime] = useState('10:30');
  const [timetableError, setTimetableError] = useState('');
  const [timetableSaving, setTimetableSaving] = useState(false);
  const [timetableAiGenerating, setTimetableAiGenerating] = useState(false);

  // Rooms and Reservations states
  const [dbReservations, setDbReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormName, setRoomFormName] = useState('');
  const [roomFormType, setRoomFormType] = useState('TD');
  const [roomFormCapacity, setRoomFormCapacity] = useState(30);
  const [roomFormError, setRoomFormError] = useState('');
  const [roomFormSaving, setRoomFormSaving] = useState(false);
  const [roomsSubTab, setRoomsSubTab] = useState('salles'); // 'salles' or 'reservations'
  
  // Rejection modal
  const [isRejectReservationModalOpen, setIsRejectReservationModalOpen] = useState(false);
  const [selectedResForRejection, setSelectedResForRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Absences Management states
  const [dbAbsences, setDbAbsences] = useState([]);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  const [absencesClassFilter, setAbsencesClassFilter] = useState('');
  const [selectedJustificationForModal, setSelectedJustificationForModal] = useState(null);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [rejectionReasonAbsence, setRejectionReasonAbsence] = useState('');
  const [isRejectAbsenceModalOpen, setIsRejectAbsenceModalOpen] = useState(false);
  const [selectedAbsenceForRejection, setSelectedAbsenceForRejection] = useState(null);

  const fetchAbsences = async () => {
    setLoadingAbsences(true);
    try {
      const res = await api.get('/admin/absences');
      setDbAbsences(res.data || []);
    } catch (e) {
      console.warn("Failed to fetch absences", e);
    } finally {
      setLoadingAbsences(false);
    }
  };

  const handleApproveJustification = async (absenceId) => {
    try {
      await api.post(`/admin/absences/${absenceId}/justify`, { status: 'validated' });
      await fetchAbsences();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation.');
    }
  };

  const handleRejectJustification = async (e) => {
    e.preventDefault();
    if (!selectedAbsenceForRejection) return;
    try {
      await api.post(`/admin/absences/${selectedAbsenceForRejection.id}/justify`, {
        status: 'rejected',
        rejection_reason: rejectionReasonAbsence
      });
      setIsRejectAbsenceModalOpen(false);
      setSelectedAbsenceForRejection(null);
      setRejectionReasonAbsence('');
      await fetchAbsences();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du rejet.');
    }
  };

  // Grades Management states
  const [gradesMgmtFieldId, setGradesMgmtFieldId] = useState('');
  const [gradesMgmtGroupId, setGradesMgmtGroupId] = useState('');
  const [gradesMgmtModuleId, setGradesMgmtModuleId] = useState('');
  const [gradesMgmtStudents, setGradesMgmtStudents] = useState([]);
  const [gradesMgmtLoading, setGradesMgmtLoading] = useState(false);
  const [gradesMgmtError, setGradesMgmtError] = useState('');
  const [gradesMgmtSaving, setGradesMgmtSaving] = useState(false);
  const [gradesMgmtSuccessMsg, setGradesMgmtSuccessMsg] = useState('');

  const fetchGradesMgmt = async (groupId, moduleId) => {
    if (!groupId || !moduleId) return;
    setGradesMgmtLoading(true);
    setGradesMgmtError('');
    setGradesMgmtSuccessMsg('');
    try {
      const res = await api.get('/admin/grades', {
        params: { group_id: groupId, module_id: moduleId }
      });
      setGradesMgmtStudents(res.data.map(item => ({
        ...item,
        cc1: item.cc1 === null || item.cc1 === undefined ? '' : item.cc1,
        cc2: item.cc2 === null || item.cc2 === undefined ? '' : item.cc2,
        exam: item.exam === null || item.exam === undefined ? '' : item.exam
      })));
    } catch (err) {
      setGradesMgmtError(err.response?.data?.message || 'Erreur lors du chargement des notes.');
    } finally {
      setGradesMgmtLoading(false);
    }
  };

  const handleGradeInputChange = (studentId, field, value) => {
    let parsed = value;
    if (value !== '') {
      // Allow decimals like 14.5
      parsed = value;
      // We will keep it as string so user can type decimals, but validate max/min
      const num = parseFloat(value);
      if (!isNaN(num)) {
        if (num < 0) parsed = '0';
        if (num > 20) parsed = '20';
      }
    }

    setGradesMgmtStudents(prev => prev.map(s => {
      if (s.student_id === studentId) {
        const updated = { ...s, [field]: parsed };
        const cc1Val = parseFloat(updated.cc1) || 0;
        const cc2Val = parseFloat(updated.cc2) || 0;
        const examVal = parseFloat(updated.exam) || 0;
        updated.final_grade = (cc1Val * 0.2) + (cc2Val * 0.2) + (examVal * 0.6);
        return updated;
      }
      return s;
    }));
  };

  const handleSaveGradesMgmt = async () => {
    if (!gradesMgmtModuleId) return;
    setGradesMgmtSaving(true);
    setGradesMgmtError('');
    setGradesMgmtSuccessMsg('');
    try {
      const payload = {
        module_id: gradesMgmtModuleId,
        grades: gradesMgmtStudents.map(s => ({
          student_id: s.student_id,
          cc1: s.cc1 === '' ? 0 : parseFloat(s.cc1),
          cc2: s.cc2 === '' ? 0 : parseFloat(s.cc2),
          exam: s.exam === '' ? 0 : parseFloat(s.exam)
        }))
      };

      await api.post('/admin/grades/bulk', payload);
      setGradesMgmtSuccessMsg('La grille des notes a été enregistrée avec succès.');
      await fetchGradesMgmt(gradesMgmtGroupId, gradesMgmtModuleId);
    } catch (err) {
      setGradesMgmtError(err.response?.data?.message || 'Erreur lors de l\'enregistrement des notes.');
    } finally {
      setGradesMgmtSaving(false);
    }
  };

  useEffect(() => {
    if (gradesMgmtGroupId && gradesMgmtModuleId) {
      fetchGradesMgmt(gradesMgmtGroupId, gradesMgmtModuleId);
    } else {
      setGradesMgmtStudents([]);
    }
  }, [gradesMgmtGroupId, gradesMgmtModuleId]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      setRooms(res.data || []);
    } catch (e) {
      console.warn("Failed to fetch rooms", e);
    }
  };

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await api.get('/admin/reservations');
      setDbReservations(res.data || []);
    } catch (e) {
      console.warn("Failed to fetch reservations", e);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Room Actions
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomFormName.trim()) {
      setRoomFormError('Le nom de la salle est requis.');
      return;
    }
    setRoomFormSaving(true);
    setRoomFormError('');
    try {
      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom.id}`, {
          name: roomFormName,
          type: roomFormType,
          capacity: parseInt(roomFormCapacity)
        });
      } else {
        await api.post('/admin/rooms', {
          name: roomFormName,
          type: roomFormType,
          capacity: parseInt(roomFormCapacity)
        });
      }
      await fetchRooms();
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      setRoomFormName('');
      setRoomFormType('TD');
      setRoomFormCapacity(30);
    } catch (err) {
      setRoomFormError(err.response?.data?.message || 'Erreur lors de l\'enregistrement de la salle.');
    } finally {
      setRoomFormSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette salle ?')) return;
    try {
      await api.delete(`/admin/rooms/${roomId}`);
      await fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression de la salle.');
    }
  };

  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormName('');
    setRoomFormType('TD');
    setRoomFormCapacity(30);
    setRoomFormError('');
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormName(room.name);
    setRoomFormType(room.type);
    setRoomFormCapacity(room.capacity);
    setRoomFormError('');
    setIsRoomModalOpen(true);
  };

  // Reservation Actions
  const handleApproveReservation = async (resId) => {
    try {
      await api.put(`/admin/reservations/${resId}`, { status: 'approved' });
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation.');
    }
  };

  const handleRejectReservation = async (e) => {
    e.preventDefault();
    if (!selectedResForRejection) return;
    try {
      await api.put(`/admin/reservations/${selectedResForRejection.id}`, {
        status: 'rejected',
        reason: rejectionReason
      });
      setIsRejectReservationModalOpen(false);
      setSelectedResForRejection(null);
      setRejectionReason('');
      await fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du rejet.');
    }
  };

  // Fetch PostgreSQL records
  useEffect(() => {
    const fetchData = async () => {
      const promises = [
        api.get('/admin/users').then(res => setUsers(res.data)).catch(e => console.warn("Failed to fetch admin users", e)),
        api.get('/admin/stats').then(res => setStats(res.data)).catch(e => console.warn("Failed to fetch admin stats", e)),
        api.get('/documents').then(res => {
          setDocumentRequests(res.data.map(doc => ({
            id: doc.id,
            studentName: doc.user ? doc.user.name : 'Inconnu',
            documentType: doc.type === 'scolarite' ? 'Attestation de scolarité' :
                         doc.type === 'releve' ? 'Relevé de notes - GINFO 2' : 'Autre Document',
            date: doc.created_at ? doc.created_at.substring(0, 10) : '2026-05-28',
            status: doc.status === 'pending' ? 'En attente' :
                    doc.status === 'approved' ? 'Approuvée' : 'Rejetée'
          })));
        }).catch(e => console.warn("Failed to fetch document requests", e)),
        api.get('/timetables').then(res => {
          if (res.data && res.data.length > 0) {
            setTimetable(res.data);
          }
        }).catch(e => console.warn("Failed to fetch timetable", e)),
        api.get('/admin/fields-groups').then(res => {
          setDbFields(res.data.fields || []);
          setDbGroups(res.data.groups || []);
        }).catch(e => console.warn("Failed to fetch fields and groups", e)),
        api.get('/admin/fields').then(res => setFields(res.data || [])).catch(e => console.warn("Failed to fetch fields", e)),
        api.get('/admin/modules').then(res => setModules(res.data || [])).catch(e => console.warn("Failed to fetch modules", e)),
        api.get('/admin/groups').then(res => setGroups(res.data || [])).catch(e => console.warn("Failed to fetch groups", e)),
        api.get('/admin/rooms').then(res => setRooms(res.data || [])).catch(e => console.warn("Failed to fetch rooms", e)),
        api.get('/admin/timetables').then(res => setAllTimetableSlots(res.data || [])).catch(e => console.warn("Failed to fetch all slots", e)),
        api.get('/admin/reservations').then(res => setDbReservations(res.data || [])).catch(e => console.warn("Failed to fetch reservations", e)),
        api.get('/admin/absences').then(res => setDbAbsences(res.data || [])).catch(e => console.warn("Failed to fetch absences", e))
      ];

      await Promise.allSettled(promises);
    };
    fetchData();
  }, []);

  // User form reset
  const resetForm = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setCin('');
    setPhone('');
    setRole('student');
    setIsActive(true);
    setAvatarFile(null);
    setAvatarPreview(null);
    
    setCne('');
    setEnrollmentYear(new Date().getFullYear());
    setBacType('');
    setBacGrade('');
    setLevel(1);
    setGroupId('');
    setFieldId('');
    
    setSpeciality('');
    setDepartment('');
    setEmploymentType('permanent');
    setOffice('');
    setProfFieldIds([]);
    setProfModuleIds([]);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFirstName(u.first_name || '');
    setLastName(u.last_name || '');
    setEmail(u.email || '');
    setPassword('');
    setCin(u.cin || '');
    setPhone(u.phone || '');
    setRole(u.role);
    setIsActive(u.is_active ?? true);
    setAvatarFile(null);
    setAvatarPreview(u.avatar_path ? `${api.defaults.baseURL.replace('/api', '')}${u.avatar_path}` : null);

    if (u.role === 'student' && u.student_profile) {
      const sp = u.student_profile;
      setCne(sp.cne || '');
      setEnrollmentYear(sp.enrollment_year || new Date().getFullYear());
      setBacType(sp.bac_type || '');
      setBacGrade(sp.bac_grade || '');
      setLevel(sp.level || 1);
      setGroupId(sp.group_id || '');
      setFieldId(sp.field_id || '');
    } else {
      setCne('');
      setEnrollmentYear(new Date().getFullYear());
      setBacType('');
      setBacGrade('');
      setLevel(1);
      setGroupId('');
      setFieldId('');
    }

    if (u.role === 'professor' && u.professor_profile) {
      const pp = u.professor_profile;
      setSpeciality(pp.speciality || '');
      setDepartment(pp.department || '');
      setEmploymentType(pp.employment_type || 'permanent');
      setOffice(pp.office || '');
      
      setProfFieldIds(u.fields?.map(f => f.id) || []);
      const modulesList = u.taught_modules || u.taughtModules || [];
      setProfModuleIds(modulesList.map(m => m.id) || []);
    } else {
      setSpeciality('');
      setDepartment('');
      setEmploymentType('permanent');
      setOffice('');
      setProfFieldIds([]);
      setProfModuleIds([]);
    }

    setIsModalOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert("Prénom, Nom et Email sont requis.");
      return;
    }
    if (!editingUser && !password) {
      alert("Le mot de passe est obligatoire pour la création.");
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    if (password) {
      formData.append('password', password);
    }
    formData.append('cin', cin || '');
    formData.append('phone', phone || '');
    formData.append('role', role);
    formData.append('is_active', isActive ? 1 : 0);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    if (role === 'student') {
      if (!cne || !bacType || !bacGrade || !enrollmentYear) {
        alert("Veuillez remplir tous les champs de l'étudiant (CNE, Année, Bac, Note Bac).");
        return;
      }
      formData.append('cne', cne);
      formData.append('enrollment_year', enrollmentYear);
      formData.append('bac_type', bacType);
      formData.append('bac_grade', bacGrade);
      formData.append('level', level);
      if (groupId) formData.append('group_id', groupId);
      if (fieldId) formData.append('field_id', fieldId);
    } else if (role === 'professor') {
      if (!speciality || !department) {
        alert("Spécialité et Département sont obligatoires pour un enseignant.");
        return;
      }
      formData.append('speciality', speciality);
      formData.append('department', department);
      formData.append('employment_type', employmentType);
      if (office) formData.append('office', office);

      profFieldIds.forEach(id => {
        formData.append('field_ids[]', id);
      });
      profModuleIds.forEach(id => {
        formData.append('module_ids[]', id);
      });
    }

    try {
      let res;
      if (editingUser) {
        formData.append('_method', 'PUT');
        res = await api.post(`/admin/users/${editingUser.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/admin/users', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const savedUser = res.data.user;
      
      // Update list
      if (editingUser) {
        setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
      } else {
        setUsers([savedUser, ...users]);
      }

      // Refresh Stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.";
      alert(msg);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      
      // Refresh Stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer l'utilisateur.");
    }
  };

  // Field (Programs) Helpers
  const resetFieldForm = () => {
    setEditingField(null);
    setFieldName('');
    setFieldCode('');
    setFieldCycle('LICENCE');
    setFieldDuration(3);
    setFieldError('');
    setFieldSaving(false);
  };

  const openAddFieldModal = () => {
    resetFieldForm();
    setIsFieldModalOpen(true);
  };

  const openEditFieldModal = (f) => {
    setEditingField(f);
    setFieldName(f.name || '');
    setFieldCode(f.code || '');
    setFieldCycle(f.cycle || 'LICENCE');
    setFieldDuration(f.duration || 3);
    setIsFieldModalOpen(true);
  };

  const handleSaveField = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.log('handleSaveField called', { fieldName, fieldCode, fieldCycle, fieldDuration });
    setFieldError('');

    if (!fieldName.trim() || !fieldCode.trim() || !fieldCycle || !fieldDuration) {
      setFieldError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    const payload = { name: fieldName.trim(), code: fieldCode.trim().toUpperCase(), cycle: fieldCycle, duration: Number(fieldDuration) };
    console.log('Sending payload:', payload);

    setFieldSaving(true);
    try {
      let res;
      if (editingField) {
        res = await api.put(`/admin/fields/${editingField.id}`, payload);
        const updated = res.data.field;
        setFields(fields.map(f => f.id === updated.id ? updated : f));
        setDbFields(dbFields.map(f => f.id === updated.id ? updated : f));
      } else {
        res = await api.post('/admin/fields', payload);
        const created = res.data.field;
        setFields([created, ...fields]);
        setDbFields([...dbFields, created]);
      }
      setIsFieldModalOpen(false);
      resetFieldForm();
    } catch (error) {
      console.error('Field save error:', error);
      const errs = error.response?.data?.errors;
      const msg = errs ? Object.values(errs).flat().join(' ') : (error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
      setFieldError(msg);
    } finally {
      setFieldSaving(false);
    }
  };

  const handleDeleteField = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette filière ? Tous les groupes et étudiants associés risquent d'être impactés.")) return;
    try {
      await api.delete(`/admin/fields/${id}`);
      setFields(fields.filter(f => f.id !== id));
      setDbFields(dbFields.filter(f => f.id !== id));
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la filière.");
    }
  };

  // Modules (Matières) Helpers
  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleName('');
    setModuleCode('');
    setModuleCredits(4);
    setModuleCoefficient(2.00);
    setModuleSemester('S1');
    setModuleType('STANDARD');
    setModuleFieldIds([]);
    setModuleProfessorId('');
  };

  const openAddModuleModal = () => {
    resetModuleForm();
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (m) => {
    setEditingModule(m);
    setModuleName(m.name || '');
    setModuleCode(m.code || '');
    setModuleCredits(m.credits || 4);
    setModuleCoefficient(m.coefficient || 2.00);
    setModuleSemester(m.semester || 'S1');
    setModuleType(m.type || 'STANDARD');
    setModuleFieldIds(m.fields?.map(f => f.id) || []);
    setModuleProfessorId(m.professor_id || '');
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    console.log('handleSaveModule called', { moduleName, moduleCode, moduleSemester, moduleType, moduleFieldIds });
    setModuleError('');

    if (!moduleName.trim() || !moduleCode.trim() || !moduleSemester || !moduleType || moduleFieldIds.length === 0) {
      setModuleError('Tous les champs sont obligatoires. Sélectionnez au moins une filière.');
      return;
    }

    const payload = {
      name: moduleName.trim(),
      code: moduleCode.trim().toUpperCase(),
      credits: Number(moduleCredits),
      coefficient: Number(moduleCoefficient),
      semester: moduleSemester,
      type: moduleType,
      field_ids: moduleFieldIds
    };
    console.log('Sending module payload:', payload);

    setModuleSaving(true);
    try {
      let res;
      if (editingModule) {
        res = await api.put(`/admin/modules/${editingModule.id}`, payload);
        const updated = res.data.module;
        setModules(modules.map(m => m.id === updated.id ? updated : m));
      } else {
        res = await api.post('/admin/modules', payload);
        const created = res.data.module;
        setModules([created, ...modules]);
      }
      setIsModuleModalOpen(false);
      resetModuleForm();
    } catch (error) {
      console.error('Module save error:', error);
      const errs = error.response?.data?.errors;
      const msg = errs ? Object.values(errs).flat().join(' ') : (error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
      setModuleError(msg);
    } finally {
      setModuleSaving(false);
    }
  };

  // Groups (Classes) Helpers
  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupLevel(1);
    setGroupAcademicYear('2025-2026');
    setGroupRoomId('');
    setGroupFieldId('');
    setGroupError('');
    setGroupSaving(false);
  };

  const openAddGroupModal = () => {
    resetGroupForm();
    if (dbFields.length > 0) {
      setGroupFieldId(dbFields[0].id);
    }
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (g) => {
    setEditingGroup(g);
    setGroupName(g.name || '');
    setGroupLevel(g.level || 1);
    setGroupAcademicYear(g.academic_year || '2025-2026');
    setGroupRoomId(g.room_id || '');
    setGroupFieldId(g.field_id || '');
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setGroupError('');

    if (!groupName.trim() || !groupLevel || !groupAcademicYear || !groupFieldId) {
      setGroupError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    const payload = {
      name: groupName.trim(),
      level: Number(groupLevel),
      academic_year: groupAcademicYear.trim(),
      room_id: groupRoomId ? Number(groupRoomId) : null,
      field_id: Number(groupFieldId)
    };

    setGroupSaving(true);
    try {
      let res;
      if (editingGroup) {
        res = await api.put(`/admin/groups/${editingGroup.id}`, payload);
        const updated = res.data.group;
        setGroups(groups.map(g => g.id === updated.id ? updated : g));
        setDbGroups(dbGroups.map(g => g.id === updated.id ? updated : g));
      } else {
        res = await api.post('/admin/groups', payload);
        const created = res.data.group;
        setGroups([created, ...groups]);
        setDbGroups([...dbGroups, created]);
      }
      setIsGroupModalOpen(false);
      resetGroupForm();
    } catch (error) {
      console.error('Group save error:', error);
      const errs = error.response?.data?.errors;
      const msg = errs ? Object.values(errs).flat().join(' ') : (error.response?.data?.message || 'Erreur lors de l\'enregistrement.');
      setGroupError(msg);
    } finally {
      setGroupSaving(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cette classe ? Les étudiants associés seront détachés de cette classe.")) return;
    try {
      await api.delete(`/admin/groups/${id}`);
      setGroups(groups.filter(g => g.id !== id));
      setDbGroups(dbGroups.filter(g => g.id !== id));
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la classe.");
    }
  };

  const handleViewGroupStudents = async (group) => {
    setSelectedGroupForStudents(group);
    setGroupStudents([]);
    setStudentModalSearch('');
    setLoadingGroupStudents(true);
    setIsViewStudentsModalOpen(true);
    try {
      const res = await api.get(`/admin/groups/${group.id}/students`);
      setGroupStudents(res.data || []);
    } catch (e) {
      console.error("Failed to fetch group students", e);
    } finally {
      setLoadingGroupStudents(false);
    }
  };

  const openSplitModal = () => {
    setSplitError('');
    if (dbFields.length > 0) {
      setSplitFieldId(dbFields[0].id);
    }
    setSplitLevel(1);
    setSplitNumGroups(2);
    setSplitAcademicYear('2025-2026');
    setSplitPrefix('');
    setIsSplitModalOpen(true);
  };

  const handleSaveSplit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setSplitError('');

    if (!splitFieldId || !splitLevel || !splitNumGroups || !splitAcademicYear) {
      setSplitError('Tous les champs obligatoires doivent être renseignés.');
      return;
    }

    const payload = {
      field_id: Number(splitFieldId),
      level: Number(splitLevel),
      number_of_groups: Number(splitNumGroups),
      academic_year: splitAcademicYear.trim(),
      group_prefix: splitPrefix ? splitPrefix.trim() : null
    };

    setSplitSaving(true);
    try {
      await api.post('/admin/groups/split', payload);
      
      // Reload groups list
      const groupsRes = await api.get('/admin/groups');
      setGroups(groupsRes.data || []);
      
      // Reload fields & groups dropdown (for other parts of application)
      const fgRes = await api.get('/admin/fields-groups');
      setDbGroups(fgRes.data.groups || []);
      
      setIsSplitModalOpen(false);
    } catch (error) {
      console.error('Split save error:', error);
      const errs = error.response?.data?.errors;
      const msg = errs ? Object.values(errs).flat().join(' ') : (error.response?.data?.message || 'Erreur lors de la division.');
      setSplitError(msg);
    } finally {
      setSplitSaving(false);
    }
  };

  // Fetch timetable slots when group changes or is initialized
  useEffect(() => {
    if (timetableGroupId) {
      fetchTimetableSlots(timetableGroupId);
    } else if (dbGroups.length > 0) {
      setTimetableGroupId(dbGroups[0].id);
    }
  }, [timetableGroupId, dbGroups]);

  const fetchAllTimetableSlots = async () => {
    try {
      const res = await api.get('/admin/timetables');
      setAllTimetableSlots(res.data);
    } catch (e) {
      console.error("Failed to fetch all slots", e);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved_timetables') {
      fetchAllTimetableSlots();
    }
  }, [activeTab]);

  const fetchTimetableSlots = async (gId) => {
    try {
      const res = await api.get(`/admin/timetables?group_id=${gId}`);
      setTimetableSlots(res.data);
    } catch (e) {
      console.error("Failed to fetch group timetable slots", e);
    }
  };

  const openAddSlotModal = (day = 'Lundi', timeSlot = '08:30-10:30') => {
    setEditingSlot(null);
    setSlotDay(day);
    const [start, end] = timeSlot.split('-');
    setSlotStartTime(start);
    setSlotEndTime(end);
    setTimetableError('');
    
    // default room to selected group's default room if exists
    const group = dbGroups.find(g => g.id === Number(timetableGroupId));
    if (group && group.room_id) {
      setSlotRoomId(group.room_id);
    } else if (rooms.length > 0) {
      setSlotRoomId(rooms[0].id);
    }
    
    // default module to the first module in group's field if available
    const groupModules = modules.filter(m => m.fields?.some(f => f.id === group?.field_id));
    if (groupModules.length > 0) {
      setSlotModuleId(groupModules[0].id);
    } else {
      setSlotModuleId('');
    }
    
    setIsTimetableModalOpen(true);
  };

  const openEditSlotModal = (slot) => {
    setEditingSlot(slot);
    setSlotDay(slot.day);
    setSlotStartTime(slot.start_time.substring(0, 5));
    setSlotEndTime(slot.end_time.substring(0, 5));
    setSlotModuleId(slot.module_id);
    setSlotRoomId(slot.room_id);
    setTimetableError('');
    setIsTimetableModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!slotModuleId || !slotRoomId || !slotDay || !slotStartTime || !slotEndTime) {
      setTimetableError("Tous les champs sont requis.");
      return;
    }

    const payload = {
      group_id: Number(timetableGroupId),
      module_id: Number(slotModuleId),
      room_id: Number(slotRoomId),
      day: slotDay,
      start_time: slotStartTime,
      end_time: slotEndTime
    };

    setTimetableSaving(true);
    setTimetableError('');
    try {
      if (editingSlot) {
        await api.put(`/admin/timetables/${editingSlot.id}`, payload);
      } else {
        await api.post('/admin/timetables', payload);
      }
      await fetchTimetableSlots(timetableGroupId);
      await fetchAllTimetableSlots();
      setIsTimetableModalOpen(false);
    } catch (err) {
      console.error("Failed to save timetable slot", err);
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement du créneau.";
      setTimetableError(msg);
    } finally {
      setTimetableSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm("Voulez-vous vraiment supprimer ce cours de l'emploi du temps ?")) return;
    try {
      await api.delete(`/admin/timetables/${slotId}`);
      await fetchTimetableSlots(timetableGroupId);
    } catch (e) {
      console.error("Failed to delete slot", e);
      alert("Impossible de supprimer le cours.");
    }
  };

  const handleClearTimetable = async () => {
    if (!confirm("Voulez-vous vraiment vider tout l'emploi du temps de cette classe ? Cette action est irréversible.")) return;
    try {
      await api.delete(`/admin/timetables/group/${timetableGroupId}`);
      await fetchTimetableSlots(timetableGroupId);
    } catch (e) {
      console.error("Failed to clear timetable", e);
      alert("Impossible de vider l'emploi du temps.");
    }
  };

  const handleGenerateTimetableAi = async () => {
    if (!timetableGroupId) return;
    setTimetableAiGenerating(true);
    try {
      const res = await api.post('/admin/timetables/generate', { group_id: Number(timetableGroupId) });
      alert(res.data.message || "Emploi du temps planifié automatiquement !");
      await fetchTimetableSlots(timetableGroupId);
    } catch (err) {
      console.error("AI timetable generation error", err);
      const msg = err.response?.data?.message || "Une erreur est survenue pendant la génération par l'IA.";
      alert(msg);
    } finally {
      setTimetableAiGenerating(false);
    }
  };

  const handlePublishTimetable = async (publishAll = false) => {
    const confirmMsg = publishAll 
      ? "Voulez-vous vraiment publier TOUS les emplois du temps ? Ils seront visibles par tous les étudiants."
      : "Voulez-vous publier l'emploi du temps de cette classe ? Il sera immédiatement visible par les étudiants concernés.";
    
    if (!confirm(confirmMsg)) return;

    try {
      const payload = publishAll ? { publish_all: true } : { group_id: Number(timetableGroupId) };
      const res = await api.post('/admin/timetables/publish', payload);
      alert(res.data.message || "Publication réussie !");
      if (timetableGroupId) {
        await fetchTimetableSlots(timetableGroupId);
      }
    } catch (e) {
      console.error("Failed to publish timetable", e);
      alert("Une erreur est survenue lors de la publication.");
    }
  };

  // Filtered fields list
  const filteredFields = fields.filter(f => {
    const matchesSearch = f.name?.toLowerCase().includes(fieldSearch.toLowerCase()) || 
                          f.code?.toLowerCase().includes(fieldSearch.toLowerCase());
    const matchesCycle = !fieldCycleFilter || f.cycle === fieldCycleFilter;
    return matchesSearch && matchesCycle;
  });

  // Filtered modules list
  const filteredModules = modules.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(moduleSearch.toLowerCase()) || 
                          m.code?.toLowerCase().includes(moduleSearch.toLowerCase());
    const matchesField = !moduleFieldFilter || m.fields?.some(f => String(f.id) === String(moduleFieldFilter));
    const matchesSemester = !moduleSemesterFilter || m.semester === moduleSemesterFilter;
    const matchesType = !moduleTypeFilter || m.type === moduleTypeFilter;
    return matchesSearch && matchesField && matchesSemester && matchesType;
  });

  // Filtered groups (classes) list
  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(groupSearch.toLowerCase());
    const matchesLevel = !groupLevelFilter || Number(g.level) === Number(groupLevelFilter);
    const matchesField = !groupFieldFilter || Number(g.field_id) === Number(groupFieldFilter);
    return matchesSearch && matchesLevel && matchesField;
  });

  // Filter list of professors
  const professorsList = users.filter(u => u.role === 'professor');

  const isCurrentPublished = timetableSlots.length > 0 && timetableSlots.every(s => s.is_published);

  const handleApproveDoc = async (id) => {
    try {
      await api.post(`/documents/${id}/approve`);
      setDocumentRequests(documentRequests.map(doc => 
        doc.id === id ? { ...doc, status: 'Approuvée' } : doc
      ));
      setStats(prev => ({ ...prev, pending_requests: Math.max(0, prev.pending_requests - 1) }));
    } catch (error) {
      console.error(error);
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
    }
  };

  const studentUsers = users.filter(u => u.role === 'student');
  const filteredStudentsForAbsences = studentUsers.filter(u => {
    const studentGroupId = u.student_profile?.group_id;
    if (!absencesClassFilter) return true;
    return studentGroupId === parseInt(absencesClassFilter);
  });

  const getUnjustifiedAbsencesCount = (studentId) => {
    return dbAbsences.filter(a => 
      a.student_id === studentId && 
      a.status === 'absent' && 
      a.justification_status !== 'validated'
    ).length;
  };

  const pendingAbsences = dbAbsences.filter(a => 
    a.justification_path && 
    a.justification_status === 'pending'
  );

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
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-550"
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
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Filières
            </button>

            <button
              onClick={() => { setActiveTab('modules'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'modules' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Matières
            </button>

            <button
              onClick={() => { setActiveTab('groups'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'groups' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Layers className="h-4 w-4" />
              Classes / Groupes
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

            <button
              onClick={() => { setActiveTab('saved_timetables'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'saved_timetables' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Layers className="h-4 w-4" />
              Gestion des Emplois
            </button>

            <button
              onClick={() => { setActiveTab('timetable'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'timetable' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Planificateur IA
            </button>

            <button
              onClick={() => { setActiveTab('rooms'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'rooms' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Salles & Réservations
            </button>

            <button
              onClick={() => { setActiveTab('grades_mgmt'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'grades_mgmt' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Award className="h-4 w-4" />
              Saisie des Notes
            </button>

            <button
              onClick={() => { setActiveTab('absences_mgmt'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'absences_mgmt' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm shadow-indigo-500/5' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Suivi des Absences
            </button>
          </nav>
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 text-slate-550 hover:text-rose-600 text-xs font-bold uppercase tracking-wider transition-all duration-200 mt-auto border border-transparent hover:border-rose-200/50"
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
            <p className="text-slate-550 text-xs mt-1">Gérez le portail UPF et suivez les activités</p>
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
                  {documentRequests.filter(d => d.status === 'En attente').length === 0 && (
                    <span className="block text-center text-slate-400 text-xs italic py-6">Aucune demande en attente.</span>
                  )}
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
                  <button onClick={openAddModal} className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
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

        {/* Tab: Saved Timetables Management */}
        {activeTab === 'saved_timetables' && (() => {
          const selectedGroupObj = dbGroups.find(g => String(g.id) === String(mgmtSelectedGroupId));
          
          const handleSelectMgmtGroup = (gId) => {
            setMgmtSelectedGroupId(gId);
            setTimetableGroupId(gId);
            if (gId) {
              fetchTimetableSlots(gId);
            }
          };

          const handleLocalPublish = async (publishAll = false) => {
            const confirmMsg = publishAll 
              ? "Voulez-vous vraiment publier TOUS les emplois du temps ? Ils seront visibles par tous les étudiants."
              : `Voulez-vous publier l'emploi du temps de la classe "${selectedGroupObj?.name}" ?`;
            
            if (!confirm(confirmMsg)) return;

            try {
              const payload = publishAll ? { publish_all: true } : { group_id: Number(mgmtSelectedGroupId) };
              const res = await api.post('/admin/timetables/publish', payload);
              alert(res.data.message || "Publication réussie !");
              fetchAllTimetableSlots();
              if (mgmtSelectedGroupId) {
                fetchTimetableSlots(mgmtSelectedGroupId);
              }
            } catch (e) {
              console.error("Failed to publish timetable", e);
              alert("Une erreur est survenue lors de la publication.");
            }
          };

          const handleLocalClear = async () => {
            if (!mgmtSelectedGroupId) return;
            if (!confirm(`Voulez-vous vider l'emploi du temps de la classe "${selectedGroupObj?.name}" ? Cette action est irréversible.`)) return;
            try {
              await api.delete(`/admin/timetables/group/${mgmtSelectedGroupId}`);
              alert("L'emploi du temps a été vidé.");
              fetchAllTimetableSlots();
              fetchTimetableSlots(mgmtSelectedGroupId);
            } catch (e) {
              console.error("Failed to clear timetable", e);
              alert("Impossible de vider l'emploi du temps.");
            }
          };

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Filter and Actions Panel */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Gestion & Publication</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Filtrez par filière pour gérer et publier les emplois sauvegardés</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {/* Filière Filter Selector */}
                    <div className="relative w-full sm:w-48">
                      <select
                        value={mgmtFieldId}
                        onChange={e => {
                          setMgmtFieldId(e.target.value);
                          handleSelectMgmtGroup('');
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase"
                      >
                        <option value="">Toutes les Filières</option>
                        {dbFields.map(f => (
                          <option key={f.id} value={f.id}>{f.code || f.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Group Filter Selector */}
                    <div className="relative w-full sm:w-48">
                      <select
                        value={mgmtSelectedGroupId}
                        onChange={e => handleSelectMgmtGroup(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase"
                      >
                        <option value="">Sélectionner Classe...</option>
                        {dbGroups
                          .filter(g => !mgmtFieldId || String(g.field_id) === String(mgmtFieldId))
                          .map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))
                        }
                      </select>
                    </div>

                    {mgmtSelectedGroupId && (
                      <div className="flex-shrink-0">
                        {timetableSlots.length === 0 ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-550 font-bold text-[10px] uppercase">Vide</span>
                        ) : timetableSlots.every(s => s.is_published) ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">🟢 Publié</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px] uppercase flex items-center gap-1">🟡 Brouillon</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Action buttons */}
                {mgmtSelectedGroupId && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleLocalPublish(false)}
                      className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Globe className="h-4 w-4" /> Publier classe
                    </button>
                    <button
                      onClick={() => handleLocalPublish(true)}
                      className="py-2.5 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Globe className="h-4 w-4 text-indigo-500" /> Tout publier
                    </button>
                    <button
                      onClick={handleLocalClear}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" /> Vider
                    </button>
                    <button
                      onClick={() => openAddSlotModal()}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Ajouter Cours
                    </button>
                  </div>
                )}
              </div>

              {/* Weekly Calendar Grid */}
              {!mgmtSelectedGroupId ? (
                <div className="p-16 text-center rounded-2xl bg-white border border-slate-200 border-dashed text-slate-450 italic">
                  Sélectionnez une filière et une classe ci-dessus pour afficher et gérer son emploi du temps sauvegardé.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Calendar Grid Container */}
                  <div className="rounded-2xl bg-white border border-slate-200/85 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                            <th className="p-4 w-28 text-left">Jour</th>
                            <th className="p-4 border-l border-slate-100">08:30 - 10:30</th>
                            <th className="p-4 border-l border-slate-100">10:30 - 12:30</th>
                            <th className="p-4 border-l border-slate-100">14:00 - 16:00</th>
                            <th className="p-4 border-l border-slate-100">16:00 - 18:00</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                            <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                              <td className="p-4 font-bold text-slate-800 bg-slate-50/30">{day}</td>
                              {['08:30-10:30', '10:30-12:30', '14:00-16:00', '16:00-18:00'].map(timeRange => {
                                const [start, end] = timeRange.split('-');
                                const matchingSlot = timetableSlots.find(s => {
                                  const sStart = s.start_time.substring(0, 5);
                                  const sEnd = s.end_time.substring(0, 5);
                                  return s.day === day && sStart === start && sEnd === end;
                                });

                                return (
                                  <td key={timeRange} className="p-3 border-l border-slate-100 w-1/4 h-24 relative group">
                                    {matchingSlot ? (
                                      <div className={`h-full p-2.5 rounded-xl border flex flex-col justify-between transition-all group-hover:shadow-sm ${
                                        matchingSlot.is_published 
                                          ? 'bg-emerald-50/50 border-emerald-100' 
                                          : 'bg-indigo-50/60 border-indigo-100'
                                      }`}>
                                        <div className="space-y-1">
                                          <div className="flex justify-between items-start">
                                            <span className={`px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                                              matchingSlot.is_published 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'bg-indigo-600 text-white'
                                            }`}>
                                              {matchingSlot.module?.code || 'COURS'}
                                            </span>
                                            
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button 
                                                onClick={() => openEditSlotModal(matchingSlot)}
                                                className="p-1 rounded bg-white border border-slate-200 text-slate-550 hover:bg-slate-50 hover:text-indigo-650 shadow-sm"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </button>
                                              <button 
                                                onClick={async () => {
                                                  if (confirm("Supprimer ce cours ?")) {
                                                    await api.delete(`/admin/timetables/${matchingSlot.id}`);
                                                    fetchTimetableSlots(mgmtSelectedGroupId);
                                                    fetchAllTimetableSlots();
                                                  }
                                                }}
                                                className="p-1 rounded bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 shadow-sm"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </button>
                                            </div>
                                          </div>
                                          <h4 className="font-bold text-slate-800 text-[11px] truncate" title={matchingSlot.module?.name}>
                                            {matchingSlot.module?.name}
                                          </h4>
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                                          <span className="truncate flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                            {matchingSlot.room?.name || 'N/A'}
                                          </span>
                                          <span className="truncate font-medium text-slate-500">
                                            {matchingSlot.module?.professor?.name || 'Sans prof'}
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => openAddSlotModal(day, timeRange)}
                                        className="w-full h-full rounded-xl border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100"
                                      >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold">Planifier</span>
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Hors-Gabarit list */}
                  {timetableSlots.filter(s => {
                    const sStart = s.start_time.substring(0, 5);
                    const sEnd = s.end_time.substring(0, 5);
                    const standardTimes = ['08:30', '10:30', '14:00', '16:00', '12:30', '18:00'];
                    return !standardTimes.includes(sStart) || !standardTimes.includes(sEnd);
                  }).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Créneaux horaires hors-gabarit</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {timetableSlots.filter(s => {
                          const sStart = s.start_time.substring(0, 5);
                          const sEnd = s.end_time.substring(0, 5);
                          const standardTimes = ['08:30', '10:30', '14:00', '16:00', '12:30', '18:00'];
                          return !standardTimes.includes(sStart) || !standardTimes.includes(sEnd);
                        }).map(slot => (
                          <div key={slot.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all hover:shadow-sm ${
                            slot.is_published 
                              ? 'bg-emerald-50/50 border-emerald-100' 
                              : 'bg-indigo-50/60 border-indigo-100'
                          }`}>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {slot.day} • {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => openEditSlotModal(slot)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-550 hover:bg-slate-50 hover:text-indigo-650 shadow-sm"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (confirm("Supprimer ce cours ?")) {
                                      await api.delete(`/admin/timetables/${slot.id}`);
                                      fetchTimetableSlots(mgmtSelectedGroupId);
                                      fetchAllTimetableSlots();
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 shadow-sm"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                                  slot.is_published 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-indigo-600 text-white'
                                }`}>
                                  {slot.module?.code || 'COURS'}
                                </span>
                                <h4 className="font-bold text-slate-800 text-[11px] truncate">{slot.module?.name}</h4>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-450 font-semibold mt-2 pt-2 border-t border-slate-100">
                                <span className="truncate flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                  {slot.room?.name || 'N/A'}
                                </span>
                                <span className="truncate font-medium text-slate-500">
                                  {slot.module?.professor?.name || 'Sans prof'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab: Timetable */}
        {activeTab === 'timetable' && (
          <div className="space-y-6 animate-fadeIn">
              {/* Header / Selector Panel */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Emploi du Temps</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Planifiez et résolvez les conflits grâce à l'IA NVIDIA</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                      <select
                        value={timetableFieldId}
                        onChange={e => {
                          setTimetableFieldId(e.target.value);
                          setTimetableGroupId('');
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase"
                      >
                        <option value="">Sélectionner Filière...</option>
                        {dbFields.map(f => (
                          <option key={f.id} value={f.id}>{f.code || f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative w-full sm:w-48">
                      <select
                        value={timetableGroupId}
                        onChange={e => setTimetableGroupId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase"
                      >
                        <option value="">Sélectionner Classe...</option>
                        {dbGroups
                          .filter(g => !timetableFieldId || String(g.field_id) === String(timetableFieldId))
                          .map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))
                        }
                      </select>
                    </div>
                    {timetableGroupId && (
                      <div className="flex-shrink-0">
                        {timetableSlots.length === 0 ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[10px] uppercase">Vide</span>
                        ) : isCurrentPublished ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">🟢 Publié</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[10px] uppercase flex items-center gap-1">🟡 Brouillon</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {timetableGroupId && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={handleGenerateTimetableAi}
                      disabled={timetableAiGenerating}
                      className="py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      <GitBranch className="h-4 w-4 animate-pulse" />
                      {timetableAiGenerating ? 'IA en cours...' : 'Générer par IA'}
                    </button>
                    <button 
                      onClick={handleClearTimetable}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" /> Vider
                    </button>
                    <button 
                      onClick={() => openAddSlotModal()}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Ajouter Cours
                    </button>
                  </div>
                )}
              </div>

            {/* AI Generation Loader Alert */}
            {timetableAiGenerating && (
              <div className="p-8 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-3 animate-pulse">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
                <h4 className="text-sm font-bold text-indigo-900">Génération par l'IA NVIDIA en cours</h4>
                <p className="text-xs text-indigo-700 max-w-md mx-auto leading-relaxed">
                  L'intelligence artificielle analyse la liste des modules de la filière, vérifie la disponibilité des enseignants et attribue des salles libres sans conflit d'emploi du temps.
                </p>
              </div>
            )}

            {!timetableGroupId ? (
              <div className="p-16 text-center rounded-2xl bg-white border border-slate-200 border-dashed text-slate-400 italic">
                Sélectionnez une classe ci-dessus pour gérer son emploi du temps.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Weekly Grid Planner */}
                <div className="rounded-2xl bg-white border border-slate-200/85 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                          <th className="p-4 w-28 text-left">Jour</th>
                          <th className="p-4 border-l border-slate-100">08:30 - 10:30</th>
                          <th className="p-4 border-l border-slate-100">10:30 - 12:30</th>
                          <th className="p-4 border-l border-slate-100">14:00 - 16:00</th>
                          <th className="p-4 border-l border-slate-100">16:00 - 18:00</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(day => (
                          <tr key={day} className="hover:bg-slate-50/30 transition-colors">
                            <td className="p-4 font-bold text-slate-800 bg-slate-50/30">{day}</td>
                            {['08:30-10:30', '10:30-12:30', '14:00-16:00', '16:00-18:00'].map(timeRange => {
                              const [start, end] = timeRange.split('-');
                              const matchingSlot = timetableSlots.find(s => {
                                const sStart = s.start_time.substring(0, 5);
                                const sEnd = s.end_time.substring(0, 5);
                                return s.day === day && sStart === start && sEnd === end;
                              });

                              return (
                                <td key={timeRange} className="p-3 border-l border-slate-100 w-1/4 h-24 relative group">
                                  {matchingSlot ? (
                                    <div className="h-full p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between transition-all group-hover:shadow-sm">
                                      <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                          <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[9px] uppercase">
                                            {matchingSlot.module?.code || 'COURS'}
                                          </span>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => openEditSlotModal(matchingSlot)}
                                              className="p-1 rounded bg-white border border-slate-200 text-slate-550 hover:bg-slate-50 hover:text-indigo-650 shadow-sm"
                                            >
                                              <Edit className="h-3 w-3" />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteSlot(matchingSlot.id)}
                                              className="p-1 rounded bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 shadow-sm"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-[11px] truncate" title={matchingSlot.module?.name}>
                                          {matchingSlot.module?.name}
                                        </h4>
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                                        <span className="truncate flex items-center gap-1">
                                          <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                          {matchingSlot.room?.name || 'N/A'}
                                        </span>
                                        <span className="truncate font-medium text-slate-500">
                                          {matchingSlot.module?.professor?.name || 'Sans prof'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => openAddSlotModal(day, timeRange)}
                                      className="w-full h-full rounded-xl border border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      <span className="text-[10px] font-bold">Planifier</span>
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other slots (Custom schedule ranges) */}
                {timetableSlots.filter(s => {
                  const sStart = s.start_time.substring(0, 5);
                  const sEnd = s.end_time.substring(0, 5);
                  const standardTimes = ['08:30', '10:30', '14:00', '16:00', '12:30', '18:00'];
                  return !standardTimes.includes(sStart) || !standardTimes.includes(sEnd);
                }).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Créneaux horaires hors-gabarit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timetableSlots.filter(s => {
                        const sStart = s.start_time.substring(0, 5);
                        const sEnd = s.end_time.substring(0, 5);
                        const standardTimes = ['08:30', '10:30', '14:00', '16:00', '12:30', '18:00'];
                        return !standardTimes.includes(sStart) || !standardTimes.includes(sEnd);
                      }).map(s => (
                        <div key={s.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold text-[9px] uppercase">
                              {s.day} : {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                            </span>
                            <h4 className="font-bold text-slate-800 text-[11px] mt-1">{s.module?.name}</h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                              <MapPin className="h-3 w-3 text-slate-400" /> {s.room?.name} | Prof: {s.module?.professor?.name || 'Sans prof'}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => openEditSlotModal(s)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-550 shadow-sm"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSlot(s.id)}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 shadow-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users CRUD */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top controls */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Gestion des Utilisateurs</h2>
              <button onClick={openAddModal} className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" /> Ajouter Utilisateur
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Info Spécifique</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          {u.avatar_path ? (
                            <img 
                              src={`${api.defaults.baseURL.replace('/api', '')}${u.avatar_path}`} 
                              alt="Avatar" 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-indigo-600 bg-indigo-50">
                              {u.first_name?.[0] || u.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900">{u.name}</span>
                          <span className="block text-[10px] text-slate-400">CIN: {u.cin || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-550">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                          u.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          u.role === 'professor' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                          'bg-pink-50 border-pink-100 text-pink-600'
                        }`}>
                          {u.role === 'admin' ? 'Administrateur' : u.role === 'professor' ? 'Enseignant' : 'Étudiant'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-550">
                        {u.role === 'student' && (
                          <span>Groupe: <span className="font-bold text-slate-800">{u.student_profile?.group?.name || 'N/A'}</span></span>
                        )}
                        {u.role === 'professor' && (
                          <span>Spécialité: <span className="font-bold text-slate-800">{u.professor_profile?.speciality || 'N/A'}</span></span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-slate-400 italic">Accès global</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {u.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => openEditModal(u)}
                            className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 text-indigo-600 flex items-center justify-center transition-all shadow-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === user?.id}
                            className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-600 flex items-center justify-center transition-all shadow-sm disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Fields (Programs) CRUD */}
        {activeTab === 'fields' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter and Search Panel */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Side Filters */}
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                
                {/* Text Search */}
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={fieldSearch}
                    onChange={e => setFieldSearch(e.target.value)}
                    placeholder="Rechercher par nom ou code..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Cycle Filter */}
                <div className="relative">
                  <select
                    value={fieldCycleFilter}
                    onChange={e => setFieldCycleFilter(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-600 font-semibold"
                  >
                    <option value="">Tous les Cycles</option>
                    <option value="LICENCE">Licence</option>
                    <option value="MASTER">Master</option>
                    <option value="INGENIEUR">Ingénieur</option>
                    <option value="PREPA">Prépa</option>
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button 
                onClick={openAddFieldModal}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Ajouter Filière
              </button>
            </div>

            {/* Grid Layout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFields.map(f => {
                const cycleColors = 
                  f.cycle === 'LICENCE' ? 'bg-sky-50 border-sky-100 text-sky-600' :
                  f.cycle === 'MASTER' ? 'bg-violet-50 border-violet-100 text-violet-600' :
                  f.cycle === 'INGENIEUR' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                  'bg-amber-50 border-amber-100 text-amber-600';

                return (
                  <div 
                    key={f.id} 
                    className="p-5 rounded-2xl bg-white border border-slate-200/85 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Badge and Code Header */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                          Code: {f.code}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${cycleColors}`}>
                          {f.cycle}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-4 group-hover:text-indigo-600 transition-colors">
                        {f.name}
                      </h3>
                    </div>

                    {/* Metadata duration */}
                    <div className="border-t border-slate-100 pt-4 mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-slate-550 text-xs">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Durée d'études: <span className="font-bold text-slate-700">{f.duration} {f.duration > 1 ? 'ans' : 'an'}</span></span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={() => openEditFieldModal(f)}
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteField(f.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {filteredFields.length === 0 && (
                <div className="col-span-full py-12 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
                  <span className="block text-slate-400 text-xs italic">Aucune filière ne correspond à vos filtres.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3.5: Modules (Matières) CRUD */}
        {activeTab === 'modules' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter and Search Panel */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Filters */}
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                {/* Text Search */}
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={moduleSearch}
                    onChange={e => setModuleSearch(e.target.value)}
                    placeholder="Rechercher par nom ou code de matière..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Filière filter */}
                <div className="relative">
                  <select
                    value={moduleFieldFilter}
                    onChange={e => setModuleFieldFilter(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-650 font-semibold"
                  >
                    <option value="">Toutes les Filières</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.code}</option>
                    ))}
                  </select>
                </div>

                {/* Semester filter */}
                <div className="relative">
                  <select
                    value={moduleSemesterFilter}
                    onChange={e => setModuleSemesterFilter(e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-650 font-semibold"
                  >
                    <option value="">Tous Semestres</option>
                    <option value="S1">S1 (Automne)</option>
                    <option value="S2">S2 (Printemps)</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={moduleTypeFilter}
                    onChange={e => setModuleTypeFilter(e.target.value)}
                    className="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-650 font-semibold"
                  >
                    <option value="">Tous les Types</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PFA">Projet PFA</option>
                    <option value="PFE">Projet PFE</option>
                  </select>
                </div>
              </div>

              {/* Add Button */}
              <button 
                onClick={openAddModuleModal}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Ajouter Matière
              </button>
            </div>

            {/* Table Layout */}
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Code</th>
                    <th className="p-4">Matière / Cours</th>
                    <th className="p-4">Filière</th>
                    <th className="p-4">Semestre</th>
                    <th className="p-4">Crédits</th>
                    <th className="p-4">Coeff.</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Enseignant</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredModules.map(m => {
                    const semColors = 
                      m.semester === 'S1' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border-emerald-100';

                    const typeColors = 
                      m.type === 'PFA' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                      m.type === 'PFE' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      'bg-slate-50 text-slate-500 border-slate-200';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-extrabold text-slate-500 uppercase">{m.code}</td>
                        <td className="p-4 font-bold text-slate-900">{m.name}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {m.fields?.map(f => (
                              <span key={f.id} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9px] uppercase border border-slate-200">
                                {f.code}
                              </span>
                            ))}
                            {(!m.fields || m.fields.length === 0) && <span className="text-slate-400 italic">Aucune</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${semColors}`}>
                            {m.semester === 'S1' ? 'S1 (Automne)' : 'S2 (Printemps)'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-650">{m.credits} ECTS</td>
                        <td className="p-4 font-bold text-slate-800">x{m.coefficient}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${typeColors}`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {m.professor ? m.professor.name : <span className="text-slate-400 italic">Non assigné</span>}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => openEditModuleModal(m)}
                              className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 hover:border-indigo-300 text-indigo-600 flex items-center justify-center transition-all shadow-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteModule(m.id)}
                              className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-600 flex items-center justify-center transition-all shadow-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredModules.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                        Aucune matière enregistrée ne correspond à vos filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Groups (Classes/Cohorts) CRUD */}
        {activeTab === 'groups' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter and Search Panel */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Side Filters */}
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    placeholder="Rechercher par nom de classe (ex: GINFO3)..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Level filter */}
                <div className="relative">
                  <select
                    value={groupLevelFilter}
                    onChange={e => setGroupLevelFilter(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-650 font-semibold"
                  >
                    <option value="">Tous les Niveaux</option>
                    <option value="1">1ère Année (Bac+1)</option>
                    <option value="2">2ème Année (Bac+2)</option>
                    <option value="3">3ème Année (Bac+3)</option>
                    <option value="4">4ème Année (Bac+4)</option>
                    <option value="5">5ème Année (Bac+5)</option>
                  </select>
                </div>

                {/* Field filter */}
                <div className="relative">
                  <select
                    value={groupFieldFilter}
                    onChange={e => setGroupFieldFilter(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-650 font-semibold"
                  >
                    <option value="">Toutes les Filières</option>
                    {dbFields.map(f => (
                      <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={openSplitModal}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <GitBranch className="h-4 w-4 text-slate-500" /> Diviser Promotion
                </button>
                <button 
                  onClick={openAddGroupModal}
                  className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Ajouter Classe
                </button>
              </div>
            </div>

            {/* Classes Grid Layout (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(g => {
                // level badge colors
                const lvlColor = 
                  g.level === 1 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  g.level === 2 ? 'bg-cyan-50 border-cyan-100 text-cyan-700' :
                  g.level === 3 ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                  g.level === 4 ? 'bg-violet-50 border-violet-100 text-violet-700' :
                  'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700';

                const lvlLabel = 
                  g.level === 1 ? '1ère Année' :
                  g.level === 2 ? '2ème Année' :
                  g.level === 3 ? '3ème Année' :
                  g.level === 4 ? '4ème Année' :
                  '5ème Année';

                return (
                  <div key={g.id} className="relative rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group/card">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                            {g.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-semibold">{g.academic_year}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase ${lvlColor}`}>
                          {lvlLabel}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-4 space-y-2.5">
                        {/* Field */}
                        <div className="flex items-center gap-2 text-xs">
                          <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-700">{g.field ? g.field.code : 'N/A'}</span>
                            <span className="text-slate-400 text-[10px] ml-1.5 truncate">- {g.field ? g.field.name : ''}</span>
                          </div>
                        </div>

                        {/* Room */}
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div>
                            {g.room ? (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-700">{g.room.name}</span>
                                <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-500 font-medium border border-slate-200">Cap: {g.room.capacity}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Aucune salle</span>
                            )}
                          </div>
                        </div>

                        {/* Student Count */}
                        <div className="flex items-center gap-2 text-xs">
                          <UsersIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <span>{g.student_profiles_count ?? 0}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">étudiant(s) inscrit(s)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {/* View enrolled students */}
                      <button
                        onClick={() => handleViewGroupStudents(g)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 group/btn"
                      >
                        Voir la liste
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditGroupModal(g)}
                          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-650 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g.id)}
                          className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-350 text-rose-600 flex items-center justify-center transition-all shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredGroups.length === 0 && (
                <div className="col-span-full py-16 text-center rounded-2xl bg-white border border-slate-200 border-dashed text-slate-400 italic">
                  Aucune classe enregistrée ne correspond à vos filtres.
                </div>
              )}
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
                      <td className="p-4 text-slate-550">{doc.documentType}</td>
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

        {/* Tab: Salles & Réservations */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tab header buttons */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setRoomsSubTab('salles')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    roomsSubTab === 'salles'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <Building className="h-3.5 w-3.5 inline mr-1.5" />
                  Gestion des Salles
                </button>
                <button
                  onClick={() => {
                    setRoomsSubTab('reservations');
                    fetchReservations();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    roomsSubTab === 'reservations'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                  Réservations Professeurs
                </button>
              </div>

              {roomsSubTab === 'salles' && (
                <button
                  onClick={openAddRoomModal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/10"
                >
                  <Plus className="h-4 w-4" /> Ajouter une Salle
                </button>
              )}
            </div>

            {roomsSubTab === 'salles' ? (
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Nom de la Salle</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Capacité</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {rooms.map(room => (
                      <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-extrabold text-[11px]">
                            {room.name.substring(0, 3)}
                          </div>
                          {room.name}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            room.type === 'TP' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            room.type === 'TD' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                            'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {room.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-650 font-semibold">{room.capacity} places</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => openEditRoomModal(room)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-indigo-600 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
                {loadingReservations ? (
                  <div className="p-8 text-center text-xs text-slate-400">Chargement des réservations...</div>
                ) : dbReservations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">Aucune réservation en cours ou passée.</div>
                ) : (
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Date</th>
                        <th className="p-4">Heures</th>
                        <th className="p-4">Salle</th>
                        <th className="p-4">Enseignant</th>
                        <th className="p-4">Motif / Événement</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {dbReservations.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-900">{res.date}</td>
                          <td className="p-4 text-slate-600 font-medium">
                            {res.start_time.substring(0, 5)} - {res.end_time.substring(0, 5)}
                          </td>
                          <td className="p-4 font-bold text-slate-800">{res.room ? res.room.name : 'Inconnue'}</td>
                          <td className="p-4 text-slate-650">{res.professor ? res.professor.name : 'Administrateur'}</td>
                          <td className="p-4 text-slate-500 max-w-[200px] truncate" title={res.reason}>
                            {res.reason || 'Aucun motif'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              res.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                              res.status === 'rejected' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                              'bg-amber-50 border-amber-100 text-amber-600'
                            }`}>
                              {res.status === 'approved' ? 'Approuvée' : res.status === 'rejected' ? 'Rejetée' : 'En attente'}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            {res.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveReservation(res.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                                >
                                  <Check className="h-3 w-3" /> Accepter
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedResForRejection(res);
                                    setRejectionReason('');
                                    setIsRejectReservationModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                >
                                  <X className="h-3 w-3" /> Rejeter
                                </button>
                              </>
                            )}
                            {res.status !== 'pending' && (
                              <span className="text-slate-400 text-[10px] font-bold uppercase italic py-1 px-2">Traité</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Saisie des Notes */}
        {activeTab === 'grades_mgmt' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header / Selector Panel */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900">Saisie et Consultation des Notes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Saisissez les notes de CC1, CC2 et d'Examen par classe et matière</p>
              </div>
            </div>

            {/* Selectors grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sélectionner Filière</label>
                <select
                  value={gradesMgmtFieldId}
                  onChange={e => {
                    setGradesMgmtFieldId(e.target.value);
                    setGradesMgmtGroupId('');
                    setGradesMgmtModuleId('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase transition-all"
                >
                  <option value="">Toutes les Filières</option>
                  {dbFields.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sélectionner Classe</label>
                <select
                  value={gradesMgmtGroupId}
                  onChange={e => setGradesMgmtGroupId(e.target.value)}
                  disabled={!gradesMgmtFieldId}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionner Classe...</option>
                  {dbGroups
                    .filter(g => g.field_id === parseInt(gradesMgmtFieldId))
                    .map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sélectionner Matière</label>
                <select
                  value={gradesMgmtModuleId}
                  onChange={e => setGradesMgmtModuleId(e.target.value)}
                  disabled={!gradesMgmtFieldId}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Sélectionner Matière...</option>
                  {modules
                    .filter(m => m.fields && m.fields.some(f => f.id === parseInt(gradesMgmtFieldId)))
                    .map(m => (
                      <option key={m.id} value={m.id}>[{m.code}] {m.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Error and Success messages */}
            {gradesMgmtError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                ⚠️ {gradesMgmtError}
              </div>
            )}

            {gradesMgmtSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                🎉 {gradesMgmtSuccessMsg}
              </div>
            )}

            {/* Grid display */}
            {gradesMgmtLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                Chargement des étudiants et des notes...
              </div>
            ) : !gradesMgmtGroupId || !gradesMgmtModuleId ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                Veuillez sélectionner une Filière, une Classe et une Matière pour commencer la saisie.
              </div>
            ) : gradesMgmtStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                Aucun étudiant inscrit dans cette classe.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Étudiant</th>
                        <th className="p-4 w-32">Note CC1 (20%)</th>
                        <th className="p-4 w-32">Note CC2 (20%)</th>
                        <th className="p-4 w-32">Examen (60%)</th>
                        <th className="p-4 w-32">Note Finale</th>
                        <th className="p-4">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {gradesMgmtStudents.map(student => {
                        const finalGrade = Number(student.final_grade);
                        const isValidated = !isNaN(finalGrade) && finalGrade >= 10;
                        return (
                          <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{student.student_name}</td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={student.cc1}
                                onChange={e => handleGradeInputChange(student.student_id, 'cc1', e.target.value)}
                                className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 outline-none transition-all"
                                placeholder="--"
                              />
                            </td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={student.cc2}
                                onChange={e => handleGradeInputChange(student.student_id, 'cc2', e.target.value)}
                                className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 outline-none transition-all"
                                placeholder="--"
                              />
                            </td>
                            <td className="p-4">
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={student.exam}
                                onChange={e => handleGradeInputChange(student.student_id, 'exam', e.target.value)}
                                className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/5 outline-none transition-all"
                                placeholder="--"
                              />
                            </td>
                            <td className="p-4 font-extrabold text-slate-900 text-center w-32">
                              {isNaN(finalGrade) ? '0.00' : finalGrade.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                isValidated
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                  : 'bg-rose-50 border-rose-100 text-rose-600'
                              }`}>
                                {isValidated ? 'Validé' : 'Rattrapage'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end p-2">
                  <button
                    onClick={handleSaveGradesMgmt}
                    disabled={gradesMgmtSaving}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-650/20 flex items-center gap-2"
                  >
                    {gradesMgmtSaving ? (
                      <>Enregistrement en cours...</>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        Enregistrer la Grille
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Suivi des Absences */}
        {activeTab === 'absences_mgmt' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-900">Suivi des Absences & Justificatifs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Consultez le bilan des absences et traitez les demandes de justification médicale ou administrative</p>
              </div>
              <button
                onClick={fetchAbsences}
                disabled={loadingAbsences}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center gap-2"
              >
                🔄 Actualiser
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Partie A - Suivi Global */}
              <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Bilan Global des Absences</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Nombre total d'absences injustifiées par étudiant</p>
                  </div>
                  {/* Class Filter */}
                  <div className="w-full sm:w-48">
                    <select
                      value={absencesClassFilter}
                      onChange={e => setAbsencesClassFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-bold transition-all"
                    >
                      <option value="">Toutes les classes</option>
                      {dbGroups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Étudiant</th>
                        <th className="py-3 px-2">Classe</th>
                        <th className="py-3 px-2 text-center">Absences Injustifiées</th>
                        <th className="py-3 px-2">Bilan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {filteredStudentsForAbsences.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-slate-400">Aucun étudiant trouvé.</td>
                        </tr>
                      ) : (
                        filteredStudentsForAbsences.map(student => {
                          const unjustifiedCount = getUnjustifiedAbsencesCount(student.id);
                          const groupObj = dbGroups.find(g => g.id === student.student_profile?.group_id);
                          
                          let badgeColor = 'bg-slate-50 text-slate-600 border-slate-200';
                          if (unjustifiedCount >= 5) {
                            badgeColor = 'bg-rose-50 text-rose-600 border-rose-100';
                          } else if (unjustifiedCount >= 3) {
                            badgeColor = 'bg-amber-50 text-amber-600 border-amber-100';
                          } else if (unjustifiedCount > 0) {
                            badgeColor = 'bg-indigo-50 text-indigo-600 border-indigo-100';
                          }

                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-2 font-bold text-slate-900">{student.name}</td>
                              <td className="py-3 px-2 text-slate-500">{groupObj ? groupObj.name : 'N/A'}</td>
                              <td className="py-3 px-2 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badgeColor}`}>
                                  {unjustifiedCount}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                {unjustifiedCount >= 5 ? (
                                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">⚠️ Risque d'exclusion</span>
                                ) : unjustifiedCount >= 3 ? (
                                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Avertissement</span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">En règle</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Partie B - Justificatifs à traiter */}
              <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Justificatifs en Attente</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Demandes à valider ou rejeter</p>
                </div>

                <div className="space-y-4">
                  {pendingAbsences.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Aucun justificatif en attente de traitement.
                    </div>
                  ) : (
                    pendingAbsences.map(absence => (
                      <div key={absence.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3 shadow-sm hover:border-slate-200 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{absence.student?.name}</h4>
                            <p className="text-[10px] text-slate-400">{absence.date}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800">
                            En attente
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-1">
                          <p><strong>Matière :</strong> {absence.timetable?.module?.name || 'N/A'}</p>
                          <p className="italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                            "{absence.rejection_reason || 'Aucun motif renseigné'}"
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedJustificationForModal(absence);
                              setIsJustificationModalOpen(true);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-white text-slate-600 text-[10px] font-bold transition-all text-center"
                          >
                            👁️ Voir Pièce
                          </button>
                          
                          <button
                            onClick={() => handleApproveJustification(absence.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all"
                            title="Accepter la justification"
                          >
                            Valider
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAbsenceForRejection(absence);
                              setIsRejectAbsenceModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-all"
                            title="Rejeter la justification"
                          >
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Polymorphic Profile Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl transform transition-all my-8 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUser ? "Modifier le Profil Utilisateur" : "Créer un Nouvel Utilisateur"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Configurez les droits d'accès et le profil métier</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* General Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest border-b pb-2">Informations d'Authentification</h4>
                
                {/* Avatar and Active Status */}
                <div className="flex flex-col sm:flex-row gap-6 items-center p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                  <div className="relative group cursor-pointer">
                    <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-indigo-650 transition-colors" />
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <span className="block text-xs font-bold text-slate-800">Photo de profil / Avatar</span>
                    <span className="block text-[10px] text-slate-400">Glissez ou sélectionnez un fichier JPEG/PNG (max 2Mo).</span>
                  </div>
                  <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                    <label className="text-xs font-bold text-slate-600">Statut du Compte</label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isActive ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-[10px] font-bold text-slate-500 w-12 text-left">
                      {isActive ? "ACTIF" : "INACTIF"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rôle du Compte</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-semibold"
                    >
                      <option value="student">Étudiant</option>
                      <option value="professor">Enseignant</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Adresse E-mail *</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="exemple@upf.ac.ma"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Prénom *</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Ex: Ahmed"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom de famille *</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Ex: Bennani"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Code Secret / Mot de passe {editingUser ? "(Laisser vide pour ne pas modifier)" : "*"}
                    </label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required={!editingUser}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                      <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CIN (Carte d'Identité)</label>
                    <input 
                      type="text" 
                      value={cin}
                      onChange={e => setCin(e.target.value)}
                      placeholder="Ex: AE123456"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Téléphone GSM</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Ex: 0612345678"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                      <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Polymorphic Profile Tabs */}
              {role === 'student' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest border-b pb-2">Détails du Profil Étudiant</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">CNE / Code National *</label>
                      <input 
                        type="text" 
                        value={cne}
                        onChange={e => setCne(e.target.value)}
                        placeholder="Ex: N131234567"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Année d'Inscription *</label>
                      <input 
                        type="number" 
                        value={enrollmentYear}
                        onChange={e => setEnrollmentYear(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de Baccalauréat *</label>
                      <input 
                        type="text" 
                        value={bacType}
                        onChange={e => setBacType(e.target.value)}
                        placeholder="Ex: Sciences Physiques"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Note du Baccalauréat *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={bacGrade}
                        onChange={e => setBacGrade(e.target.value)}
                        placeholder="Ex: 15.5"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Niveau (Semestre / Année) *</label>
                      <select
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700"
                      >
                        <option value={1}>1ère année (Bac+1)</option>
                        <option value={2}>2ème année (Bac+2)</option>
                        <option value={3}>3ème année (Bac+3)</option>
                        <option value={4}>4ème année (Bac+4)</option>
                        <option value={5}>5ème année (Bac+5)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filière / Spécialisation</label>
                      <select
                        value={fieldId}
                        onChange={e => setFieldId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700"
                      >
                        <option value="">Sélectionner une Filière</option>
                        {dbFields.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Groupe de cours / Classe</label>
                      <select
                        value={groupId}
                        onChange={e => setGroupId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700"
                      >
                        <option value="">Sélectionner un Groupe</option>
                        {dbGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {role === 'professor' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest border-b pb-2">Détails du Profil Enseignant</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Spécialité Académique *</label>
                      <input 
                        type="text" 
                        value={speciality}
                        onChange={e => setSpeciality(e.target.value)}
                        placeholder="Ex: Analyse de données, Web"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Département d'Enseignement *</label>
                      <input 
                        type="text" 
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="Ex: Sciences de l'ingénieur"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de Contrat</label>
                      <select
                        value={employmentType}
                        onChange={e => setEmploymentType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700"
                      >
                        <option value="permanent">Titulaire / Permanent</option>
                        <option value="vacataire">Vacataire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bureau Assigné</label>
                      <input 
                        type="text" 
                        value={office}
                        onChange={e => setOffice(e.target.value)}
                        placeholder="Ex: Bureau A-14"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                      />
                    </div>

                    {/* Filières Associées */}
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filières Associées (Sélectionner pour filtrer les matières) *</label>
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                        {dbFields.map(f => {
                          const isChecked = profFieldIds.includes(f.id);
                          return (
                            <label key={f.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              isChecked 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-750 font-bold' 
                                : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                            }`}>
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setProfFieldIds(profFieldIds.filter(id => id !== f.id));
                                  } else {
                                    setProfFieldIds([...profFieldIds, f.id]);
                                  }
                                }}
                                className="h-3.5 w-3.5 text-indigo-650 border-slate-350 rounded focus:ring-indigo-500"
                              />
                              <span className="text-[11px] font-bold uppercase">{f.code}</span>
                              <span className="text-[9px] text-slate-400 truncate">- {f.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Matières Enseignées */}
                    <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Matières Enseignées</label>
                      {profFieldIds.length === 0 ? (
                        <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200 border-dashed text-xs text-slate-400">
                          Sélectionnez au moins une filière ci-dessus pour afficher ses matières.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto animate-fadeIn">
                          {modules
                            .filter(m => m.fields?.some(f => profFieldIds.includes(f.id)))
                            .map(m => {
                              const isChecked = profModuleIds.includes(m.id);
                              return (
                                <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                  isChecked 
                                    ? 'bg-emerald-50 border-emerald-250 text-emerald-700 font-bold' 
                                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                }`}>
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setProfModuleIds(profModuleIds.filter(id => id !== m.id));
                                      } else {
                                        setProfModuleIds([...profModuleIds, m.id]);
                                      }
                                    }}
                                    className="h-3.5 w-3.5 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500"
                                  />
                                  <span className="text-[11px] font-bold uppercase">{m.code}</span>
                                  <span className="text-[9px] text-slate-400 truncate">- {m.name}</span>
                                </label>
                              );
                            })}
                          {modules.filter(m => m.fields?.some(f => profFieldIds.includes(f.id))).length === 0 && (
                            <div className="col-span-full p-2 text-center text-xs text-slate-400 italic">
                              Aucune matière n'est configurée pour les filières sélectionnées.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field / Program Form Modal */}
      {isFieldModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '90vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingField ? "Modifier la Filière Académique" : "Créer une Nouvelle Filière"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Configurez le nom, code, cycle et durée</p>
              </div>
              <button 
                onClick={() => setIsFieldModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom de la filière *</label>
                <input 
                  type="text" 
                  value={fieldName}
                  onChange={e => setFieldName(e.target.value)}
                  placeholder="Ex: Génie Informatique"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Code Unique *</label>
                  <input 
                    type="text" 
                    value={fieldCode}
                    onChange={e => setFieldCode(e.target.value)}
                    placeholder="Ex: GINFO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cycle *</label>
                  <select
                    value={fieldCycle}
                    onChange={e => setFieldCycle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-semibold"
                  >
                    <option value="LICENCE">Licence (Bac+3)</option>
                    <option value="MASTER">Master (Bac+5)</option>
                    <option value="INGENIEUR">Cycle Ingénieur (Bac+5)</option>
                    <option value="PREPA">Classes Préparatoires (Bac+2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Durée (Années) *</label>
                <input 
                  type="number" 
                  min={1}
                  max={10}
                  value={fieldDuration}
                  onChange={e => setFieldDuration(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Modal Footer - fixed outside scrollable area */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100">
              {fieldError && (
                <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {fieldError}
                </div>
              )}
              <div className="flex gap-3 justify-end p-6">
                <button
                  type="button"
                  onClick={() => setIsFieldModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={fieldSaving}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  {fieldSaving ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module / Matière Form Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '90vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingModule ? "Modifier la Matière" : "Créer une Nouvelle Matière"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Définissez les caractéristiques académiques du cours</p>
              </div>
              <button 
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom de la matière *</label>
                <input 
                  type="text" 
                  value={moduleName}
                  onChange={e => setModuleName(e.target.value)}
                  placeholder="Ex: Technologie Web 2 (React & Laravel)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Code Matière *</label>
                  <input 
                    type="text" 
                    value={moduleCode}
                    onChange={e => setModuleCode(e.target.value)}
                    placeholder="Ex: TW2"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filières d'appartenance *</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                  {fields.map(f => {
                    const isChecked = moduleFieldIds.includes(f.id);
                    return (
                      <label key={f.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-750' 
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                      }`}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setModuleFieldIds(moduleFieldIds.filter(id => id !== f.id));
                            } else {
                              setModuleFieldIds([...moduleFieldIds, f.id]);
                            }
                          }}
                          className="h-3.5 w-3.5 text-indigo-650 border-slate-350 rounded focus:ring-indigo-500"
                        />
                        <span className="text-[11px] font-bold uppercase">{f.code}</span>
                        <span className="text-[9px] text-slate-400 truncate">- {f.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Crédits (ECTS) *</label>
                  <input 
                    type="number" 
                    min={1}
                    max={30}
                    value={moduleCredits}
                    onChange={e => setModuleCredits(parseInt(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Coefficient de note *</label>
                  <input 
                    type="number" 
                    step="0.25"
                    min={0.5}
                    max={10}
                    value={moduleCoefficient}
                    onChange={e => setModuleCoefficient(parseFloat(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Semestre *</label>
                  <select
                    value={moduleSemester}
                    onChange={e => setModuleSemester(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-semibold"
                  >
                    <option value="S1">Semestre 1 (Automne)</option>
                    <option value="S2">Semestre 2 (Printemps)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de Module *</label>
                  <select
                    value={moduleType}
                    onChange={e => setModuleType(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-700 font-semibold"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PFA">Projet PFA (Fin d'Année)</option>
                    <option value="PFE">Projet PFE (Fin d'Études)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Footer - fixed outside scrollable area */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100">
              {moduleError && (
                <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {moduleError}
                </div>
              )}
              <div className="flex gap-3 justify-end p-6">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveModule}
                  disabled={moduleSaving}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  {moduleSaving ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group / Classe Form Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '90vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingGroup ? "Modifier la Classe" : "Créer une Nouvelle Classe"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Définissez les paramètres de la classe/cohorte d'étudiants</p>
              </div>
              <button 
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom de la classe *</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Ex: GINFO3-A"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Niveau *</label>
                  <select 
                    value={groupLevel}
                    onChange={e => setGroupLevel(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                  >
                    <option value="1">1ère Année (Bac+1)</option>
                    <option value="2">2ème Année (Bac+2)</option>
                    <option value="3">3ème Année (Bac+3)</option>
                    <option value="4">4ème Année (Bac+4)</option>
                    <option value="5">5ème Année (Bac+5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Année Académique *</label>
                  <input 
                    type="text" 
                    value={groupAcademicYear}
                    onChange={e => setGroupAcademicYear(e.target.value)}
                    placeholder="Ex: 2025-2026"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filière / Programme d'études *</label>
                <select 
                  value={groupFieldId}
                  onChange={e => setGroupFieldId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="" disabled>Sélectionner une filière...</option>
                  {dbFields.map(f => (
                    <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Salle de classe par défaut (optionnel)</label>
                <select 
                  value={groupRoomId}
                  onChange={e => setGroupRoomId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="">Aucune (salle assignée dynamiquement)</option>
                  {rooms.map(r => {
                    const assignedGroup = groups.find(g => g.room?.id === r.id && g.id !== editingGroup?.id);
                    return (
                      <option 
                        key={r.id} 
                        value={r.id}
                        disabled={!!assignedGroup}
                      >
                        {r.name} ({r.type} - Cap: {r.capacity}) {assignedGroup ? `(Déjà occupée par ${assignedGroup.name})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100">
              {groupError && (
                <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {groupError}
                </div>
              )}
              <div className="flex gap-3 justify-end p-6">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveGroup}
                  disabled={groupSaving}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  {groupSaving ? 'Enregistrement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Students View Modal */}
      {isViewStudentsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '95vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-indigo-600" />
                  Étudiants Inscrits - {selectedGroupForStudents?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {loadingGroupStudents ? 'Chargement en cours...' : `${groupStudents.length} étudiant(s) au total`}
                </p>
              </div>
              <button 
                onClick={() => setIsViewStudentsModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body - Search and List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Search within student modal */}
              <div className="relative">
                <input 
                  type="text" 
                  value={studentModalSearch}
                  onChange={e => setStudentModalSearch(e.target.value)}
                  placeholder="Rechercher un étudiant par nom, e-mail ou CNE..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>

              {loadingGroupStudents ? (
                <div className="py-20 text-center text-slate-500 text-xs font-semibold animate-pulse">
                  Chargement de la liste des étudiants...
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/30">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-3">Étudiant</th>
                        <th className="p-3">CNE</th>
                        <th className="p-3">Niveau</th>
                        <th className="p-3">Inscrit en</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {groupStudents
                        .filter(s => {
                          const query = studentModalSearch.toLowerCase();
                          return (
                            s.name?.toLowerCase().includes(query) ||
                            s.email?.toLowerCase().includes(query) ||
                            s.cne?.toLowerCase().includes(query)
                          );
                        })
                        .map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{s.name}</span>
                                <span className="text-[10px] text-slate-400">{s.email}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-slate-700">{s.cne}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                Année {s.level}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-medium">{s.enrollment_year}</td>
                          </tr>
                        ))}

                      {groupStudents.filter(s => {
                        const query = studentModalSearch.toLowerCase();
                        return (
                          s.name?.toLowerCase().includes(query) ||
                          s.email?.toLowerCase().includes(query) ||
                          s.cne?.toLowerCase().includes(query)
                        );
                      }).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-slate-400 italic">
                            Aucun étudiant trouvé dans ce groupe.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewStudentsModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Promotion Modal */}
      {/* Timetable Slot Form Modal */}
      {isTimetableModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '90vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingSlot ? "Modifier le Cours" : "Planifier un Nouveau Cours"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Classe : {dbGroups.find(g => g.id === Number(timetableGroupId))?.name || 'N/A'}
                </p>
              </div>
              <button 
                onClick={() => setIsTimetableModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSlot} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Module selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Matière / Module *</label>
                <select
                  value={slotModuleId}
                  onChange={e => setSlotModuleId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="">Sélectionner un module...</option>
                  {modules.filter(m => 
                    m.fields?.some(f => f.id === dbGroups.find(g => g.id === Number(timetableGroupId))?.field_id)
                  ).map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} ({m.professor_name || 'Sans professeur'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Salle de classe *</label>
                <select
                  value={slotRoomId}
                  onChange={e => setSlotRoomId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="">Sélectionner une salle...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jour *</label>
                <select
                  value={slotDay}
                  onChange={e => setSlotDay(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Time selection presets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heure de Début *</label>
                  <input
                    type="text"
                    value={slotStartTime}
                    onChange={e => setSlotStartTime(e.target.value)}
                    placeholder="Ex: 08:30"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heure de Fin *</label>
                  <input
                    type="text"
                    value={slotEndTime}
                    onChange={e => setSlotEndTime(e.target.value)}
                    placeholder="Ex: 10:30"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Quick Time Presets helper */}
              <div className="pt-2">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Créneaux Standard</span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: '08:30 - 10:30', start: '08:30', end: '10:30' },
                    { label: '10:30 - 12:30', start: '10:30', end: '12:30' },
                    { label: '14:00 - 16:00', start: '14:00', end: '16:00' },
                    { label: '16:00 - 18:00', start: '16:00', end: '18:00' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setSlotStartTime(p.start);
                        setSlotEndTime(p.end);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        slotStartTime === p.start && slotEndTime === p.end
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex-shrink-0">
                {timetableError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    ⚠️ {timetableError}
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsTimetableModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={timetableSaving}
                    className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/10"
                  >
                    {timetableSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {isSplitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg transform transition-all overflow-hidden flex flex-col animate-scaleIn" style={{maxHeight: '90vh'}}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-indigo-600" />
                  Diviser une Promotion ("Split Promotion")
                </h3>
                <p className="text-xs text-slate-500 mt-1">Séparez automatiquement les étudiants d'une promotion en sous-groupes alphabétiques</p>
              </div>
              <button 
                onClick={() => setIsSplitModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filière concernée *</label>
                <select 
                  value={splitFieldId}
                  onChange={e => setSplitFieldId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                >
                  <option value="" disabled>Sélectionner une filière...</option>
                  {dbFields.map(f => (
                    <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Niveau *</label>
                  <select 
                    value={splitLevel}
                    onChange={e => setSplitLevel(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800 font-semibold"
                  >
                    <option value="1">1ère Année (Bac+1)</option>
                    <option value="2">2ème Année (Bac+2)</option>
                    <option value="3">3ème Année (Bac+3)</option>
                    <option value="4">4ème Année (Bac+4)</option>
                    <option value="5">5ème Année (Bac+5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Nombre de Groupes *</span>
                    <span className="font-extrabold text-indigo-600">{splitNumGroups}</span>
                  </label>
                  <input 
                    type="range" 
                    min="2"
                    max="6"
                    value={splitNumGroups}
                    onChange={e => setSplitNumGroups(Number(e.target.value))}
                    required
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Année Académique *</label>
                  <input 
                    type="text" 
                    value={splitAcademicYear}
                    onChange={e => setSplitAcademicYear(e.target.value)}
                    placeholder="Ex: 2025-2026"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Préfixe du Groupe (optionnel)</label>
                  <input 
                    type="text" 
                    value={splitPrefix}
                    onChange={e => setSplitPrefix(e.target.value)}
                    placeholder="Ex: GINFO3-"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-250 text-amber-800 text-xs space-y-1">
                <p className="font-bold">💡 Comment fonctionne la division ?</p>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Tous les étudiants inscrits dans la filière et le niveau spécifiés seront ordonnés par ordre alphabétique de leur nom. Ils seront ensuite répartis de manière équilibrée dans les nouveaux groupes (ex: Groupe A, Groupe B).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100">
              {splitError && (
                <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  ⚠️ {splitError}
                </div>
              )}
              <div className="flex gap-3 justify-end p-6">
                <button
                  type="button"
                  onClick={() => setIsSplitModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveSplit}
                  disabled={splitSaving}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-indigo-600/10"
                >
                  {splitSaving ? 'En cours...' : 'Confirmer la Division'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajouter / Modifier une Salle */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingRoom ? "Modifier la Salle" : "Ajouter une Salle"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Configurez les caractéristiques de la salle</p>
              </div>
              <button 
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRoom}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nom de la Salle *</label>
                  <input
                    type="text"
                    required
                    value={roomFormName}
                    onChange={e => setRoomFormName(e.target.value)}
                    placeholder="Ex: Amphi A, Salle 102..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs text-slate-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de Salle *</label>
                  <select
                    value={roomFormType}
                    onChange={e => setRoomFormType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs text-slate-700 transition-all font-semibold"
                  >
                    <option value="TD">Salle de TD</option>
                    <option value="TP">Salle de TP</option>
                    <option value="Amphithéâtre">Amphithéâtre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Capacité (places) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomFormCapacity}
                    onChange={e => setRoomFormCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs text-slate-700 transition-all"
                  />
                </div>

                {roomFormError && (
                  <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    ⚠️ {roomFormError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 justify-end p-6 border-t border-slate-100 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={roomFormSaving}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/10"
                >
                  {roomFormSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Motif de rejet de réservation */}
      {isRejectReservationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rejeter la Réservation</h3>
                <p className="text-xs text-slate-500 mt-1">Indiquez la raison du rejet pour l'enseignant</p>
              </div>
              <button 
                onClick={() => setIsRejectReservationModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectReservation}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Motif du Refus *</label>
                  <textarea
                    required
                    rows="3"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Ex: Conflit avec un cours de la filière GINFO, travaux planifiés..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs text-slate-700 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-slate-100 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => setIsRejectReservationModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/10"
                >
                  Rejeter la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Visualiser le Justificatif */}
      {isJustificationModalOpen && selectedJustificationForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-scaleUp">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Justificatif d'Absence</h3>
                <p className="text-xs text-slate-500 mt-1">Étudiant : {selectedJustificationForModal.student?.name}</p>
              </div>
              <button 
                onClick={() => {
                  setIsJustificationModalOpen(false);
                  setSelectedJustificationForModal(null);
                }}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[300px]">
              {selectedJustificationForModal.justification_path ? (
                selectedJustificationForModal.justification_path.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={getFileUrl(selectedJustificationForModal.justification_path)} 
                    className="w-full h-[400px] rounded-xl border border-slate-200"
                    title="Aperçu PDF"
                  />
                ) : (
                  <img 
                    src={getFileUrl(selectedJustificationForModal.justification_path)} 
                    alt="Justificatif Médical" 
                    className="max-w-full max-h-[400px] object-contain rounded-xl shadow-md border border-slate-200" 
                  />
                )
              ) : (
                <p className="text-xs text-slate-400">Aucun fichier à visualiser</p>
              )}
            </div>

            <div className="flex gap-3 justify-between p-6 border-t border-slate-100 bg-slate-50/20">
              <button
                onClick={() => window.open(getFileUrl(selectedJustificationForModal.justification_path), '_blank')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-indigo-600 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                🌐 Ouvrir dans un nouvel onglet
              </button>
              <button
                onClick={() => {
                  setIsJustificationModalOpen(false);
                  setSelectedJustificationForModal(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rejeter la Justification */}
      {isRejectAbsenceModalOpen && selectedAbsenceForRejection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rejeter la Justification</h3>
                <p className="text-xs text-slate-500 mt-1">Indiquez la raison du rejet pour l'étudiant</p>
              </div>
              <button 
                onClick={() => {
                  setIsRejectAbsenceModalOpen(false);
                  setSelectedAbsenceForRejection(null);
                }}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectJustification}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Motif du Refus *</label>
                  <textarea
                    required
                    rows="3"
                    value={rejectionReasonAbsence}
                    onChange={e => setRejectionReasonAbsence(e.target.value)}
                    placeholder="Ex: Document non lisible, date non concordante, signature absente..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs text-slate-700 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-slate-100 bg-slate-50/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectAbsenceModalOpen(false);
                    setSelectedAbsenceForRejection(null);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md shadow-rose-600/10"
                >
                  Rejeter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

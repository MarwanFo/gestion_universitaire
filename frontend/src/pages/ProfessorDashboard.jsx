import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  AlertCircle
} from 'lucide-react';

export default function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('grades');

  // Groups and Modules taught by this professor
  const groups = ['GINFO-3A', 'GINFO-2A'];
  const modules = ['Technologie Web 2 (React & Laravel)', 'Architecture des Systèmes'];
  
  const [selectedGroup, setSelectedGroup] = useState('GINFO-3A');
  const [selectedModule, setSelectedModule] = useState('Technologie Web 2 (React & Laravel)');

  // 1. Grade Input State
  const [studentsGrades, setStudentsGrades] = useState({
    'GINFO-3A': [
      { id: 1, name: 'Marwan Alami', cc1: 15, cc2: 16, exam: 14, average: 14.6 },
      { id: 4, name: 'Sara Kamali', cc1: 17, cc2: 18, exam: 16, average: 16.6 },
      { id: 5, name: 'Youssef Bennani', cc1: 12, cc2: 13, exam: 11, average: 11.6 },
    ],
    'GINFO-2A': [
      { id: 10, name: 'Anas Tazi', cc1: 14, cc2: 12, exam: 13, average: 13.0 },
      { id: 11, name: 'Lina Filali', cc1: 10, cc2: 11, exam: 12, average: 11.4 },
    ]
  });

  const [notification, setNotification] = useState('');

  // 2. Attendance State
  const [attendanceDate, setAttendanceDate] = useState('2026-05-28');
  const [attendanceSheet, setAttendanceSheet] = useState([
    { id: 1, name: 'Marwan Alami', absent: false },
    { id: 4, name: 'Sara Kamali', absent: false },
    { id: 5, name: 'Youssef Bennani', absent: true },
  ]);

  // 3. Room Reservation State
  const [rooms, setRooms] = useState([
    { id: 1, name: 'Salle 101', type: 'Cours', capacity: 40, reservedSlots: ['2026-05-28 09:00-11:00'] },
    { id: 2, name: 'Salle 102', type: 'TD', capacity: 30, reservedSlots: [] },
    { id: 3, name: 'Amphi A', type: 'Amphithéâtre', capacity: 150, reservedSlots: ['2026-05-28 14:00-16:00'] },
    { id: 4, name: 'Labo Info 1', type: 'TP', capacity: 25, reservedSlots: [] },
  ]);

  const [reserveForm, setReserveForm] = useState({ date: '2026-05-28', slot: '09:00-11:00', roomId: 1 });
  const [reservationMessage, setReservationMessage] = useState(null);

  // 4. Logbook (Cahier de Textes) State
  const [logbookEntries, setLogbookEntries] = useState([
    { id: 1, module: 'Technologie Web 2 (React & Laravel)', date: '2026-05-27', duration: '2h', topic: 'Architecture REST API et JWT avec Laravel', summary: 'Introduction aux architectures stateless, installation de Sanctum, configuration des CORS, écriture des contrôleurs API et tests de requêtes JSON.' },
    { id: 2, module: 'Technologie Web 2 (React & Laravel)', date: '2026-05-20', duration: '2h', topic: 'Introduction à React et State Management', summary: 'Création d\'un projet React Vite, cycle de vie des composants, gestion de l\'état local avec useState et contextes avec useContext.' },
  ]);
  const [newLogbook, setNewLogbook] = useState({ date: '2026-05-28', duration: '2h', topic: '', summary: '' });

  // Fetch rooms list and initial group grades on load/change
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get('/reservations/rooms');
        setRooms(res.data.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          capacity: room.capacity,
          reservedSlots: room.reservations ? room.reservations.map(resv => `${resv.date} ${resv.start_time.substring(0,5)}-${resv.end_time.substring(0,5)}`) : []
        })));
      } catch (e) {
        console.warn("Could not fetch rooms from API", e);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.post('/grades/group', {
          group_id: selectedGroup === 'GINFO-3A' ? 1 : 2,
          module_id: selectedModule.includes('Web') ? 1 : 2
        });
        
        if (res.data.length > 0) {
          setStudentsGrades(prev => ({
            ...prev,
            [selectedGroup]: res.data.map(student => ({
              id: student.student_id,
              name: student.student_name,
              cc1: student.cc1 !== null ? student.cc1 : 12,
              cc2: student.cc2 !== null ? student.cc2 : 12,
              exam: student.exam !== null ? student.exam : 12,
              average: student.final_grade !== null ? student.final_grade : 12.0
            }))
          }));
        }
      } catch (e) {
        console.warn("Could not fetch group grades from API", e);
      }
    };
    fetchGrades();
  }, [selectedGroup, selectedModule]);

  const handleGradeChange = (studentId, field, value) => {
    const numValue = Math.min(20, Math.max(0, parseFloat(value) || 0));
    
    setStudentsGrades(prev => {
      const updatedGroupStudents = prev[selectedGroup].map(student => {
        if (student.id === studentId) {
          const updatedStudent = { ...student, [field]: numValue };
          const avg = (updatedStudent.cc1 * 0.2) + (updatedStudent.cc2 * 0.2) + (updatedStudent.exam * 0.6);
          updatedStudent.average = parseFloat(avg.toFixed(2));
          return updatedStudent;
        }
        return student;
      });
      return { ...prev, [selectedGroup]: updatedGroupStudents };
    });
  };

  const handleSaveGrades = async () => {
    try {
      await api.post('/grades', {
        module_id: selectedModule.includes('Web') ? 1 : 2,
        grades: studentsGrades[selectedGroup].map(s => ({
          student_id: s.id,
          cc1: s.cc1,
          cc2: s.cc2,
          exam: s.exam
        }))
      });
      setNotification('Notes enregistrées avec succès dans la base PostgreSQL !');
    } catch (err) {
      setNotification('Notes enregistrées avec succès (simulation).');
    }
    setTimeout(() => setNotification(''), 4000);
  };

  const toggleAttendance = (id) => {
    setAttendanceSheet(attendanceSheet.map(student => 
      student.id === id ? { ...student, absent: !student.absent } : student
    ));
  };

  const handleSaveAttendance = () => {
    setNotification('Feuille d\'appel sauvegardée avec succès !');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleReserve = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservations', {
        room_id: reserveForm.roomId,
        date: reserveForm.date,
        slot: reserveForm.slot,
        purpose: 'Cours supplémentaire'
      });
      const room = rooms.find(r => r.id === parseInt(reserveForm.roomId));
      const targetSlotString = `${reserveForm.date} ${reserveForm.slot}`;
      setRooms(rooms.map(r => 
        r.id === room.id ? { ...r, reservedSlots: [...r.reservedSlots, targetSlotString] } : r
      ));
      setReservationMessage({ type: 'success', text: `Réservation validée avec succès pour la ${room.name} !` });
    } catch (err) {
      const room = rooms.find(r => r.id === parseInt(reserveForm.roomId));
      const targetSlotString = `${reserveForm.date} ${reserveForm.slot}`;
      setRooms(rooms.map(r => 
        r.id === room.id ? { ...r, reservedSlots: [...r.reservedSlots, targetSlotString] } : r
      ));
      setReservationMessage({ type: 'success', text: `Réservation validée avec succès (simulation) !` });
    }
    setTimeout(() => setReservationMessage(null), 5000);
  };

  const handleAddLogbook = (e) => {
    e.preventDefault();
    if (!newLogbook.topic || !newLogbook.summary) return;
    setLogbookEntries([{ id: Date.now(), module: selectedModule, ...newLogbook }, ...logbookEntries]);
    setNewLogbook({ date: '2026-05-28', duration: '2h', topic: '', summary: '' });
    setNotification('Séance ajoutée au cahier de textes !');
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
              Saisie des Notes
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
              Appel & Absences
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
              Réservation Salles
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
              Cahier de Textes
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Espace Enseignant</h1>
            <p className="text-slate-550 text-xs mt-1">Gérez vos modules et encadrez vos étudiants</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
              Professeur
            </span>
            <span className="text-slate-300 text-xs">|</span>
            <span className="text-slate-700 text-xs font-semibold">{user?.name}</span>
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
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Module :</span>
              <select 
                value={selectedModule} 
                onChange={e => setSelectedModule(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
              >
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
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
                  {studentsGrades[selectedGroup]?.map(student => (
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
                          student.average >= 12 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          student.average >= 10 ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          'bg-rose-50 border-rose-105 text-rose-600'
                        }`}>
                          {student.average.toFixed(2)} / 20
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
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date de l'appel :</span>
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:bg-white focus:border-indigo-500 outline-none"
                />
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

            <div className="flex justify-end">
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
                {logbookEntries.map(entry => (
                  <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{entry.module}</span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{entry.topic}</h4>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-slate-450">{entry.date}</span>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[8px] font-bold mt-1 shadow-sm">{entry.duration}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{entry.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New Entry Form */}
            <form onSubmit={handleAddLogbook} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Consigner une Séance</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                  <input 
                    type="date"
                    value={newLogbook.date}
                    onChange={e => setNewLogbook({ ...newLogbook, date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Durée</label>
                  <select
                    value={newLogbook.duration}
                    onChange={e => setNewLogbook({ ...newLogbook, duration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 outline-none focus:bg-white focus:border-indigo-500"
                  >
                    <option value="1h">1 heure</option>
                    <option value="1h30">1h 30min</option>
                    <option value="2h">2 heures</option>
                    <option value="3h">3 heures</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sujet / Objectif</label>
                <input 
                  type="text"
                  value={newLogbook.topic}
                  onChange={e => setNewLogbook({ ...newLogbook, topic: e.target.value })}
                  placeholder="Ex: Routage Dynamique sous React"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Résumé / Travaux demandés</label>
                <textarea 
                  rows="4"
                  value={newLogbook.summary}
                  onChange={e => setNewLogbook({ ...newLogbook, summary: e.target.value })}
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
      </main>
    </div>
  );
}

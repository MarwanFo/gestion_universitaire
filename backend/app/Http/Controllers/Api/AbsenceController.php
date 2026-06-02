<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AbsenceService;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    protected $absenceService;

    public function __construct(AbsenceService $absenceService)
    {
        $this->absenceService = $absenceService;
    }

    /**
     * Liste des absences de l'étudiant connecté.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'student') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $absences = $this->absenceService->getStudentAbsences($request->user()->id);
        return response()->json($absences);
    }

    /**
     * Justifier une absence.
     */
    public function justify(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ]);

        $absence = $this->absenceService->submitJustification($id, $request->reason, $request->file('file'));

        return response()->json([
            'message' => 'Justificatif soumis avec succès.',
            'absence' => $absence
        ]);
    }

    /**
     * Enregistrer la feuille d'appel (Enseignant).
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'timetable_id' => 'required|exists:timetables,id',
            'date' => 'required|date',
            'session_part' => 'nullable|integer|in:1,2',
            'sheet' => 'required|array', // student_id => true (absent) / false (present)
        ]);

        $this->absenceService->saveAttendanceSheet(
            $request->timetable_id,
            $request->date,
            $request->sheet,
            $request->input('session_part', 1)
        );

        return response()->json(['message' => 'Feuille d\'appel enregistrée avec succès.']);
    }

    /**
     * Admin: Obtenir la liste de toutes les absences.
     */
    public function getAdminAbsences(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $absences = \App\Models\Absence::with([
            'student', 
            'timetable.module', 
            'timetable.group'
        ])
        ->orderBy('date', 'desc')
        ->get();

        return response()->json($absences);
    }

    /**
     * Admin: Valider ou rejeter une justification.
     */
    public function justifyAbsence(Request $request, \App\Models\Absence $absence)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'status' => 'required|in:validated,rejected',
            'rejection_reason' => 'nullable|string',
        ]);

        $status = $request->status;

        if ($status === 'validated') {
            $absence->update([
                'justification_status' => 'validated',
                'status' => 'justified',
            ]);
        } else {
            $absence->update([
                'justification_status' => 'rejected',
                'rejection_reason' => $request->rejection_reason ?? 'Justificatif invalide ou non recevable.',
            ]);
        }

        return response()->json([
            'message' => 'Le statut de la justification a été mis à jour avec succès.',
            'absence' => $absence->load(['student', 'timetable.module', 'timetable.group'])
        ]);
    }

    /**
     * Récupérer les identifiants des étudiants marqués absents pour une séance et une date spécifiques.
     */
    public function getProfessorAbsences(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'timetable_id' => 'required|exists:timetables,id',
            'date' => 'required|date',
            'session_part' => 'nullable|integer|in:1,2',
        ]);

        $timetableId = $request->timetable_id;
        $date = $request->date;
        $sessionPart = $request->input('session_part', 1);

        // Vérification de sécurité : le créneau doit appartenir à ce professeur
        $timetable = \App\Models\Timetable::with('module')->findOrFail($timetableId);
        if (!$timetable->module || $timetable->module->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit. Ce créneau ne vous appartient pas.'], 403);
        }

        $absences = \App\Models\Absence::where('timetable_id', $timetableId)
            ->where('date', $date)
            ->where('session_part', $sessionPart)
            ->pluck('student_id')
            ->toArray();

        return response()->json($absences);
    }
}

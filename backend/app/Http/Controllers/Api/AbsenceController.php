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
            'sheet' => 'required|array', // student_id => true (absent) / false (present)
        ]);

        $this->absenceService->saveAttendanceSheet(
            $request->timetable_id,
            $request->date,
            $request->sheet
        );

        return response()->json(['message' => 'Feuille d\'appel enregistrée avec succès.']);
    }
}

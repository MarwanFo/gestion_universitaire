<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GradeService;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    protected $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    /**
     * Obtenir les notes de l'étudiant connecté.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'student') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $grades = $this->gradeService->getStudentGrades($request->user()->id);
        return response()->json($grades);
    }

    /**
     * Obtenir les notes d'un groupe pour un module (Enseignant).
     */
    public function showGroupGrades(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'module_id' => 'required|exists:modules,id',
        ]);

        $grades = $this->gradeService->getGroupGrades($request->group_id, $request->module_id);
        return response()->json($grades);
    }

    /**
     * Enregistrer ou mettre à jour les notes des étudiants.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.cc1' => 'required|numeric|min:0|max:20',
            'grades.*.cc2' => 'required|numeric|min:0|max:20',
            'grades.*.exam' => 'required|numeric|min:0|max:20',
        ]);

        foreach ($request->grades as $item) {
            $this->gradeService->saveGrade(
                $item['student_id'],
                $request->module_id,
                $item['cc1'],
                $item['cc2'],
                $item['exam']
            );
        }

        return response()->json(['message' => 'Notes enregistrées avec succès.']);
    }

    /**
     * Admin: Obtenir les notes d'un groupe pour un module.
     */
    public function getAdminGrades(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'module_id' => 'required|exists:modules,id',
        ]);

        $grades = $this->gradeService->getGroupGrades($request->group_id, $request->module_id);
        return response()->json($grades);
    }

    /**
     * Admin: Saisie groupée (bulk update) des notes.
     */
    public function bulkUpdateGrades(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.cc1' => 'nullable|numeric|min:0|max:20',
            'grades.*.cc2' => 'nullable|numeric|min:0|max:20',
            'grades.*.exam' => 'nullable|numeric|min:0|max:20',
        ]);

        foreach ($request->grades as $item) {
            $this->gradeService->saveGrade(
                $item['student_id'],
                $request->module_id,
                $item['cc1'] ?? 0,
                $item['cc2'] ?? 0,
                $item['exam'] ?? 0
            );
        }

        return response()->json(['message' => 'Notes administratives enregistrées avec succès.']);
    }
}

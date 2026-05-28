<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\Module;
use App\Models\User;

class GradeService
{
    /**
     * Calcule la moyenne finale en fonction des coefficients.
     * CC1 (20%) + CC2 (20%) + Exam (60%).
     */
    public function calculateFinalGrade(float $cc1, float $cc2, float $exam): float
    {
        return ($cc1 * 0.2) + ($cc2 * 0.2) + ($exam * 0.6);
    }

    /**
     * Enregistre ou met à jour les notes d'un étudiant.
     */
    public function saveGrade(int $studentId, int $moduleId, float $cc1, float $cc2, float $exam): Grade
    {
        $finalGrade = $this->calculateFinalGrade($cc1, $cc2, $exam);

        return Grade::updateOrCreate(
            [
                'student_id' => $studentId,
                'module_id' => $moduleId,
            ],
            [
                'cc1' => $cc1,
                'cc2' => $cc2,
                'exam' => $exam,
                'final_grade' => $finalGrade,
            ]
        );
    }

    /**
     * Récupère les notes d'un étudiant.
     */
    public function getStudentGrades(int $studentId)
    {
        return Grade::where('student_id', $studentId)
            ->with('module')
            ->get();
    }

    /**
     * Récupère les notes des étudiants d'un groupe pour un module spécifique.
     */
    public function getGroupGrades(int $groupId, int $moduleId)
    {
        $students = User::where('group_id', $groupId)->where('role', 'student')->get();
        
        $grades = Grade::where('module_id', $moduleId)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        return $students->map(function ($student) use ($grades, $moduleId) {
            $grade = $grades->get($student->id);
            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'cc1' => $grade ? $grade->cc1 : null,
                'cc2' => $grade ? $grade->cc2 : null,
                'exam' => $grade ? $grade->exam : null,
                'final_grade' => $grade ? $grade->final_grade : null,
            ];
        });
    }
}

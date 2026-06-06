<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Timetable;
use App\Models\User;

class AbsenceService
{
    /**
     * Récupère les absences d'un étudiant.
     */
    public function getStudentAbsences(int $studentId)
    {
        return Absence::where('student_id', $studentId)
            ->with('timetable.module')
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Soumet une justification d'absence.
     */
    public function submitJustification(int $absenceId, string $reason, $file = null): Absence
    {
        $absence = Absence::findOrFail($absenceId);
        
        $path = null;
        if ($file) {
            $path = \App\Helpers\UploadHelper::upload($file, 'justifications');
        }

        $absence->update([
            'justification_status' => 'pending',
            'justification_path' => $path,
            'rejection_reason' => $reason, // stocké temporairement ou dans un champ dédié
        ]);

        return $absence;
    }

    /**
     * Enregistre la feuille d'appel pour une séance d'un groupe à une date donnée.
     */
    public function saveAttendanceSheet(int $timetableId, string $date, array $sheet, int $sessionPart = 1): void
    {
        foreach ($sheet as $studentId => $isAbsent) {
            if ($isAbsent) {
                Absence::updateOrCreate(
                    [
                        'student_id' => $studentId,
                        'timetable_id' => $timetableId,
                        'date' => $date,
                        'session_part' => $sessionPart,
                    ],
                    [
                        'status' => 'absent',
                        'justification_status' => 'none',
                    ]
                );
            } else {
                Absence::where([
                    'student_id' => $studentId,
                    'timetable_id' => $timetableId,
                    'date' => $date,
                    'session_part' => $sessionPart,
                ])->delete();
            }
        }
    }
}

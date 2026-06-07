<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Field;
use App\Models\Grade;
use App\Models\Absence;
use App\Models\Room;
use App\Models\Reservation;
use App\Models\Module;
use App\Models\Group;

class StatsController extends Controller
{
    /**
     * Admin statistics.
     */
    public function getAdminStats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // 1. Taux d'absentéisme par filière (Total d'absences par filière)
        $absencesByFiliere = DB::table('fields')
            ->leftJoin('student_profiles', 'fields.id', '=', 'student_profiles.field_id')
            ->leftJoin('absences', 'student_profiles.user_id', '=', 'absences.student_id')
            ->select('fields.name', DB::raw('COUNT(absences.id) as total_absences'))
            ->groupBy('fields.id', 'fields.name')
            ->get();

        // 2. Moyenne générale par filière
        $averageGradeByFiliere = DB::table('fields')
            ->leftJoin('student_profiles', 'fields.id', '=', 'student_profiles.field_id')
            ->leftJoin('grades', 'student_profiles.user_id', '=', 'grades.student_id')
            ->select('fields.name', DB::raw('ROUND(CAST(AVG(grades.final_grade) AS numeric), 2) as average_grade'))
            ->groupBy('fields.id', 'fields.name')
            ->get();

        // 3. Taux d'occupation des salles (nombre de réservations actives par salle)
        $roomOccupancy = DB::table('rooms')
            ->leftJoin('reservations', 'rooms.id', '=', 'reservations.room_id')
            ->select('rooms.name', DB::raw('COUNT(reservations.id) as total_reservations'))
            ->groupBy('rooms.id', 'rooms.name')
            ->get();

        return response()->json([
            'absencesByFiliere' => $absencesByFiliere,
            'averageGradeByFiliere' => $averageGradeByFiliere,
            'roomOccupancy' => $roomOccupancy,
        ]);
    }

    /**
     * Professor statistics.
     */
    public function getProfessorStats(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $professorId = $request->user()->id;

        // 1. Moyenne générale des modules enseignés par ce professeur
        $averageGradeByModule = DB::table('modules')
            ->where('professor_id', $professorId)
            ->leftJoin('grades', 'modules.id', '=', 'grades.module_id')
            ->select('modules.name', DB::raw('ROUND(CAST(AVG(grades.final_grade) AS numeric), 2) as average_grade'))
            ->groupBy('modules.id', 'modules.name')
            ->get();

        // 2. Répartition des notes par palier (0-5, 5-10, 10-15, 15-20) pour ses modules
        $rawGrades = DB::table('grades')
            ->join('modules', 'grades.module_id', '=', 'modules.id')
            ->where('modules.professor_id', $professorId)
            ->pluck('grades.final_grade');

        $bracket1 = 0; $bracket2 = 0; $bracket3 = 0; $bracket4 = 0;
        foreach ($rawGrades as $grade) {
            if ($grade < 5) $bracket1++;
            elseif ($grade < 10) $bracket2++;
            elseif ($grade < 15) $bracket3++;
            else $bracket4++;
        }

        $gradeDistribution = [
            ['bracket' => '0-5', 'count' => $bracket1],
            ['bracket' => '5-10', 'count' => $bracket2],
            ['bracket' => '10-15', 'count' => $bracket3],
            ['bracket' => '15-20', 'count' => $bracket4],
        ];

        // 3. Absences par groupe dans ses modules
        // Nous cherchons les absences survenues lors des séances (timetables) du professeur
        $absencesByGroup = DB::table('timetables')
            ->join('modules', 'timetables.module_id', '=', 'modules.id')
            ->where('modules.professor_id', $professorId)
            ->join('groups', 'timetables.group_id', '=', 'groups.id')
            ->leftJoin('absences', 'timetables.id', '=', 'absences.timetable_id')
            ->select('groups.name', DB::raw('COUNT(absences.id) as total_absences'))
            ->groupBy('groups.id', 'groups.name')
            ->get();

        return response()->json([
            'averageGradeByModule' => $averageGradeByModule,
            'gradeDistribution' => $gradeDistribution,
            'absencesByGroup' => $absencesByGroup,
        ]);
    }

    /**
     * Student statistics.
     */
    public function getStudentStats(Request $request)
    {
        if ($request->user()->role !== 'student') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $studentId = $request->user()->id;
        $studentProfile = $request->user()->studentProfile;
        $groupId = $studentProfile ? $studentProfile->group_id : null;

        // 1. Comparaison de ses notes avec la moyenne générale de son groupe par module
        // Récupérer les notes de l'étudiant
        $studentGrades = DB::table('grades')
            ->where('student_id', $studentId)
            ->join('modules', 'grades.module_id', '=', 'modules.id')
            ->select('modules.id as module_id', 'modules.name', 'grades.final_grade as student_grade')
            ->get();

        // Récupérer les moyennes de la classe (groupe de l'étudiant) pour ces mêmes modules
        $comparisonGrades = [];
        if ($groupId) {
            foreach ($studentGrades as $sg) {
                $classAvg = DB::table('grades')
                    ->join('student_profiles', 'grades.student_id', '=', 'student_profiles.user_id')
                    ->where('student_profiles.group_id', $groupId)
                    ->where('grades.module_id', $sg->module_id)
                    ->avg('grades.final_grade');

                $comparisonGrades[] = [
                    'module' => $sg->name,
                    'student_grade' => floatval($sg->student_grade),
                    'class_average' => $classAvg ? round(floatval($classAvg), 2) : 0,
                ];
            }
        }

        // 2. Absences par matière (module)
        $absencesByModule = DB::table('absences')
            ->where('absences.student_id', $studentId)
            ->join('timetables', 'absences.timetable_id', '=', 'timetables.id')
            ->join('modules', 'timetables.module_id', '=', 'modules.id')
            ->select('modules.name', DB::raw('COUNT(absences.id) as total_absences'))
            ->groupBy('modules.id', 'modules.name')
            ->get();

        // 3. Répartition des absences par statut (Justifiées, Non justifiées, En attente)
        $justifiedCount = DB::table('absences')
            ->where('student_id', $studentId)
            ->where('status', 'Justifiée')
            ->count();

        $unjustifiedCount = DB::table('absences')
            ->where('student_id', $studentId)
            ->where('status', 'Non justifiée')
            ->count();

        $pendingCount = DB::table('absences')
            ->where('student_id', $studentId)
            ->where('status', 'En attente')
            ->count();

        $absencesStatus = [
            ['name' => 'Justifiées', 'value' => $justifiedCount],
            ['name' => 'Non justifiées', 'value' => $unjustifiedCount],
            ['name' => 'En attente', 'value' => $pendingCount],
        ];

        return response()->json([
            'comparisonGrades' => $comparisonGrades,
            'absencesByModule' => $absencesByModule,
            'absencesStatus' => $absencesStatus,
        ]);
    }
}

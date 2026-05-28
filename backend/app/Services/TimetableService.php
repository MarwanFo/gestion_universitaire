<?php

namespace App\Services;

use App\Models\Timetable;

class TimetableService
{
    /**
     * Vérifie s'il y a des conflits de planification pour un créneau horaire donné.
     *
     * @param string $day Jour de la semaine.
     * @param string $startTime Heure de début (format HH:MM:SS ou HH:MM).
     * @param string $endTime Heure de fin (format HH:MM:SS ou HH:MM).
     * @param int $roomId ID de la salle.
     * @param int $groupId ID du groupe d'étudiants.
     * @param int $professorId ID de l'enseignant.
     * @param int|null $ignoreId ID de l'emploi du temps à ignorer (pour modification).
     * @return array Contient 'has_conflict' (bool) et 'message' (string|null).
     */
    public function checkConflict(
        string $day,
        string $startTime,
        string $endTime,
        int $roomId,
        int $groupId,
        int $professorId,
        ?int $ignoreId = null
    ): array {
        // Validation des chevauchements de temps : (startA < endB) AND (endA > startB)
        
        // 1. Conflit de salle
        $roomConflict = Timetable::where('day', $day)
            ->where('room_id', $roomId)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            });
        if ($ignoreId) {
            $roomConflict->where('id', '!=', $ignoreId);
        }
        if ($roomConflict->exists()) {
            return [
                'has_conflict' => true,
                'message' => "La salle est déjà réservée sur ce créneau horaire."
            ];
        }

        // 2. Conflit de groupe
        $groupConflict = Timetable::where('day', $day)
            ->where('group_id', $groupId)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            });
        if ($ignoreId) {
            $groupConflict->where('id', '!=', $ignoreId);
        }
        if ($groupConflict->exists()) {
            return [
                'has_conflict' => true,
                'message' => "Ce groupe a déjà un cours prévu sur ce créneau horaire."
            ];
        }

        // 3. Conflit d'enseignant (à travers ses modules)
        $profConflict = Timetable::where('day', $day)
            ->whereHas('module', function ($query) use ($professorId) {
                $query->where('professor_id', $professorId);
            })
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where('start_time', '<', $endTime)
                      ->where('end_time', '>', $startTime);
            });
        if ($ignoreId) {
            $profConflict->where('id', '!=', $ignoreId);
        }
        if ($profConflict->exists()) {
            return [
                'has_conflict' => true,
                'message' => "Cet enseignant a déjà un cours prévu sur ce créneau horaire."
            ];
        }

        return [
            'has_conflict' => false,
            'message' => null
        ];
    }
}

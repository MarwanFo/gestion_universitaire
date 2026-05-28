<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;

class ReservationService
{
    /**
     * Vérifie si une salle est libre sur un créneau donné.
     */
    public function isRoomAvailable(int $roomId, string $date, string $startTime, string $endTime): bool
    {
        return !Reservation::where('room_id', $roomId)
            ->where('date', $date)
            ->where('status', 'approved')
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->exists();
    }

    /**
     * Crée une réservation pour un professeur.
     */
    public function makeReservation(int $professorId, int $roomId, string $date, string $startTime, string $endTime, ?string $purpose = null)
    {
        if (!$this->isRoomAvailable($roomId, $date, $startTime, $endTime)) {
            throw new \Exception("La salle est déjà occupée ou réservée sur ce créneau horaire.");
        }

        return Reservation::create([
            'professor_id' => $professorId,
            'room_id' => $roomId,
            'date' => $date,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'purpose' => $purpose,
            'status' => 'approved', // Auto-approuvé pour les profs UPF ou modifiable par l'admin
        ]);
    }

    /**
     * Récupère toutes les réservations.
     */
    public function getAllReservations()
    {
        return Reservation::with(['room', 'professor'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();
    }
}

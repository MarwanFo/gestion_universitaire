<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReservationService;
use App\Models\Room;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    protected $reservationService;

    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    /**
     * Liste des salles avec leurs réservations.
     */
    public function roomsList(Request $request)
    {
        $rooms = Room::with('reservations.professor')->get();
        return response()->json($rooms);
    }

    /**
     * Faire une réservation.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'professor') {
            return response()->json(['message' => 'Accès interdit. Seuls les enseignants peuvent réserver.'], 403);
        }

        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'date' => 'required|date|after_or_equal:today',
            'slot' => 'required|string', // ex: "09:00-11:00"
            'purpose' => 'nullable|string',
        ]);

        // Découper le créneau
        $parts = explode('-', $request->slot);
        if (count($parts) !== 2) {
            return response()->json(['message' => 'Créneau horaire invalide.'], 400);
        }

        $startTime = trim($parts[0]) . ':00';
        $endTime = trim($parts[1]) . ':00';

        try {
            $reservation = $this->reservationService->makeReservation(
                $request->user()->id,
                $request->room_id,
                $request->date,
                $startTime,
                $endTime,
                $request->purpose
            );

            return response()->json([
                'message' => 'Réservation validée avec succès.',
                'reservation' => $reservation->load('room')
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

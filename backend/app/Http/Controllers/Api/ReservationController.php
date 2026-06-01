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

    /**
     * Admin view: get all reservations.
     */
    public function adminIndex(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $reservations = \App\Models\Reservation::with(['room', 'professor'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json($reservations);
    }

    /**
     * Admin: direct room reservation.
     */
    public function adminStore(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'date' => 'required|date',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $reservation = \App\Models\Reservation::create([
            'room_id' => $validated['room_id'],
            'professor_id' => $request->user()->id, // admin acts as reserving person
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'reason' => $validated['reason'] ?? 'Réservation administrative',
            'status' => 'approved'
        ]);

        return response()->json([
            'message' => 'Salle réservée avec succès par l\'administration.',
            'reservation' => $reservation->load('room')
        ], 201);
    }

    /**
     * Admin: update reservation status/details.
     */
    public function adminUpdate(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $reservation = \App\Models\Reservation::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
            'reason' => 'nullable|string',
            'date' => 'nullable|date',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
        ]);

        $reservation->update($validated);

        return response()->json([
            'message' => 'Réservation mise à jour avec succès.',
            'reservation' => $reservation->load(['room', 'professor'])
        ]);
    }

    /**
     * Admin: cancel/delete a reservation.
     */
    public function adminDestroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $reservation = \App\Models\Reservation::findOrFail($id);
        $reservation->delete();

        return response()->json([
            'message' => 'Réservation supprimée/annulée avec succès.'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms ordered by name.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $rooms = Room::orderBy('name')->get();
        return response()->json($rooms);
    }

    /**
     * Store a newly created room.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rooms,name',
            'type' => ['required', 'string', Rule::in(['TD', 'TP', 'Amphithéâtre', 'Amphi'])],
            'capacity' => 'required|integer|min:1',
        ]);

        $room = Room::create($validated);

        return response()->json([
            'message' => 'Salle créée avec succès.',
            'room' => $room
        ], 201);
    }

    /**
     * Update the specified room.
     */
    public function update(Request $request, Room $room)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('rooms', 'name')->ignore($room->id)],
            'type' => ['required', 'string', Rule::in(['TD', 'TP', 'Amphithéâtre', 'Amphi'])],
            'capacity' => 'required|integer|min:1',
        ]);

        $room->update($validated);

        return response()->json([
            'message' => 'Salle mise à jour avec succès.',
            'room' => $room
        ]);
    }

    /**
     * Remove the specified room safely.
     */
    public function destroy(Request $request, Room $room)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        // Check if the room has active timetable slots or reservations
        if ($room->timetables()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette salle car elle est liée à des cours dans l\'emploi du temps.'
            ], 400);
        }

        if ($room->reservations()->where('status', 'approved')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer cette salle car elle a des réservations actives.'
            ], 400);
        }

        $room->delete();

        return response()->json([
            'message' => 'Salle supprimée avec succès.'
        ]);
    }
}

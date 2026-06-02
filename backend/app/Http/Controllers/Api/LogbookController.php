<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Logbook;
use Illuminate\Http\Request;

class LogbookController extends Controller
{
    /**
     * Obtenir la liste de toutes les séances du cahier de textes.
     */
    public function index(Request $request)
    {
        $query = Logbook::with([
            'timetable.module.professor',
            'timetable.group'
        ]);

        // Filtrage par professor_id
        if ($request->filled('professor_id')) {
            $query->whereHas('timetable.module', function ($q) use ($request) {
                $q->where('professor_id', $request->professor_id);
            });
        }

        // Filtrage par group_id (classe)
        if ($request->filled('group_id')) {
            $query->whereHas('timetable', function ($q) use ($request) {
                $q->where('group_id', $request->group_id);
            });
        }

        // Filtrage par module_id (matière)
        if ($request->filled('module_id')) {
            $query->whereHas('timetable', function ($q) use ($request) {
                $q->where('module_id', $request->module_id);
            });
        }

        $logbooks = $query->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json($logbooks);
    }

    /**
     * Enregistrer une nouvelle séance dans le cahier de textes.
     */
    public function store(Request $request)
    {
        $request->validate([
            'timetable_id' => 'required|exists:timetables,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'objective' => 'required|string|min:10',
            'nature' => 'required|string|in:Cours,TD,TP',
        ]);

        $timetable = \App\Models\Timetable::with('module')->findOrFail($request->timetable_id);

        if (!$timetable->module || $timetable->module->professor_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès interdit. Ce créneau ne vous appartient pas.'], 403);
        }

        $logbook = Logbook::create([
            'timetable_id' => $request->timetable_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'objective' => $request->objective,
            'nature' => $request->nature,
        ]);

        $logbook->load([
            'timetable.module.professor',
            'timetable.group'
        ]);

        return response()->json($logbook, 201);
    }
}

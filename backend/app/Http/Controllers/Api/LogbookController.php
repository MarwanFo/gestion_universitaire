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
}

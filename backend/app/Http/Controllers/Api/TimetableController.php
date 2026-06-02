<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Timetable;
use App\Models\Group;
use App\Models\Module;
use App\Models\Room;
use App\Services\NvidiaLlmService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimetableController extends Controller
{
    /**
     * Get timetable based on user role
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Timetable::with(['module', 'room', 'group.field']);
        
        if ($user->role === 'student') {
            if ($user->group_id) {
                $query->where('group_id', $user->group_id)->where('is_published', true);
            } else {
                return response()->json([]);
            }
        } elseif ($user->role === 'professor') {
            $query->whereHas('module', function ($q) use ($user) {
                $q->where('professor_id', $user->id);
            })->where('is_published', true);
        }
        
        $timetables = $query->orderByRaw("CASE day 
                WHEN 'Lundi' THEN 1 
                WHEN 'Mardi' THEN 2 
                WHEN 'Mercredi' THEN 3 
                WHEN 'Jeudi' THEN 4 
                WHEN 'Vendredi' THEN 5 
                WHEN 'Samedi' THEN 6 
                ELSE 7 END")
            ->orderBy('start_time')
            ->get();
            
        // Group by day for frontend convenience
        $grouped = [];
        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        
        foreach ($days as $day) {
            $grouped[] = [
                'day' => $day,
                'slots' => $timetables->where('day', $day)->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'time' => substr($t->start_time, 0, 5) . ' - ' . substr($t->end_time, 0, 5),
                        'start_time' => substr($t->start_time, 0, 5),
                        'end_time' => substr($t->end_time, 0, 5),
                        'module_id' => $t->module_id,
                        'module' => $t->module ? $t->module->name : 'N/A',
                        'module_code' => $t->module ? $t->module->code : '',
                        'room_id' => $t->room_id,
                        'room' => $t->room ? $t->room->name : 'N/A',
                        'group_id' => $t->group_id,
                        'group' => $t->group ? $t->group->name : 'N/A',
                        'group_details' => $t->group ? [
                            'id' => $t->group->id,
                            'name' => $t->group->name,
                            'field' => $t->group->field ? [
                                'id' => $t->group->field->id,
                                'name' => $t->group->field->name,
                            ] : null
                        ] : null,
                    ];
                })->values()->toArray()
            ];
        }

        return response()->json($grouped);
    }

    /**
     * Get all timetable slots for administration
     */
    public function adminIndex(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $query = Timetable::with(['module.professor', 'room', 'group']);

        if ($request->filled('group_id')) {
            $query->where('group_id', $request->group_id);
        }
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        if ($request->filled('professor_id')) {
            $query->whereHas('module', function ($q) use ($request) {
                $q->where('professor_id', $request->professor_id);
            });
        }

        $slots = $query->orderByRaw("CASE day 
                WHEN 'Lundi' THEN 1 
                WHEN 'Mardi' THEN 2 
                WHEN 'Mercredi' THEN 3 
                WHEN 'Jeudi' THEN 4 
                WHEN 'Vendredi' THEN 5 
                WHEN 'Samedi' THEN 6 
                ELSE 7 END")
            ->orderBy('start_time')
            ->get();

        return response()->json($slots);
    }

    /**
     * Create a new timetable slot
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'module_id' => 'required|exists:modules,id',
            'room_id' => 'required|exists:rooms,id',
            'day' => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'start_time' => 'required|string|regex:/^\d{2}:\d{2}(:\d{2})?$/',
            'end_time' => 'required|string|regex:/^\d{2}:\d{2}(:\d{2})?$/',
        ]);

        // Ensure time format is HH:MM:SS
        $validated['start_time'] = strlen($validated['start_time']) === 5 ? $validated['start_time'] . ':00' : $validated['start_time'];
        $validated['end_time'] = strlen($validated['end_time']) === 5 ? $validated['end_time'] . ':00' : $validated['end_time'];

        $overlapError = $this->checkOverlap(
            $validated['group_id'],
            $validated['module_id'],
            $validated['room_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time']
        );

        if ($overlapError) {
            return response()->json(['message' => $overlapError], 422);
        }

        $slot = Timetable::create($validated);

        return response()->json([
            'message' => 'Créneau horaire ajouté avec succès.',
            'slot' => $slot->load(['module.professor', 'room', 'group'])
        ], 201);
    }

    /**
     * Update an existing timetable slot
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $slot = Timetable::findOrFail($id);

        $validated = $request->validate([
            'group_id' => 'required|exists:groups,id',
            'module_id' => 'required|exists:modules,id',
            'room_id' => 'required|exists:rooms,id',
            'day' => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'start_time' => 'required|string|regex:/^\d{2}:\d{2}(:\d{2})?$/',
            'end_time' => 'required|string|regex:/^\d{2}:\d{2}(:\d{2})?$/',
        ]);

        // Ensure time format is HH:MM:SS
        $validated['start_time'] = strlen($validated['start_time']) === 5 ? $validated['start_time'] . ':00' : $validated['start_time'];
        $validated['end_time'] = strlen($validated['end_time']) === 5 ? $validated['end_time'] . ':00' : $validated['end_time'];

        $overlapError = $this->checkOverlap(
            $validated['group_id'],
            $validated['module_id'],
            $validated['room_id'],
            $validated['day'],
            $validated['start_time'],
            $validated['end_time'],
            $slot->id
        );

        if ($overlapError) {
            return response()->json(['message' => $overlapError], 422);
        }

        $slot->update($validated);

        return response()->json([
            'message' => 'Créneau horaire mis à jour avec succès.',
            'slot' => $slot->load(['module.professor', 'room', 'group'])
        ]);
    }

    /**
     * Delete a timetable slot
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $slot = Timetable::findOrFail($id);
        $slot->delete();

        return response()->json(['message' => 'Créneau horaire supprimé avec succès.']);
    }

    /**
     * Clear timetable for a specific group
     */
    public function clear(Request $request, $groupId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        Timetable::where('group_id', $groupId)->delete();

        return response()->json(['message' => "Emploi du temps de la classe vidé avec succès."]);
    }

    /**
     * Generate timetable via NVIDIA LLM API
     */
    public function generate(Request $request, NvidiaLlmService $llmService)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'group_id' => 'required|exists:groups,id'
        ]);

        $groupId = $request->group_id;
        $group = Group::findOrFail($groupId);

        // Fetch modules associated with the group's field/filière
        $modules = Module::whereHas('fields', function ($q) use ($group) {
            $q->where('fields.id', $group->field_id);
        })->get();

        if ($modules->isEmpty()) {
            return response()->json(['message' => 'Aucune matière (module) n\'est configurée pour la filière de cette classe.'], 422);
        }

        // Fetch all rooms
        $rooms = Room::all();
        if ($rooms->isEmpty()) {
            return response()->json(['message' => 'Aucune salle de classe n\'est configurée dans le système.'], 422);
        }

        // Fetch existing slots for other groups to avoid conflicts
        $existingSlots = Timetable::with('module')
            ->where('group_id', '!=', $groupId)
            ->get()
            ->map(function ($slot) {
                return [
                    'day' => $slot->day,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'room_id' => $slot->room_id,
                    'professor_id' => $slot->module?->professor_id,
                    'group_id' => $slot->group_id
                ];
            })->toArray();

        try {
            // Prepare inputs for Llama 3
            $groupInput = [
                'id' => $group->id,
                'name' => $group->name,
                'field_id' => $group->field_id,
                'level' => $group->level,
                'default_room_id' => $group->room_id
            ];

            $modulesInput = $modules->map(function ($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'code' => $m->code,
                    'professor_id' => $m->professor_id,
                    'professor_name' => $m->professor?->name
                ];
            })->toArray();

            $roomsInput = $rooms->map(function ($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name
                ];
            })->toArray();

            // Run NVIDIA LLM Timetable Planner
            $slots = $llmService->generateTimetable($groupInput, $modulesInput, $roomsInput, $existingSlots);

            // Save slots in a transaction
            DB::transaction(function () use ($groupId, $slots) {
                // Delete old timetable for this group
                Timetable::where('group_id', $groupId)->delete();

                $daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

                foreach ($slots as $slot) {
                    $moduleExists = Module::where('id', $slot['module_id'])->exists();
                    $roomExists = Room::where('id', $slot['room_id'])->exists();

                    if ($moduleExists && $roomExists && in_array($slot['day'], $daysOfWeek)) {
                        // Ensure time format is HH:MM:SS
                        $start = strlen($slot['start_time']) === 5 ? $slot['start_time'] . ':00' : $slot['start_time'];
                        $end = strlen($slot['end_time']) === 5 ? $slot['end_time'] . ':00' : $slot['end_time'];

                        Timetable::create([
                            'group_id' => $groupId,
                            'module_id' => $slot['module_id'],
                            'room_id' => $slot['room_id'],
                            'day' => $slot['day'],
                            'start_time' => $start,
                            'end_time' => $end,
                        ]);
                    }
                }
            });

            // Return the newly created timetable list
            $newTimetable = Timetable::with(['module.professor', 'room', 'group'])
                ->where('group_id', $groupId)
                ->orderByRaw("CASE day 
                        WHEN 'Lundi' THEN 1 
                        WHEN 'Mardi' THEN 2 
                        WHEN 'Mercredi' THEN 3 
                        WHEN 'Jeudi' THEN 4 
                        WHEN 'Vendredi' THEN 5 
                        WHEN 'Samedi' THEN 6 
                        ELSE 7 END")
                ->orderBy('start_time')
                ->get();

            return response()->json([
                'message' => 'L\'emploi du temps a été planifié automatiquement par l\'IA avec succès.',
                'timetable' => $newTimetable
            ]);

        } catch (\Exception $e) {
            Log::error("Timetable AI generation failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Échec de la planification par l\'IA : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publish timetable slots for one or all classes
     */
    public function publish(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $groupId = $request->input('group_id');
        $publishAll = $request->input('publish_all', false);

        if ($publishAll) {
            Timetable::query()->update(['is_published' => true]);
            return response()->json([
                'message' => 'Tous les emplois du temps ont été publiés avec succès.'
            ]);
        }

        if (!$groupId) {
            return response()->json([
                'message' => 'L\'identifiant de la classe (group_id) est requis pour cette publication.'
            ], 422);
        }

        $group = Group::findOrFail($groupId);
        Timetable::where('group_id', $groupId)->update(['is_published' => true]);

        return response()->json([
            'message' => 'L\'emploi du temps de la classe "' . $group->name . '" a été publié avec succès.'
        ]);
    }

    /**
     * Helper to verify timetable overlaps
     */
    private function checkOverlap($groupId, $moduleId, $roomId, $day, $startTime, $endTime, $ignoreId = null)
    {
        $professorId = Module::where('id', $moduleId)->value('professor_id');

        // Helper overlap query structure
        $overlapCallback = function ($query) use ($startTime, $endTime) {
            $query->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<=', $startTime)
                  ->where('end_time', '>', $startTime);
            })->orWhere(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>=', $endTime);
            })->orWhere(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '>=', $startTime)
                  ->where('end_time', '<=', $endTime);
            });
        };

        // 1. Group Busy Check
        $groupOverlap = Timetable::where('day', $day)
            ->where('group_id', $groupId)
            ->where($overlapCallback);

        // 2. Room Busy Check
        $roomOverlap = Timetable::where('day', $day)
            ->where('room_id', $roomId)
            ->where($overlapCallback);

        // 3. Professor Busy Check
        $profOverlap = null;
        if ($professorId) {
            $profOverlap = Timetable::where('day', $day)
                ->whereHas('module', function ($q) use ($professorId) {
                    $q->where('professor_id', $professorId);
                })
                ->where($overlapCallback);
        }

        if ($ignoreId) {
            $groupOverlap->where('id', '!=', $ignoreId);
            $roomOverlap->where('id', '!=', $ignoreId);
            if ($profOverlap) {
                $profOverlap->where('id', '!=', $ignoreId);
            }
        }

        if ($groupOverlap->exists()) {
            return "Ce groupe a déjà un cours prévu sur cette plage horaire.";
        }

        if ($roomOverlap->exists()) {
            return "Cette salle est déjà occupée sur cette plage horaire.";
        }

        if ($profOverlap && $profOverlap->exists()) {
            return "Le professeur assigné à ce module a déjà un autre cours prévu sur cette plage horaire.";
        }

        return null;
    }
}

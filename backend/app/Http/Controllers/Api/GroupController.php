<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GroupController extends Controller
{
    /**
     * Display a listing of the groups.
     */
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $query = Group::with(['field', 'room'])->withCount('studentProfiles');

        if ($request->filled('field_id')) {
            $query->where('field_id', $request->field_id);
        }

        $groups = $query->orderBy('name', 'asc')->get();

        return response()->json($groups);
    }

    /**
     * Store a newly created group in database.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,name',
            'level' => 'required|integer|min:1|max:5',
            'academic_year' => 'required|string|max:50',
            'room_id' => [
                'nullable',
                'exists:rooms,id',
                Rule::unique('groups', 'room_id')->where(function ($query) use ($request) {
                    return $query->where('academic_year', $request->academic_year);
                })
            ],
            'field_id' => 'required|exists:fields,id',
        ]);

        $group = Group::create($validated);

        return response()->json([
            'message' => 'Groupe créé avec succès.',
            'group' => $group->load(['field', 'room'])->loadCount('studentProfiles')
        ], 201);
    }

    /**
     * Update the specified group in database.
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $group = Group::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:groups,name,' . $group->id,
            'level' => 'required|integer|min:1|max:5',
            'academic_year' => 'required|string|max:50',
            'room_id' => [
                'nullable',
                'exists:rooms,id',
                Rule::unique('groups', 'room_id')->where(function ($query) use ($request) {
                    return $query->where('academic_year', $request->academic_year);
                })->ignore($group->id)
            ],
            'field_id' => 'required|exists:fields,id',
        ]);

        $group->update($validated);

        return response()->json([
            'message' => 'Groupe modifié avec succès.',
            'group' => $group->load(['field', 'room'])->loadCount('studentProfiles')
        ]);
    }

    /**
     * Remove the specified group from database.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $group = Group::findOrFail($id);
        $group->delete();

        return response()->json([
            'message' => 'Groupe supprimé avec succès.'
        ]);
    }

    /**
     * Get list of classrooms for selection dropdown.
     */
    public function getRooms(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return response()->json(Room::all());
    }

    /**
     * Get students enrolled in a group.
     */
    public function getStudents(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $group = Group::findOrFail($id);

        $students = \App\Models\StudentProfile::with('user')
            ->where('group_id', $group->id)
            ->get()
            ->map(function ($profile) {
                if (!$profile->user) return null;
                return [
                    'id' => $profile->user->id,
                    'name' => $profile->user->first_name . ' ' . $profile->user->last_name,
                    'first_name' => $profile->user->first_name,
                    'last_name' => $profile->user->last_name,
                    'email' => $profile->user->email,
                    'cne' => $profile->cne,
                    'level' => $profile->level,
                    'enrollment_year' => $profile->enrollment_year,
                ];
            })
            ->filter()
            ->values();

        return response()->json($students);
    }

    /**
     * Split students of a promotion (field + level) into alphabetical groups.
     */
    public function splitPromotion(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'field_id' => 'required|exists:fields,id',
            'level' => 'required|integer|min:1|max:5',
            'number_of_groups' => 'required|integer|min:2|max:10',
            'academic_year' => 'required|string|max:50',
            'group_prefix' => 'nullable|string|max:50',
        ]);

        $fieldId = $validated['field_id'];
        $level = $validated['level'];
        $numberOfGroups = $validated['number_of_groups'];
        $academicYear = $validated['academic_year'];

        $field = \App\Models\Field::findOrFail($fieldId);
        $groupPrefix = $validated['group_prefix'] ?? ($field->code . '-' . $level);

        $profiles = \App\Models\StudentProfile::join('users', 'student_profiles.user_id', '=', 'users.id')
            ->where('student_profiles.field_id', $fieldId)
            ->where('student_profiles.level', $level)
            ->orderBy('users.last_name', 'asc')
            ->orderBy('users.first_name', 'asc')
            ->select('student_profiles.*')
            ->get();

        $totalStudents = $profiles->count();
        if ($totalStudents === 0) {
            return response()->json(['message' => 'Aucun étudiant trouvé pour cette filière et ce niveau.'], 422);
        }

        $groups = [];
        for ($i = 0; $i < $numberOfGroups; $i++) {
            $suffix = chr(65 + $i);
            $groupName = $groupPrefix . $suffix;

            $group = Group::firstOrCreate(
                [
                    'name' => $groupName,
                    'field_id' => $fieldId,
                    'level' => $level,
                    'academic_year' => $academicYear,
                ]
            );
            $groups[] = $group;
        }

        // Partition
        $chunkSize = floor($totalStudents / $numberOfGroups);
        $remainder = $totalStudents % $numberOfGroups;

        $studentIndex = 0;
        for ($i = 0; $i < $numberOfGroups; $i++) {
            $group = $groups[$i];
            $currentGroupSize = $chunkSize + ($i < $remainder ? 1 : 0);

            for ($j = 0; $j < $currentGroupSize; $j++) {
                if ($studentIndex < $totalStudents) {
                    $profile = $profiles[$studentIndex];
                    $profile->group_id = $group->id;
                    $profile->save();
                    $studentIndex++;
                }
            }
        }

        return response()->json([
            'message' => 'La promotion a été divisée avec succès.',
            'groups' => Group::with(['field', 'room'])->withCount('studentProfiles')->where('field_id', $fieldId)->where('level', $level)->get()
        ]);
    }
}
